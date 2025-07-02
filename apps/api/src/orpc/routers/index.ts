import { RPCHandler } from '@orpc/server/node';
import { BatchHandlerPlugin } from '@orpc/server/plugins';
import { postRouter } from './post';
import { userRouter } from './user';

export const router = {
  user: userRouter,
  post: postRouter,
};

export const handler = new RPCHandler(router, { plugins: [new BatchHandlerPlugin()] });
