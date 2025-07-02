import { isDefinedError, onError, onStart, os } from '@orpc/server';
import { z } from 'zod';
import type { Context } from './context';
import { authMiddleware, loggingMiddleware } from './middleware';

export const publicProcedure = os
  .$context<Context>()
  .errors({
    FOO: {
      data: z.object({
        bar: z.string(),
        baz: z.number().optional(),
      }),
      message: 'foo',
      status: 400,
    },
    BAR: {
      data: z.object({
        bar: z.string(),
        baz: z.number().optional(),
      }),
      message: 'bar',
    },
    UNAUTHORIZED: {
      message: 'Unauthorized',
      status: 401,
    },
    FORBIDDEN: {
      message: 'Forbidden',
      status: 403,
    },
    NOT_FOUND: {
      message: 'Not Found',
      status: 404,
    },
    INTERNAL_SERVER_ERROR: {
      message: 'Internal Server Error',
      status: 500,
    },
    TOO_MANY_REQUESTS: {
      message: 'Too Many Requests',
      status: 429,
    },
    PAYLOAD_TOO_LARGE: {
      message: 'Payload Too Large',
      status: 413,
    },
  })
  .use(loggingMiddleware)
  .use(
    onError((opt) => {
      if (isDefinedError(opt)) {
        return;
      } else {
        console.error(opt.stack);
      }
    }),
  )
  .use(async (opt) => {
    // const rateLimit = await rateLimiter.consume(opt.context.req.ip);
    // if (!rateLimit) {
    //   throw opt.errors.TOO_MANY_REQUESTS();
    // }
    return opt.next();
  });

export const protectedProcedure = publicProcedure.use(authMiddleware);
