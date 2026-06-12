import type { Request, Response, NextFunction } from 'express';

import { getConfigValue } from '../services/config.service.js';

export async function maintenanceGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    req.path.startsWith('/admin') ||
    req.path.startsWith('/auth') ||
    req.path === '/health' ||
    req.path === '/health/ready'
  ) {
    next();
    return;
  }
  const mode = await getConfigValue('maintenance_mode', 'false');
  if (mode === 'true') {
    res.status(503).json({
      success: false,
      error: {
        code: 'MAINTENANCE',
        message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      },
    });
    return;
  }
  next();
}
