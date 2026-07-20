import { beforeEach, describe, expect, it, vi } from 'vitest';

const incrRateLimit = vi.fn();
const getConfigValue = vi.fn();

vi.mock('../config/redis.js', () => ({
  incrRateLimit,
}));

vi.mock('./config.service.js', () => ({
  getConfigValue,
}));

describe('usage-limit.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('allows when limit is 0 (unlimited)', async () => {
    getConfigValue.mockResolvedValue('0');
    incrRateLimit.mockResolvedValue(false);

    const { checkDailyUserLimit } = await import('./usage-limit.service.js');
    const ok = await checkDailyUserLimit('user-1', 'ocr_daily_limit', 'ocr');
    expect(ok).toBe(true);
    expect(incrRateLimit).not.toHaveBeenCalled();
  });

  it('checks daily user limit via redis', async () => {
    getConfigValue.mockResolvedValue('5');
    incrRateLimit.mockResolvedValue(true);

    const { checkDailyUserLimit } = await import('./usage-limit.service.js');
    const ok = await checkDailyUserLimit('user-1', 'ocr_daily_limit', 'ocr');
    expect(ok).toBe(true);
    expect(incrRateLimit).toHaveBeenCalledWith(
      expect.stringMatching(/^nihongocoach:daily:ocr:user-1:/),
      5,
      86_400,
    );
  });

  it('assertAuthIpLimit throws when over limit', async () => {
    getConfigValue.mockResolvedValue('3');
    incrRateLimit.mockResolvedValue(false);

    const { assertAuthIpLimit } = await import('./usage-limit.service.js');
    await expect(
      assertAuthIpLimit('1.2.3.4', 'auth_login_limit_per_ip', 'login', 900),
    ).rejects.toMatchObject({ statusCode: 429, code: 'RATE_LIMITED' });
  });
});
