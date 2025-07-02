import { onError, onStart, os } from '@orpc/server';
import { loggingMiddleware, authMiddleware } from './middleware';
import { Context } from './context';

export const publicProcedure = os
  .$context<Context>()
  .use(loggingMiddleware)
  .use(
    onError((opt) => {
      // set error to sentry
    }),
  )
  .use(async (opt) => {
    // rate limit
    // const rateLimit = await rateLimiter.consume(opt.context.req.ip);
    return opt.next();
  });

export const protectedProcedure = publicProcedure.use(authMiddleware);
