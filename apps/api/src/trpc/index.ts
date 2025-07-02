import { postRouter } from './routers/post';
import { userRouter } from './routers/user';
import { mergeRouters } from './trpc';

export const appRouter = mergeRouters(userRouter, postRouter);

export type AppRouter = typeof appRouter;
