import { db } from '../config/db.js';
import { getOrSet } from '../config/redis.js';

export async function getConfigValue(key: string, fallback: string): Promise<string> {
  const configs = await getAllConfig();
  return configs[key] ?? fallback;
}

export async function getAllConfig(): Promise<Record<string, string>> {
  return getOrSet('nihongocoach:system_config', async () => {
    const rows = await db.systemConfig.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }, 600);
}

export async function setConfig(key: string, value: string) {
  await db.systemConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
