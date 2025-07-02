# tRPC Demo API

这是一个功能丰富的 tRPC 演示 API，展示了以下特性：

## 🌟 主要特性

- ✅ **复杂数据类型支持**: Date, Map, Set 等 JSON 不原生支持的数据类型
- ✅ **Query 和 Mutation 操作**: 完整的 CRUD 操作
- ✅ **多种文件上传方式**: 支持 FormData、File 对象、ReadableStream 和 base64 上传
- ✅ **SuperJSON 序列化**: 自动处理复杂数据类型的序列化/反序列化
- ✅ **类型安全**: 完整的 TypeScript 类型支持

## 📁 项目结构

```
apps/api/src/
├── trpc/
│   ├── trpc.ts              # tRPC 基础配置
│   ├── index.ts             # 路由聚合
│   └── routers/
│       ├── user.ts          # 用户相关操作
│       └── post.ts          # 文章相关操作
└── server.ts                # Express 服务器
```

## 🚀 启动服务器

```bash
cd apps/api
pnpm dev
```

服务器将在 `http://localhost:3001` 启动

## 📡 API 端点

### 用户操作 (User Router)

#### Query 操作

- `getUser(id: number)` - 获取单个用户信息
- `getAllUsers()` - 获取所有用户列表

#### Mutation 操作

- `updateUser(data)` - 更新用户信息
- `createUser(data)` - 创建新用户
- `uploadAvatar(data)` - 上传用户头像

### 文章操作 (Post Router)

#### Query 操作

- `getPost(id: number)` - 获取单篇文章
- `getPosts(options)` - 获取文章列表（支持分页和筛选）
- `getPopularTags()` - 获取热门标签

#### Mutation 操作

- `createPost(data)` - 创建新文章
- `toggleLike(postId, userId)` - 点赞/取消点赞
- `uploadAttachment(data)` - 上传文章附件
- `uploadImages(data)` - 批量上传图片

## 🔧 复杂数据类型示例

### Date 类型

```typescript
{
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date()
}
```

### Set 类型

```typescript
{
  tags: new Set(['typescript', 'trpc', 'tutorial']),
  likes: new Set([1, 2, 3, 4, 5])
}
```

### Map 类型

```typescript
{
  metadata: new Map([
    ['theme', 'dark'],
    ['language', 'en'],
    ['notifications', true],
  ]);
}
```

## 📤 文件上传功能

### 支持的文件上传类型

1. **用户头像上传** - 单文件上传
2. **文章附件上传** - 支持各种文件类型
3. **图片批量上传** - 支持多图片同时上传

### 上传流程

1. 文件转换为 base64 格式
2. 通过 tRPC mutation 发送
3. 服务器端解码并保存到本地 `uploads/` 目录
4. 返回文件访问路径

### 文件存储结构

```
uploads/
├── avatars/          # 用户头像
├── attachments/      # 文章附件
└── images/          # 文章图片
```

## 🎯 使用示例

### 客户端调用示例

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc';
import superjson from 'superjson';

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
    }),
  ],
});

// 查询用户
const user = await trpc.getUser.query({ id: 1 });
console.log(user.createdAt instanceof Date); // true
console.log(Array.from(user.tags)); // ['admin', 'premium', 'early-adopter']

// 创建文章
const newPost = await trpc.createPost.mutate({
  title: 'My New Post',
  content: 'This is the content...',
  authorId: 1,
  tags: ['typescript', 'tutorial'],
});

// 上传头像
const avatarResult = await trpc.uploadAvatar.mutate({
  userId: 1,
  fileName: 'avatar.jpg',
  fileData: base64Data,
  fileType: 'image/jpeg',
});
```

## 🔄 SuperJSON 序列化

SuperJSON 自动处理以下数据类型的序列化：

- `Date` 对象
- `Map` 对象
- `Set` 对象
- `BigInt`
- `undefined`
- 正则表达式
- 等等...

## 🛠️ 开发特性

- **类型安全**: 完整的端到端类型推断
- **热重载**: 开发时支持热重载
- **错误处理**: 统一的错误处理机制
- **验证**: 使用 Zod 进行输入验证
- **文档**: 自动生成的 API 文档

## 📝 注意事项

1. 文件上传有大小限制（50MB）
2. 上传的文件存储在本地，生产环境建议使用云存储
3. 所有 Map 和 Set 对象在传输过程中会被自动序列化/反序列化
4. Date 对象保持为真实的 Date 实例，而非字符串

这个演示充分展示了 tRPC 在处理复杂数据类型和文件上传方面的强大能力！
