import net from 'node:net';
import tls from 'node:tls';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SmtpSocket = net.Socket | tls.TLSSocket;

function isSmtpConfigured() {
  return Boolean(env.smtpHost.trim());
}

function encodeHeader(value: string) {
  return /[^\x00-\x7F]/.test(value)
    ? `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
    : value;
}

function normalizeAddress(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const match = trimmed.match(/<([^>]+)>/);
  return match?.[1]?.trim() ?? trimmed;
}

function escapeDataLine(value: string) {
  return value
    .replace(/\r?\n/g, '\r\n')
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n');
}

function buildMessage(input: SendMailInput) {
  const from = env.smtpFrom;
  const boundary = `nihongocoach-${Date.now().toString(36)}`;
  const headers = [
    `From: ${from}`,
    `To: ${input.to}`,
    `Subject: ${encodeHeader(input.subject)}`,
    'MIME-Version: 1.0',
  ];

  if (!input.html) {
    return [
      ...headers,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      escapeDataLine(input.text),
    ].join('\r\n');
  }

  return [
    ...headers,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    escapeDataLine(input.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    escapeDataLine(input.html),
    `--${boundary}--`,
  ].join('\r\n');
}

function readResponse(socket: SmtpSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1);
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buffer);
      }
    };
    socket.on('data', onData);
    socket.once('error', onError);
  });
}

async function expectResponse(socket: SmtpSocket, okCodes: number[]) {
  const response = await readResponse(socket);
  const code = Number(response.slice(0, 3));
  if (!okCodes.includes(code)) {
    throw new Error(response.trim());
  }
  return response;
}

async function command(socket: SmtpSocket, value: string, okCodes: number[]) {
  socket.write(`${value}\r\n`);
  return expectResponse(socket, okCodes);
}

function connectSmtp(): Promise<SmtpSocket> {
  return new Promise((resolve, reject) => {
    const connectOptions = {
      host: env.smtpHost,
      port: env.smtpPort,
      servername: env.smtpHost,
    };
    const socket = env.smtpSecure
      ? tls.connect(connectOptions)
      : net.connect(connectOptions);
    socket.setTimeout(20_000);
    socket.once('connect', () => resolve(socket));
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out'));
    });
    socket.once('error', reject);
  });
}

async function upgradeStartTls(socket: SmtpSocket): Promise<SmtpSocket> {
  await command(socket, 'STARTTLS', [220]);
  return tls.connect({
    socket,
    servername: env.smtpHost,
  });
}

async function smtpSend(input: SendMailInput) {
  let socket = await connectSmtp();
  try {
    await expectResponse(socket, [220]);
    await command(socket, `EHLO ${env.smtpHost || 'localhost'}`, [250]);
    if (!env.smtpSecure && env.smtpStartTls) {
      socket = await upgradeStartTls(socket);
      await command(socket, `EHLO ${env.smtpHost || 'localhost'}`, [250]);
    }
    if (env.smtpUser || env.smtpPass) {
      await command(socket, 'AUTH LOGIN', [334]);
      await command(socket, Buffer.from(env.smtpUser).toString('base64'), [334]);
      await command(socket, Buffer.from(env.smtpPass).toString('base64'), [235]);
    }
    await command(socket, `MAIL FROM:<${normalizeAddress(env.smtpFrom)}>`, [250]);
    await command(socket, `RCPT TO:<${normalizeAddress(input.to)}>`, [250, 251]);
    await command(socket, 'DATA', [354]);
    socket.write(`${buildMessage(input)}\r\n.\r\n`);
    await expectResponse(socket, [250]);
    await command(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
}

export async function sendMail(input: SendMailInput) {
  if (!isSmtpConfigured()) {
    if (env.nodeEnv !== 'production') {
      console.log(`[email:dev] To: ${input.to}`);
      console.log(`[email:dev] Subject: ${input.subject}`);
      console.log(input.text);
      return { sent: false, dev: true };
    }
    throw new AppError('SMTP is not configured', 503, 'EMAIL_UNAVAILABLE');
  }

  await smtpSend(input);
  return { sent: true, dev: false };
}
