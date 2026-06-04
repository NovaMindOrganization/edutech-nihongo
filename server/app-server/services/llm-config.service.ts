import axios from 'axios';

import { env } from '../config/env.js';
import { getConfigValue, getAllConfig, setConfig } from './config.service.js';

export const LLM_CONFIG_KEYS = {
  provider: 'llm_provider',
  geminiModel: 'llm_gemini_model',
  geminiApiKey: 'llm_gemini_api_key',
  openaiBaseUrl: 'llm_openai_base_url',
  openaiModel: 'llm_openai_model',
  openaiApiKey: 'llm_openai_api_key',
  temperature: 'llm_temperature',
} as const;

export type LlmProvider = 'gemini' | 'agent_router';

export type LlmRuntimePayload = {
  provider: LlmProvider;
  gemini_api_key: string | null;
  gemini_model: string;
  openai_api_key: string | null;
  openai_base_url: string;
  openai_model: string;
  temperature: number;
};

export type LlmAdminConfigView = {
  provider: LlmProvider;
  geminiModel: string;
  geminiApiKey: string;
  geminiApiKeySet: boolean;
  geminiApiKeyPreview: string | null;
  openaiBaseUrl: string;
  openaiModel: string;
  openaiApiKey: string;
  openaiApiKeySet: boolean;
  openaiApiKeyPreview: string | null;
  temperature: string;
};

function normalizeApiKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let trimmed = key.trim();
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    trimmed = trimmed.slice(7).trim();
  }
  return trimmed || undefined;
}

function maskApiKey(key: string | null | undefined): string | null {
  if (!key || key.length < 8) return null;
  return `••••${key.slice(-6)}`;
}

export async function getLlmRuntimePayload(): Promise<LlmRuntimePayload> {
  const providerRaw = await getConfigValue(LLM_CONFIG_KEYS.provider, 'gemini');
  const provider: LlmProvider =
    providerRaw === 'agent_router' ? 'agent_router' : 'gemini';

  const geminiModel = await getConfigValue(
    LLM_CONFIG_KEYS.geminiModel,
    process.env.LLM_GEMINI_MODEL ?? 'gemini-2.5-flash',
  );
  const openaiBaseUrl = await getConfigValue(
    LLM_CONFIG_KEYS.openaiBaseUrl,
    process.env.LLM_OPENAI_BASE_URL ?? 'https://agentrouter.org/v1',
  );
  const openaiModel = await getConfigValue(
    LLM_CONFIG_KEYS.openaiModel,
    process.env.LLM_OPENAI_MODEL ?? 'claude-opus-4-6',
  );
  const openaiApiKeyDb = await getConfigValue(LLM_CONFIG_KEYS.openaiApiKey, '');
  const openaiApiKey =
    openaiApiKeyDb.trim() ||
    process.env.LLM_OPENAI_API_KEY?.trim() ||
    process.env.AGENTROUTER_API_KEY?.trim() ||
    null;

  const geminiApiKeyDb = await getConfigValue(LLM_CONFIG_KEYS.geminiApiKey, '');
  const geminiApiKey =
    geminiApiKeyDb.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null;

  const temperature = Number(
    await getConfigValue(LLM_CONFIG_KEYS.temperature, '0.4'),
  );

  return {
    provider,
    gemini_api_key: geminiApiKey,
    gemini_model: geminiModel,
    openai_api_key: openaiApiKey,
    openai_base_url: openaiBaseUrl.replace(/\/$/, ''),
    openai_model: openaiModel,
    temperature: Number.isFinite(temperature) ? temperature : 0.4,
  };
}

export async function getLlmAdminConfig(): Promise<LlmAdminConfigView> {
  const configs = await getAllConfig();
  const providerRaw = configs[LLM_CONFIG_KEYS.provider] ?? 'gemini';
  const openaiApiKey = configs[LLM_CONFIG_KEYS.openaiApiKey] ?? '';
  const geminiApiKey = configs[LLM_CONFIG_KEYS.geminiApiKey] ?? '';

  return {
    provider: providerRaw === 'agent_router' ? 'agent_router' : 'gemini',
    geminiModel: configs[LLM_CONFIG_KEYS.geminiModel] ?? 'gemini-2.5-flash',
    geminiApiKey: '',
    geminiApiKeySet: Boolean(geminiApiKey.trim()),
    geminiApiKeyPreview: maskApiKey(geminiApiKey),
    openaiBaseUrl:
      configs[LLM_CONFIG_KEYS.openaiBaseUrl] ?? 'https://agentrouter.org/v1',
    openaiModel: configs[LLM_CONFIG_KEYS.openaiModel] ?? 'claude-opus-4-6',
    openaiApiKey: '',
    openaiApiKeySet: Boolean(openaiApiKey.trim()),
    openaiApiKeyPreview: maskApiKey(openaiApiKey),
    temperature: configs[LLM_CONFIG_KEYS.temperature] ?? '0.4',
  };
}

export async function saveLlmAdminConfig(input: {
  provider: LlmProvider;
  geminiModel: string;
  geminiApiKey?: string;
  openaiBaseUrl: string;
  openaiModel: string;
  openaiApiKey?: string;
  temperature: string;
}) {
  await setConfig(LLM_CONFIG_KEYS.provider, input.provider);
  await setConfig(LLM_CONFIG_KEYS.geminiModel, input.geminiModel.trim());
  await setConfig(LLM_CONFIG_KEYS.openaiBaseUrl, input.openaiBaseUrl.trim());
  await setConfig(LLM_CONFIG_KEYS.openaiModel, input.openaiModel.trim());
  await setConfig(LLM_CONFIG_KEYS.temperature, input.temperature.trim());

  const nextGeminiKey = input.geminiApiKey?.trim();
  if (nextGeminiKey) {
    await setConfig(LLM_CONFIG_KEYS.geminiApiKey, nextGeminiKey);
  }

  const nextKey = input.openaiApiKey?.trim();
  if (nextKey) {
    await setConfig(LLM_CONFIG_KEYS.openaiApiKey, nextKey);
  }
}

export type LlmTestDraft = {
  testProvider: LlmProvider;
  geminiModel?: string;
  geminiApiKey?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
  openaiApiKey?: string;
  temperature?: string;
};

export type LlmTestResult = {
  ok: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  reply: string | null;
  error: string | null;
};

async function resolveGeminiApiKey(draft?: string): Promise<string | null> {
  const normalized = normalizeApiKey(draft);
  if (normalized) return normalized;
  const db = await getConfigValue(LLM_CONFIG_KEYS.geminiApiKey, '');
  return (
    db.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null
  );
}

async function resolveOpenaiApiKey(draft?: string): Promise<string | null> {
  const normalized = normalizeApiKey(draft);
  if (normalized) return normalized;
  const db = await getConfigValue(LLM_CONFIG_KEYS.openaiApiKey, '');
  return (
    db.trim() ||
    process.env.LLM_OPENAI_API_KEY?.trim() ||
    process.env.AGENTROUTER_API_KEY?.trim() ||
    null
  );
}

export async function testLlmDraft(input: LlmTestDraft): Promise<LlmTestResult> {
  const saved = await getLlmRuntimePayload();
  const temperature = Number(input.temperature ?? String(saved.temperature));
  const llm_config: LlmRuntimePayload = {
    provider: input.testProvider,
    gemini_api_key: await resolveGeminiApiKey(input.geminiApiKey),
    gemini_model: input.geminiModel?.trim() || saved.gemini_model,
    openai_api_key: await resolveOpenaiApiKey(input.openaiApiKey),
    openai_base_url: (input.openaiBaseUrl?.trim() || saved.openai_base_url).replace(/\/$/, ''),
    openai_model: input.openaiModel?.trim() || saved.openai_model,
    temperature: Number.isFinite(temperature) ? temperature : saved.temperature,
  };

  try {
    const { data } = await axios.post<{
      ok: boolean;
      provider: string;
      model: string;
      latency_ms: number;
      reply?: string | null;
      error?: string | null;
    }>(
      `${env.aiServerUrl}/api/v1/llm/test`,
      { llm_config, test_provider: input.testProvider },
      { timeout: 90_000 },
    );
    return {
      ok: data.ok,
      provider: data.provider,
      model: data.model,
      latencyMs: data.latency_ms,
      reply: data.reply ?? null,
      error: data.error ?? null,
    };
  } catch (err) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? JSON.stringify(err.response.data)
        : err instanceof Error
          ? err.message
          : 'AI server unreachable';
    return {
      ok: false,
      provider: input.testProvider,
      model:
        input.testProvider === 'gemini'
          ? llm_config.gemini_model
          : llm_config.openai_model,
      latencyMs: 0,
      reply: null,
      error: message,
    };
  }
}
