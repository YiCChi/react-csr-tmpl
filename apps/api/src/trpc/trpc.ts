import { initTRPC } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { authMiddleware, loggingMiddleware } from './middleware';

const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    idToken: req.headers.cookie
      ?.split(';')
      .map((cookie) => {
        const [key, value] = cookie.split('=');
        if (!key) return { key: '', value: value?.trim() ?? '' };
        return { key: key.trim(), value: value?.trim() ?? '' };
      })
      ?.find((kv) => kv.key === '__id_token')?.value,
  };
};

const { router, procedure, mergeRouters } = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: (opt) => {
    const { shape, error } = opt;
    return {
      ...shape,
      data: {
        ...shape.data,
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
        path: shape.data.path,
        foo: true,
      },
    };
  },
});

const publicProcedure = procedure.use(loggingMiddleware);
const protectedProcedure = publicProcedure.use(authMiddleware);

export { router, publicProcedure, protectedProcedure, mergeRouters, createContext };

export type Middleware = Parameters<typeof procedure.use>[0];
export type Context = Awaited<ReturnType<typeof createContext>>;
