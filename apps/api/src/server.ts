import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import { handler } from './orpc/routers';
import { appRouter } from './trpc';
import { createContext } from './trpc/trpc';

const app = express();
const port = process.env.PORT || 4000;

// 中间件
app.use(cors());

// tRPC 路由
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/rpc*splash', async (req, res, next) => {
  req.headers;
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: { req },
  });

  if (matched) {
    return;
  }
  next();
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'tRPC Demo API Server',
    endpoints: {
      trpc: '/trpc',
      health: '/health',
      uploads: '/uploads',
    },
    features: [
      'Complex data types (Date, Map, Set)',
      'File uploads with local storage',
      'Query and Mutation operations',
      'Type-safe API with superjson serialization',
    ],
    timestamp: new Date(),
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
  console.log(`📡 oRPC endpoint: http://localhost:${port}/rpc*`);
});
