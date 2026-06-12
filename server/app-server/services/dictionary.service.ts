import { db } from '../config/db.js';
import { incrRateLimit } from '../config/redis.js';
import { getConfigValue } from './config.service.js';

export async function searchDictionary(query: string, opts?: { userId?: string; ip?: string }) {
  const q = query.trim();
  if (q.length < 1) return { vocabulary: [], grammar: [], kanji: [] };

  if (!opts?.userId && opts?.ip) {
    const limit = Number(await getConfigValue('guest_dict_rate_limit', '20'));
    const ok = await incrRateLimit(`nihongocoach:ratelimit:dict:${opts.ip}`, limit, 3600);
    if (!ok) {
      return { vocabulary: [], grammar: [], kanji: [], rateLimited: true };
    }
  }

  const [vocabulary, grammar, kanji] = await Promise.all([
    db.vocabulary.findMany({
      where: {
        OR: [
          { word: { contains: q, mode: 'insensitive' } },
          { reading: { contains: q, mode: 'insensitive' } },
          { meaning: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        word: true,
        reading: true,
        meaning: true,
        jlptLevel: true,
      },
    }),
    db.grammar.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { pattern: { contains: q, mode: 'insensitive' } },
          { meaningVi: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        pattern: true,
        meaningVi: true,
        jlpt: true,
      },
    }),
    db.kanji.findMany({
      where: {
        OR: [
          { character: { contains: q } },
          { meaning: { contains: q, mode: 'insensitive' } },
          { hanVietPronunciation: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 15,
      select: {
        id: true,
        character: true,
        meaning: true,
        hanVietPronunciation: true,
        readingsOn: true,
        readingsKun: true,
        jlptLevel: true,
      },
    }),
  ]);

  return { vocabulary, grammar, kanji };
}
