import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

// 模拟用户数据存储
const userDatabase = new Map([
  [
    1,
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2023-01-15'),
      lastLoginAt: new Date(),
      tags: new Set(['admin', 'premium', 'early-adopter']),
      metadata: new Map<string, any>([
        ['theme', 'dark'],
        ['language', 'en'],
        ['notifications', true],
      ]),
      profileImage: null as string | null,
    },
  ],
  [
    2,
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date('2023-03-20'),
      lastLoginAt: new Date(Date.now() - 86400000), // 1 day ago
      tags: new Set(['user', 'beta-tester']),
      metadata: new Map<string, any>([
        ['theme', 'light'],
        ['language', 'zh'],
        ['notifications', false],
      ]),
      profileImage: null as string | null,
    },
  ],
]);

export const userRouter = router({
  // Query: 获取用户信息（包含复杂数据类型）
  getUser: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
    const user = userDatabase.get(input.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),

  // Query: 获取所有用户
  getAllUsers: publicProcedure.query(() => {
    return Array.from(userDatabase.values());
  }),

  // Mutation: 更新用户信息
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(({ input }) => {
      const user = userDatabase.get(input.id);
      if (!user) {
        throw new Error('User not found');
      }

      // 更新用户信息
      if (input.name) user.name = input.name;
      if (input.email) user.email = input.email;
      if (input.tags) user.tags = new Set(input.tags);
      if (input.metadata) {
        user.metadata = new Map<string, any>(Object.entries(input.metadata));
      }
      user.lastLoginAt = new Date();

      userDatabase.set(input.id, user);
      return user;
    }),

  // Mutation: 上传头像文件
  uploadAvatar: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded file data
        fileType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = userDatabase.get(input.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 创建上传目录
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileExtension = path.extname(input.fileName);
      const uniqueFileName = `${input.userId}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // 保存文件
      const buffer = Buffer.from(input.fileData, 'base64');
      fs.writeFileSync(filePath, buffer);

      // 更新用户信息
      user.profileImage = uniqueFileName;
      user.lastLoginAt = new Date();
      userDatabase.set(input.userId, user);

      return {
        message: 'Avatar uploaded successfully',
        fileName: uniqueFileName,
        filePath: `/uploads/avatars/${uniqueFileName}`,
        uploadedAt: new Date(),
        user,
      };
    }),

  // Mutation: 创建新用户
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        tags: z.array(z.string()).default([]),
        metadata: z.record(z.any()).default({}),
      }),
    )
    .mutation(({ input }) => {
      const newId = Array.from(userDatabase.keys()).reduce((max, key) => Math.max(max, key), 0) + 1;
      const newUser = {
        id: newId,
        name: input.name,
        email: input.email,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        tags: new Set(input.tags),
        metadata: new Map<string, any>(Object.entries(input.metadata)),
        profileImage: null as string | null,
      };

      userDatabase.set(newId, newUser);
      return newUser;
    }),
});
