import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { router } from '../../../api/src/orpc/routers/index.ts';

const link = new RPCLink({
  url: 'http://localhost:4000/rpc',
  headers: () => ({
    authorization: 'Bearer token',
  }),
  plugins: [
    new BatchLinkPlugin({
      groups: [
        {
          condition: (opt) => true,
          context: {},
        },
      ],
    }),
  ],
});

// Create a client for your router
export const client: RouterClient<typeof router> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
