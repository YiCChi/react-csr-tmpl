import { RPCHandler } from '@orpc/server/node';
import { userRouter } from './user';
import { postRouter } from './post';

export const router = {
  user: userRouter,
  post: postRouter,
};

export const handler = new RPCHandler(router);
