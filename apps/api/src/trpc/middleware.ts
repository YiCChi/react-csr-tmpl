import { TRPCError } from '@trpc/server';
import { Middleware } from './trpc';

export const authMiddleware: Middleware = async ({ ctx, next }) => {
  if (!ctx.idToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx,
  });
};

export const loggingMiddleware: Middleware = async (opts) => {
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  // result.ok
  //   ? console.log('OK request timing:', meta)
  //   : console.error('Non-OK request timing', meta);

  return result;
};
