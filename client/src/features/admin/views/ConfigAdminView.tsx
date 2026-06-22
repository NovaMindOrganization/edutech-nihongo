import { BookOpen, BrainCircuit, CreditCard, Gauge, ServerCog, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import {
  AdminPageShell,
  AdminSection,
  AdminStatPill,
} from '../components/admin-page-shell';
import {
  getLlmConfig,
  getSepayConfig,
  getSystemConfig,
  saveLlmConfig,
  saveSepayConfig,
  setSystemConfig,
  testLlmConfig,
  type LlmProvider,
  type LlmTestResult,
  type SaveLlmAdminConfig,
  type SaveSepayAdminConfig,
  type SepayAuthMode,
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
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [n4FreeAccess, setN4FreeAccess] = useState(false);

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
  const [ocrAgentRouterVisionModel, setOcrAgentRouterVisionModel] =
    useState('claude-opus-4-6');
  const [ocrGeminiFallbackModel, setOcrGeminiFallbackModel] =
    useState('gemini-2.5-flash-lite');
  const [llmSaving, setLlmSaving] = useState(false);
  const [geminiTesting, setGeminiTesting] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<LlmTestResult | null>(null);
  const [agentTesting, setAgentTesting] = useState(false);
  const [agentTestResult, setAgentTestResult] = useState<LlmTestResult | null>(null);

  const [sepayAuthMode, setSepayAuthMode] = useState<SepayAuthMode>('api_key');
  const [sepayApiKey, setSepayApiKey] = useState('');
  const [sepayApiKeyPreview, setSepayApiKeyPreview] = useState<string | null>(null);
  const [sepayApiKeySet, setSepayApiKeySet] = useState(false);
  const [sepayWebhookSecret, setSepayWebhookSecret] = useState('');
  const [sepayWebhookSecretPreview, setSepayWebhookSecretPreview] = useState<string | null>(null);
  const [sepayWebhookSecretSet, setSepayWebhookSecretSet] = useState(false);
  const [sepayAccountNumber, setSepayAccountNumber] = useState('');
  const [sepayAccountName, setSepayAccountName] = useState('');
  const [sepayBankName, setSepayBankName] = useState('Vietcombank');
  const [sepayBankBin, setSepayBankBin] = useState('970436');
  const [sepayPaymentCodePrefix, setSepayPaymentCodePrefix] = useState('NIHONGO');
  const [sepayOrderExpiryMinutes, setSepayOrderExpiryMinutes] = useState('30');
  const [sepayWebhookUrl, setSepayWebhookUrl] = useState('');
  const [sepaySaving, setSepaySaving] = useState(false);

  useEffect(() => {
    Promise.all([getSystemConfig(), getLlmConfig(), getSepayConfig()])
      .then(([c, llm, sepay]) => {
        setConfig(c);
        setThreshold(c.default_pass_threshold ?? '70');
        setMaintenanceMode(c.maintenance_mode === 'true');
        setN4FreeAccess(c.n4_free_access === 'true');
        setLlmProvider(llm.provider);
        setGeminiModel(llm.geminiModel);
        setGeminiApiKeyPreview(llm.geminiApiKeyPreview);
        setGeminiApiKeySet(llm.geminiApiKeySet);
        setOpenaiBaseUrl(llm.openaiBaseUrl);
        setOpenaiModel(llm.openaiModel);
        setOpenaiApiKeyPreview(llm.openaiApiKeyPreview);
        setOpenaiApiKeySet(llm.openaiApiKeySet);
        setTemperature(llm.temperature);
        setOcrAgentRouterVisionModel(llm.ocrAgentRouterVisionModel);
        setOcrGeminiFallbackModel(llm.ocrGeminiFallbackModel);
        setSepayAuthMode(sepay.authMode);
        setSepayApiKeyPreview(sepay.apiKeyPreview);
        setSepayApiKeySet(sepay.apiKeySet);
        setSepayWebhookSecretPreview(sepay.webhookSecretPreview);
        setSepayWebhookSecretSet(sepay.webhookSecretSet);
        setSepayAccountNumber(sepay.accountNumber);
        setSepayAccountName(sepay.accountName);
        setSepayBankName(sepay.bankName);
        setSepayBankBin(sepay.bankBin);
        setSepayPaymentCodePrefix(sepay.paymentCodePrefix);
        setSepayOrderExpiryMinutes(sepay.orderExpiryMinutes);
        setSepayWebhookUrl(sepay.webhookUrl);
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

  async function saveMaintenance(enabled: boolean) {
    try {
      await setSystemConfig('maintenance_mode', enabled ? 'true' : 'false');
      setMaintenanceMode(enabled);
      toast.success(enabled ? 'Đã bật chế độ bảo trì' : 'Đã tắt bảo trì');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  async function saveN4FreeAccess(enabled: boolean) {
    try {
      await setSystemConfig('n4_free_access', enabled ? 'true' : 'false');
      setN4FreeAccess(enabled);
      toast.success(
        enabled
          ? 'Đã mở ghi danh N4 miễn phí (tạm thời)'
          : 'Đã yêu cầu thanh toán để học N4',
      );
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

  async function saveSepay() {
    setSepaySaving(true);
    const body: SaveSepayAdminConfig = {
      authMode: sepayAuthMode,
      accountNumber: sepayAccountNumber,
      accountName: sepayAccountName,
      bankName: sepayBankName,
      bankBin: sepayBankBin,
      paymentCodePrefix: sepayPaymentCodePrefix,
      orderExpiryMinutes: sepayOrderExpiryMinutes,
    };
    if (sepayApiKey.trim()) body.apiKey = sepayApiKey.trim();
    if (sepayWebhookSecret.trim()) body.webhookSecret = sepayWebhookSecret.trim();

    try {
      const refreshed = await saveSepayConfig(body);
      setSepayApiKey('');
      setSepayWebhookSecret('');
      setSepayApiKeyPreview(refreshed.apiKeyPreview);
      setSepayApiKeySet(refreshed.apiKeySet);
      setSepayWebhookSecretPreview(refreshed.webhookSecretPreview);
      setSepayWebhookSecretSet(refreshed.webhookSecretSet);
      setSepayWebhookUrl(refreshed.webhookUrl);
      toast.success('Đã lưu cấu hình SePAY');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setSepaySaving(false);
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
      ocrAgentRouterVisionModel,
      ocrGeminiFallbackModel,
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
    'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm';
  const fieldLabel = 'text-sm font-bold text-foreground';

  return (
    <AdminPageShell
      title="Cấu hình hệ thống"
      description="MiniTest, bảo trì, thanh toán SePAY và provider LLM cho toàn nền tảng."
      icon={ServerCog}
      iconClassName="bg-brand-soft"
      tone="brand"
      chips={['MiniTest', 'SePAY', 'Gemini', 'Agent Router']}
      footer="Thay đổi LLM/SePAY có hiệu lực sau khi lưu — kiểm tra kết nối trước khi deploy."
      headerExtra={
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <AdminStatPill
              label="Bảo trì"
              value={maintenanceMode ? 'Bật' : 'Tắt'}
              accent={maintenanceMode ? 'quaternary' : 'default'}
            />
            <AdminStatPill label="LLM" value={llmProvider === 'gemini' ? 'Gemini' : 'Agent'} accent="brand" />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {maintenanceMode && (
              <Badge className="border-0 bg-amber-500/15 text-amber-700 dark:text-amber-400">
                Đang bảo trì
              </Badge>
            )}
            {n4FreeAccess && (
              <Badge className="border-0 bg-quaternary/30 text-quaternary-foreground">N4 miễn phí</Badge>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <AdminSection
            title="MiniTest"
            description="Ngưỡng điểm đạt mặc định cho bài kiểm tra nhanh."
            icon={Gauge}
            iconClassName="bg-secondary"
          >
            <label className={fieldLabel}>Pass threshold (%)</label>
            <div className="mt-2 flex gap-2">
              <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} />
              <Button onClick={saveThreshold}>Lưu</Button>
            </div>
          </AdminSection>

          <AdminSection
            title="Khóa học N4"
            description="Mở ghi danh N4 không cần mua gói — dùng tạm khi QA."
            icon={BookOpen}
            iconClassName="bg-quaternary"
            tone={n4FreeAccess ? 'brand' : 'default'}
          >
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={n4FreeAccess}
                onChange={(e) => void saveN4FreeAccess(e.target.checked)}
              />
              Mở ghi danh N4 miễn phí (tạm thời)
            </label>
          </AdminSection>

          <AdminSection
            title="Bảo trì"
            description="API trả 503 cho học viên; admin và đăng nhập vẫn hoạt động."
            icon={Wrench}
            iconClassName="bg-tertiary"
            tone={maintenanceMode ? 'warning' : 'default'}
          >
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => void saveMaintenance(e.target.checked)}
              />
              Chế độ bảo trì
            </label>
          </AdminSection>
        </div>

        <AdminSection
          title="SePAY — Thanh toán chuyển khoản"
          description="API Key từ SePay (Webhook → Phương thức xác thực). Header: Authorization: Apikey YOUR_KEY"
          icon={CreditCard}
          iconClassName="bg-secondary"
        >

        <label className={fieldLabel}>Webhook URL (dán vào SePay)</label>
        <Input readOnly value={sepayWebhookUrl} className="font-mono text-xs" />

        <label className={fieldLabel}>Phương thức xác thực webhook</label>
        <select
          className={selectClass}
          value={sepayAuthMode}
          onChange={(e) => setSepayAuthMode(e.target.value as SepayAuthMode)}
        >
          <option value="api_key">API Key (khuyến nghị)</option>
          <option value="hmac">HMAC-SHA256</option>
          <option value="none">Không xác thực (chỉ dev)</option>
        </select>

        {sepayAuthMode === 'api_key' && (
          <>
            <label className={fieldLabel}>SePAY API Key</label>
            {sepayApiKeySet && sepayApiKeyPreview ? (
              <p className="text-xs text-muted-foreground">
                Đã lưu: {sepayApiKeyPreview} — nhập key mới để thay thế
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Lấy khi tạo webhook trên SePay. Key phải khớp với cấu hình webhook.
              </p>
            )}
            <Input
              type="password"
              autoComplete="off"
              placeholder="Apikey từ SePay"
              value={sepayApiKey}
              onChange={(e) => setSepayApiKey(e.target.value)}
            />
          </>
        )}

        {sepayAuthMode === 'hmac' && (
          <>
            <label className={fieldLabel}>Secret Key (HMAC)</label>
            {sepayWebhookSecretSet && sepayWebhookSecretPreview ? (
              <p className="text-xs text-muted-foreground">
                Đã lưu: {sepayWebhookSecretPreview} — nhập secret mới để thay thế
              </p>
            ) : null}
            <Input
              type="password"
              autoComplete="off"
              value={sepayWebhookSecret}
              onChange={(e) => setSepayWebhookSecret(e.target.value)}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>Số tài khoản</label>
            <Input
              value={sepayAccountNumber}
              onChange={(e) => setSepayAccountNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Chủ tài khoản</label>
            <Input value={sepayAccountName} onChange={(e) => setSepayAccountName(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Tên ngân hàng</label>
            <Input value={sepayBankName} onChange={(e) => setSepayBankName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Mã BIN (VietQR)</label>
            <Input value={sepayBankBin} onChange={(e) => setSepayBankBin(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Tiền tố mã CK</label>
            <Input
              value={sepayPaymentCodePrefix}
              onChange={(e) => setSepayPaymentCodePrefix(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Hết hạn đơn (phút)</label>
            <Input
              value={sepayOrderExpiryMinutes}
              onChange={(e) => setSepayOrderExpiryMinutes(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={saveSepay} disabled={sepaySaving}>
          {sepaySaving ? 'Đang lưu…' : 'Lưu cấu hình SePAY'}
        </Button>
        </AdminSection>

        <AdminSection
          title="LLM (Gemini / Agent Router)"
          description="Provider mặc định cho Speaking, OCR, Chat, Quiz… API key lưu server — chỉ hiện 6 ký tự cuối."
          icon={BrainCircuit}
          iconClassName="bg-brand-soft"
          tone="brand"
        >

        <fieldset className="space-y-2">
          <legend className={fieldLabel}>Provider hệ thống</legend>
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
              llmProvider === 'gemini' ? 'border-brand bg-brand-soft/30' : 'border-border bg-background',
            )}
          >
            <input
              type="radio"
              name="llm-system-provider"
              className="mt-1"
              checked={llmProvider === 'gemini'}
              onChange={() => setLlmProvider('gemini')}
            />
            <span>
              <span className="font-medium">Google Gemini</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Dùng cho OCR viết tay, Speaking, giải thích bài…
              </span>
            </span>
          </label>
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
              llmProvider === 'agent_router' ? 'border-brand bg-brand-soft/30' : 'border-border bg-background',
            )}
          >
            <input
              type="radio"
              name="llm-system-provider"
              className="mt-1"
              checked={llmProvider === 'agent_router'}
              onChange={() => setLlmProvider('agent_router')}
            />
            <span>
              <span className="font-medium">Agent Router (OpenAI-compatible)</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Claude / GLM / DeepSeek qua AgentRouter — hỗ trợ vision OCR
              </span>
            </span>
          </label>
        </fieldset>

        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold">Google Gemini</h3>
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
        </div>

        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold">Agent Router</h3>
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
            .
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
        </div>

        <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="text-sm font-semibold">OCR — Model riêng</h3>
          <p className="text-xs text-muted-foreground">
            Bước vision OCR không dùng model chat (vd. deepseek-v4-pro là text-only).
            Khi Agent Router bị <code className="rounded bg-muted px-1">content-blocked</code>,
            fallback Gemini dùng model bên dưới — tránh gọi gemini-3.5-flash hết quota.
          </p>
          <label className="text-sm font-medium">Agent Router — vision OCR</label>
          <Input
            value={ocrAgentRouterVisionModel}
            onChange={(e) => setOcrAgentRouterVisionModel(e.target.value)}
            placeholder="claude-opus-4-6"
            list="ocr-ar-vision-models"
          />
          <datalist id="ocr-ar-vision-models">
            <option value="claude-opus-4-6" />
            <option value="claude-sonnet-4-5-20250929" />
            <option value="claude-haiku-4-5-20251001" />
            <option value="gpt-4o" />
            <option value="gpt-4o-mini" />
          </datalist>
          <label className="text-sm font-medium">Gemini — OCR / fallback vision</label>
          <Input
            value={ocrGeminiFallbackModel}
            onChange={(e) => setOcrGeminiFallbackModel(e.target.value)}
            placeholder="gemini-2.5-flash-lite"
            list="ocr-gemini-models"
          />
          <datalist id="ocr-gemini-models">
            <option value="gemini-2.5-flash-lite" />
            <option value="gemini-2.5-flash" />
            <option value="gemini-flash-latest" />
          </datalist>
        </div>

        <label className="text-sm font-medium">Temperature (toàn hệ thống)</label>
        <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} />

        <Button onClick={saveLlm} disabled={llmSaving}>
          {llmSaving ? 'Đang lưu…' : 'Lưu cấu hình LLM'}
        </Button>
        </AdminSection>

        <details className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-muted-foreground">
            Raw system config
          </summary>
          <pre className="mt-3 overflow-auto rounded-lg bg-muted p-4 text-xs">
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </div>
    </AdminPageShell>
  );
}
