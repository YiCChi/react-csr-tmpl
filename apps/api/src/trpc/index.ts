import { mergeRouters } from './trpc';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';

export const appRouter = mergeRouters(userRouter, postRouter);

export type AppRouter = typeof appRouter;
