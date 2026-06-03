import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  getLlmConfig,
  getSystemConfig,
  saveLlmConfig,
  setSystemConfig,
  testLlmConfig,
  type LlmProvider,
  type LlmTestResult,
  type SaveLlmAdminConfig,
} from '../services/systemAdminApi';

function LlmTestResultPanel({
  result,
  loading,
}: {
  result: LlmTestResult | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Đang gửi ping tới API…
      </p>
    );
  }
  if (!result) return null;

  const boxClass = result.ok
    ? 'border-emerald-500/40 bg-emerald-500/5'
    : 'border-destructive/40 bg-destructive/5';

  return (
    <div className={`rounded-lg border p-3 text-sm ${boxClass}`}>
      <p className="font-medium">
        {result.ok ? 'Kết nối OK' : 'Thất bại'} · {result.provider} · {result.model}
        {result.latencyMs > 0 ? ` · ${result.latencyMs}ms` : ''}
      </p>
      {result.reply ? (
        <p className="mt-2 break-words text-muted-foreground">
          <span className="font-medium text-foreground">Phản hồi:</span> {result.reply}
        </p>
      ) : null}
      {result.error ? (
        <p className="mt-2 break-words text-destructive">{result.error}</p>
      ) : null}
    </div>
  );
}

export function ConfigAdminView() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [threshold, setThreshold] = useState('70');

  const [llmProvider, setLlmProvider] = useState<LlmProvider>('gemini');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiApiKeyPreview, setGeminiApiKeyPreview] = useState<string | null>(null);
  const [geminiApiKeySet, setGeminiApiKeySet] = useState(false);
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('https://agentrouter.org/v1');
  const [openaiModel, setOpenaiModel] = useState('claude-opus-4-6');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiApiKeyPreview, setOpenaiApiKeyPreview] = useState<string | null>(null);
  const [openaiApiKeySet, setOpenaiApiKeySet] = useState(false);
  const [temperature, setTemperature] = useState('0.4');
  const [llmSaving, setLlmSaving] = useState(false);
  const [geminiTesting, setGeminiTesting] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<LlmTestResult | null>(null);
  const [agentTesting, setAgentTesting] = useState(false);
  const [agentTestResult, setAgentTestResult] = useState<LlmTestResult | null>(null);

  useEffect(() => {
    Promise.all([getSystemConfig(), getLlmConfig()])
      .then(([c, llm]) => {
        setConfig(c);
        setThreshold(c.default_pass_threshold ?? '70');
        setLlmProvider(llm.provider);
        setGeminiModel(llm.geminiModel);
        setGeminiApiKeyPreview(llm.geminiApiKeyPreview);
        setGeminiApiKeySet(llm.geminiApiKeySet);
        setOpenaiBaseUrl(llm.openaiBaseUrl);
        setOpenaiModel(llm.openaiModel);
        setOpenaiApiKeyPreview(llm.openaiApiKeyPreview);
        setOpenaiApiKeySet(llm.openaiApiKeySet);
        setTemperature(llm.temperature);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, []);

  async function saveThreshold() {
    try {
      await setSystemConfig('default_pass_threshold', threshold);
      toast.success('Đã lưu');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  async function runGeminiTest() {
    setGeminiTesting(true);
    setGeminiTestResult(null);
    try {
      const result = await testLlmConfig({
        testProvider: 'gemini',
        geminiModel,
        geminiApiKey: geminiApiKey.trim() || undefined,
        temperature,
      });
      setGeminiTestResult(result);
      if (result.ok) toast.success(`Gemini OK (${result.latencyMs}ms)`);
      else toast.error(result.error ?? 'Gemini test failed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setGeminiTesting(false);
    }
  }

  async function runAgentTest() {
    setAgentTesting(true);
    setAgentTestResult(null);
    try {
      const result = await testLlmConfig({
        testProvider: 'agent_router',
        openaiBaseUrl,
        openaiModel,
        openaiApiKey: openaiApiKey.trim() || undefined,
        temperature,
      });
      setAgentTestResult(result);
      if (result.ok) toast.success(`Agent Router OK (${result.latencyMs}ms)`);
      else toast.error(result.error ?? 'Agent Router test failed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setAgentTesting(false);
    }
  }

  async function saveLlm() {
    setLlmSaving(true);
    const body: SaveLlmAdminConfig = {
      provider: llmProvider,
      geminiModel,
      openaiBaseUrl,
      openaiModel,
      temperature,
    };
    if (geminiApiKey.trim()) {
      body.geminiApiKey = geminiApiKey.trim();
    }
    if (openaiApiKey.trim()) {
      body.openaiApiKey = openaiApiKey.trim();
    }
    try {
      await saveLlmConfig(body);
      setGeminiApiKey('');
      setOpenaiApiKey('');
      const refreshed = await getLlmConfig();
      setGeminiApiKeyPreview(refreshed.geminiApiKeyPreview);
      setGeminiApiKeySet(refreshed.geminiApiKeySet);
      setOpenaiApiKeyPreview(refreshed.openaiApiKeyPreview);
      setOpenaiApiKeySet(refreshed.openaiApiKeySet);
      toast.success('Đã lưu cấu hình LLM');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setLlmSaving(false);
    }
  }

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Cấu hình hệ thống</h1>

      <section className="mt-8 max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">MiniTest</h2>
        <label className="text-sm font-medium">Pass threshold (%)</label>
        <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        <Button onClick={saveThreshold}>Lưu</Button>
      </section>

      <section className="mt-10 max-w-xl space-y-4 rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold">LLM (Gemini / Agent Router)</h2>
        <p className="text-sm text-muted-foreground">
          API key lưu trên server, chỉ hiển thị 6 ký tự cuối sau khi lưu. Để trống ô key nếu không
          đổi.
        </p>

        <label className="text-sm font-medium">Nhà cung cấp</label>
        <select
          className={selectClass}
          value={llmProvider}
          onChange={(e) => setLlmProvider(e.target.value as LlmProvider)}
        >
          <option value="gemini">Google Gemini</option>
          <option value="agent_router">Agent Router (OpenAI-compatible)</option>
        </select>

        {llmProvider === 'gemini' ? (
          <>
            <label className="text-sm font-medium">Gemini model</label>
            <Input
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              placeholder="gemini-2.5-flash"
              list="gemini-models"
            />
            <datalist id="gemini-models">
              <option value="gemini-2.5-flash" />
              <option value="gemini-2.5-flash-lite" />
              <option value="gemini-flash-latest" />
              <option value="gemini-2.0-flash" />
            </datalist>
            <label className="text-sm font-medium">Gemini API key</label>
            {geminiApiKeySet && geminiApiKeyPreview ? (
              <p className="text-xs text-muted-foreground">
                Đã lưu: {geminiApiKeyPreview} — nhập key mới để thay thế
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Lấy tại Google AI Studio. Nếu trống, dùng GEMINI_API_KEY trong .env ai-server.
              </p>
            )}
            <Input
              type="password"
              autoComplete="off"
              placeholder="AIza..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={runGeminiTest}
              disabled={geminiTesting}
            >
              {geminiTesting ? 'Đang kiểm tra…' : 'Kiểm tra Gemini'}
            </Button>
            <LlmTestResultPanel result={geminiTestResult} loading={geminiTesting} />
          </>
        ) : (
          <>
            <label className="text-sm font-medium">Base URL</label>
            <Input value={openaiBaseUrl} onChange={(e) => setOpenaiBaseUrl(e.target.value)} />
            <label className="text-sm font-medium">Model</label>
            <Input
              value={openaiModel}
              onChange={(e) => setOpenaiModel(e.target.value)}
              placeholder="claude-opus-4-6"
              list="agentrouter-models"
            />
            <datalist id="agentrouter-models">
              <option value="claude-opus-4-6" />
              <option value="claude-haiku-4-5-20251001" />
              <option value="glm-4.6" />
              <option value="deepseek-v3.1" />
            </datalist>
            <p className="text-xs text-muted-foreground">
              AgentRouter chặn client lạ — server tự gửi header Claude Code. Key lấy tại{' '}
              <a
                href="https://agentrouter.org/console/token"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                console/token
              </a>
              . Nếu vẫn &quot;unauthorized client&quot;, dùng Gemini hoặc API DeepSeek/OpenAI
              trực tiếp.
            </p>
            <label className="text-sm font-medium">API key</label>
            {openaiApiKeySet && openaiApiKeyPreview ? (
              <p className="text-xs text-muted-foreground">
                Đã lưu: {openaiApiKeyPreview} — nhập key mới để thay thế
              </p>
            ) : null}
            <Input
              type="password"
              autoComplete="off"
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={runAgentTest}
              disabled={agentTesting}
            >
              {agentTesting ? 'Đang kiểm tra…' : 'Kiểm tra Agent Router'}
            </Button>
            <LlmTestResultPanel result={agentTestResult} loading={agentTesting} />
          </>
        )}

        <label className="text-sm font-medium">Temperature</label>
        <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} />

        <Button onClick={saveLlm} disabled={llmSaving}>
          {llmSaving ? 'Đang lưu…' : 'Lưu cấu hình LLM'}
        </Button>
      </section>

      <details className="mt-10 max-w-xl">
        <summary className="cursor-pointer text-sm text-muted-foreground">Raw system config</summary>
        <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </div>
  );
}
