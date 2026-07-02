import { beforeEach, describe, expect, it, vi } from 'vitest';

const testEnv = {
  nodeEnv: 'test',
  registrationOtpTtlSeconds: 600,
  registrationOtpVerifyTokenTtlSeconds: 900,
  registrationOtpResendCooldownSeconds: 60,
  registrationOtpMaxAttempts: 3,
};

function createRedisMock() {
  const store = new Map<string, string>();
  const redis = {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    setex: vi.fn(async (key: string, _ttlSeconds: number, value: string) => {
      store.set(key, value);
      return 'OK';
    }),
    incr: vi.fn(async () => 0),
    expire: vi.fn(async () => 0),
    smembers: vi.fn(async () => [] as string[]),
    srem: vi.fn(async () => 0),
    sadd: vi.fn(async () => 0),
    del: vi.fn(async (key: string) => (store.delete(key) ? 1 : 0)),
  };

  return { redis, store };
}

async function loadService() {
  vi.resetModules();
  vi.spyOn(console, 'log').mockImplementation(() => undefined);

  const findUnique = vi.fn(async (): Promise<{ id: string } | null> => null);
  const db = {
    user: {
      findUnique,
    },
  };
  const { redis, store } = createRedisMock();
  const sendMail = vi.fn(async () => ({ sent: false, dev: true }));

  vi.doMock('../config/db.js', () => ({ db }));
  vi.doMock('../config/redis.js', () => ({ redis }));
  vi.doMock('../config/env.js', () => ({ env: testEnv }));
  vi.doMock('./email.service.js', () => ({ sendMail }));

  const service = await import('./registration-otp.service.js');
  return { service, db, redis, store, sendMail };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('registration OTP service', () => {
  it('sends an OTP and verifies it into a one-time registration token', async () => {
    const { service, sendMail, store } = await loadService();

    const sent = await service.sendRegistrationOtp(' New.User@Example.COM ');

    expect(sent).toMatchObject({
      message: 'Registration OTP has been sent.',
      expiresInSeconds: testEnv.registrationOtpTtlSeconds,
      resendCooldownSeconds: testEnv.registrationOtpResendCooldownSeconds,
      emailSent: false,
    });
    const devOtp = sent.devOtp;
    expect(devOtp).toMatch(/^\d{6}$/);
    if (!devOtp) throw new Error('Expected dev OTP in test env');
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new.user@example.com',
        subject: 'NihongoCoach registration OTP',
        text: expect.stringContaining(devOtp),
      }),
    );

    const verified = await service.verifyRegistrationOtp(
      'NEW.USER@example.com',
      devOtp,
    );

    expect(verified).toMatchObject({
      verified: true,
      email: 'new.user@example.com',
      expiresInSeconds: testEnv.registrationOtpVerifyTokenTtlSeconds,
    });
    expect(verified.emailVerificationToken).toMatch(/^[a-f0-9]{64}$/);
    expect(store.has('auth:register-otp:new.user@example.com')).toBe(false);

    await service.consumeRegistrationVerificationToken(
      'new.user@example.com',
      verified.emailVerificationToken,
    );
    await expect(
      service.consumeRegistrationVerificationToken(
        'new.user@example.com',
        verified.emailVerificationToken,
      ),
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED', statusCode: 400 });
  });

  it('blocks resend while the cooldown is active', async () => {
    const { service } = await loadService();

    await service.sendRegistrationOtp('cooldown@example.com');

    await expect(
      service.sendRegistrationOtp('cooldown@example.com'),
    ).rejects.toMatchObject({ code: 'OTP_COOLDOWN', statusCode: 429 });
  });

  it('tracks wrong attempts and expires the OTP at the attempt limit', async () => {
    const { service } = await loadService();

    const sent = await service.sendRegistrationOtp('attempts@example.com');
    const devOtp = sent.devOtp;
    expect(devOtp).toMatch(/^\d{6}$/);
    if (!devOtp) throw new Error('Expected dev OTP in test env');
    const wrongOtp = devOtp === '000000' ? '111111' : '000000';

    await expect(
      service.verifyRegistrationOtp('attempts@example.com', wrongOtp),
    ).rejects.toMatchObject({ code: 'INVALID_OTP', statusCode: 400 });
    await expect(
      service.verifyRegistrationOtp('attempts@example.com', wrongOtp),
    ).rejects.toMatchObject({ code: 'INVALID_OTP', statusCode: 400 });
    await expect(
      service.verifyRegistrationOtp('attempts@example.com', wrongOtp),
    ).rejects.toMatchObject({
      code: 'OTP_ATTEMPTS_EXCEEDED',
      statusCode: 400,
    });
    await expect(
      service.verifyRegistrationOtp('attempts@example.com', devOtp),
    ).rejects.toMatchObject({ code: 'INVALID_OTP', statusCode: 400 });
  });

  it('rejects OTP operations for an already registered email', async () => {
    const { service, db } = await loadService();
    db.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.sendRegistrationOtp('taken@example.com'),
    ).rejects.toMatchObject({ code: 'EMAIL_EXISTS', statusCode: 409 });
    await expect(
      service.verifyRegistrationOtp('taken@example.com', '123456'),
    ).rejects.toMatchObject({ code: 'EMAIL_EXISTS', statusCode: 409 });
  });
});
