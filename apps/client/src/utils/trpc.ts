import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, httpLink, splitLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { isNonJsonSerializable } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../api/src/trpc';

const queryClient = new QueryClient();

// 创建支持文件上传的 tRPC 客户端
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      // 对于文件上传等非 JSON 数据，使用 httpLink
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/trpc',
        transformer: {
          serialize: (data) => data,
          deserialize: superjson.deserialize,
        },
      }),
      // 对于普通数据，使用批量处理的 httpBatchLink
      false: httpBatchLink({
        url: import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/trpc',
        transformer: superjson,
      }),
    }),
  ],
});

const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export { queryClient, trpc, trpcClient };
export type { AppRouter };
trpcClient.getPosts.query({});
