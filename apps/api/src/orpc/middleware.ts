import { ORPCError, os } from '@orpc/server';
import type { Context } from './context';

export const loggingMiddleware = os
  .$context<Context>()
  .middleware(async ({ context, next, path }) => {
    const start = Date.now();

    const result = await next({
      context,
    });

    const durationMs = Date.now() - start;
    const logMeta = { path, durationMs };
    console.log(`Request to ${path} took ${durationMs}ms`, JSON.stringify(logMeta, null, 2));
    return result;
  });

export const authMiddleware = os
  .$context<Context>()
  .middleware(async ({ context, next, errors }) => {
    const idToken = context.req.headers?.cookie
      ?.split(';')
      .map((cookie: string) => {
        const [key, value] = cookie.split('=');
        if (!key) return { key: '', value: value?.trim() ?? '' };
        return { key: key.trim(), value: value?.trim() ?? '' };
      })
      .find((kv: any) => kv.key === '__id_token')?.value;

    if (!idToken) {
      // throw new ORPCError('UNAUTHORIZED');
    }
    return next({ context: { ...context, idToken } });
  });
