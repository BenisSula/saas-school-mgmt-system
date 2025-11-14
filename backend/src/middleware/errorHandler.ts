import { Request, Response } from 'express';

type HttpError = Error & { status?: number; statusCode?: number; expose?: boolean };

export function errorHandler(err: Error, _req: Request, res: Response) {
  const httpError = err as HttpError;
  const status = httpError.status ?? httpError.statusCode ?? 500;
  if (status >= 500) {
    console.error('[error]', err);
    // In test/dev mode, include error details
    if (process.env.NODE_ENV !== 'production') {
      console.error('[error] Stack:', err.stack);
    }
  } else {
    console.warn('[warn]', err.message);
  }
  const message =
    status >= 500 && httpError.expose !== true && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (httpError.message ?? 'Request failed');
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' ? { error: err.message, stack: err.stack } : {})
  });
}
