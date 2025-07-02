import { protectedProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { octetInputParser } from '@trpc/server/http';
import { Writable } from 'node:stream';
import type _ from 'undici-types';

// 模拟文章数据存储
const postDatabase = new Map([
  [
    1,
    {
      id: 1,
      title: 'Getting Started with tRPC',
      content: 'tRPC is a great tool for building type-safe APIs...',
      authorId: 1,
      publishedAt: new Date('2023-12-01'),
      updatedAt: new Date('2023-12-15'),
      tags: new Set(['typescript', 'trpc', 'tutorial']),
      viewCount: 1250,
      likes: new Set([1, 2, 3, 4, 5]),
      metadata: new Map<string, any>([
        ['readingTime', 5],
        ['difficulty', 'beginner'],
        ['featured', true],
      ]),
      attachments: [] as string[],
    },
  ],
  [
    2,
    {
      id: 2,
      title: 'Advanced TypeScript Patterns',
      content: 'Exploring advanced TypeScript features...',
      authorId: 2,
      publishedAt: new Date('2023-11-20'),
      updatedAt: new Date('2023-11-25'),
      tags: new Set(['typescript', 'advanced', 'patterns']),
      viewCount: 890,
      likes: new Set([1, 3, 5]),
      metadata: new Map<string, any>([
        ['readingTime', 12],
        ['difficulty', 'advanced'],
        ['featured', false],
      ]),
      attachments: [] as string[],
    },
  ],
]);

export const postRouter = router({
  // Query: 获取单个文章
  getPost: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
    const post = postDatabase.get(input.id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }),

  // Query: 获取所有文章（支持分页和筛选）
  getPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(10),
        tag: z.string().optional(),
        authorId: z.number().optional(),
      }),
    )
    .query(({ input }) => {
      let posts = Array.from(postDatabase.values());

      // 按标签筛选
      if (input.tag) {
        posts = posts.filter((post) => post.tags.has(input.tag!));
      }

      // 按作者筛选
      if (input.authorId) {
        posts = posts.filter((post) => post.authorId === input.authorId);
      }

      // 分页
      const startIndex = (input.page - 1) * input.limit;
      const endIndex = startIndex + input.limit;
      const paginatedPosts = posts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: posts.length,
          totalPages: Math.ceil(posts.length / input.limit),
        },
        queryTime: new Date(),
      };
    }),

  // Mutation: 创建新文章
  createPost: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        authorId: z.number(),
        tags: z.array(z.string()).default([]),
        metadata: z.record(z.any()).default({}),
      }),
    )
    .mutation(({ input }) => {
      const newId = Array.from(postDatabase.keys()).reduce((max, key) => Math.max(max, key), 0) + 1;
      const now = new Date();

      const newPost = {
        id: newId,
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        publishedAt: now,
        updatedAt: now,
        tags: new Set(input.tags),
        viewCount: 0,
        likes: new Set<number>(),
        metadata: new Map<string, any>(Object.entries(input.metadata)),
        attachments: [] as string[],
      };

      postDatabase.set(newId, newPost);
      return newPost;
    }),

  // Mutation: 点赞/取消点赞
  toggleLike: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(({ input }) => {
      const post = postDatabase.get(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const hasLiked = post.likes.has(input.userId);
      if (hasLiked) {
        post.likes.delete(input.userId);
      } else {
        post.likes.add(input.userId);
      }

      post.updatedAt = new Date();
      postDatabase.set(input.postId, post);

      return {
        postId: input.postId,
        liked: !hasLiked,
        totalLikes: post.likes.size,
        actionTime: new Date(),
      };
    }),

  // Mutation: 上传文章附件
  uploadAttachment: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        fileType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const post = postDatabase.get(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // 创建上传目录
      const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileExtension = path.extname(input.fileName);
      const uniqueFileName = `post_${input.postId}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // 保存文件
      const buffer = Buffer.from(input.fileData, 'base64');
      fs.writeFileSync(filePath, buffer);

      // 更新文章附件列表
      post.attachments.push(uniqueFileName);
      post.updatedAt = new Date();
      postDatabase.set(input.postId, post);

      return {
        message: 'Attachment uploaded successfully',
        fileName: uniqueFileName,
        filePath: `/uploads/attachments/${uniqueFileName}`,
        uploadedAt: new Date(),
        fileSize: buffer.length,
        post,
      };
    }),

  // Mutation: 使用 FormData 上传文章附件 (推荐方式)
  uploadAttachmentFormData: publicProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ input }) => {
      const postId = input.get('postId');
      const file = input.get('file') as File;

      if (!postId || !file) {
        throw new Error('Post ID and file are required');
      }

      const postIdNum = Number(postId);
      const post = postDatabase.get(postIdNum);
      if (!post) {
        throw new Error('Post not found');
      }

      // 创建上传目录
      const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileExtension = path.extname(file.name);
      const uniqueFileName = `post_${postIdNum}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // 保存文件
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      // 更新文章附件列表
      post.attachments.push(uniqueFileName);
      post.updatedAt = new Date();
      postDatabase.set(postIdNum, post);

      return {
        message: 'Attachment uploaded successfully via FormData',
        fileName: uniqueFileName,
        originalName: file.name,
        filePath: `/uploads/attachments/${uniqueFileName}`,
        uploadedAt: new Date(),
        fileSize: buffer.length,
        mimeType: file.type,
        post,
      };
    }),

  // Mutation: 使用二进制流上传文件（适用于任何类型的文件）
  uploadSingleFile: publicProcedure.input(octetInputParser).mutation(async ({ input }) => {
    // 这个方法用于处理二进制流数据，客户端需要在调用时传递额外的元数据
    const postId = 1; // 默认使用文章ID 1，客户端可以通过其他方式传递这个信息

    const post = postDatabase.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'uploads', 'files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const uniqueFileName = `post_${postId}_${timestamp}.bin`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // 从 ReadableStream 读取数据并保存

    input.pipeTo(Writable.toWeb(fs.createWriteStream(filePath)));

    // 更新文章附件列表
    post.attachments.push(uniqueFileName);
    post.updatedAt = new Date();
    postDatabase.set(postId, post);

    return {
      message: 'File uploaded successfully via binary stream',
      fileName: uniqueFileName,
      filePath: `/uploads/files/${uniqueFileName}`,
      uploadedAt: new Date(),
      mimeType: 'application/octet-stream',
      post,
    };
  }),

  // Mutation: 使用 ReadableStream 上传二进制数据
  uploadBinaryData: publicProcedure.input(octetInputParser).mutation(async ({ input }) => {
    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'uploads', 'binary');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const uniqueFileName = `binary_${timestamp}.bin`;
    const filePath = path.join(uploadDir, uniqueFileName);

    input.pipeTo(Writable.toWeb(fs.createWriteStream(filePath)));

    return {
      message: 'Binary data uploaded successfully',
      fileName: uniqueFileName,
      filePath: `/uploads/binary/${uniqueFileName}`,
      uploadedAt: new Date(),
    };
  }),

  // Query: 获取热门标签
  getPopularTags: publicProcedure.query(() => {
    const tagCount = new Map<string, number>();

    for (const post of Array.from(postDatabase.values())) {
      for (const tag of Array.from(post.tags)) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      }
    }

    const sortedTags = Array.from(tagCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      tags: sortedTags,
      generatedAt: new Date(),
      totalUniqueTags: tagCount.size,
    };
  }),

  // Mutation: 批量上传图片
  uploadImages: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        images: z.array(
          z.object({
            fileName: z.string(),
            fileData: z.string(),
            alt: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const post = postDatabase.get(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadResults = [];
      const timestamp = Date.now();

      for (let i = 0; i < input.images.length; i++) {
        const image = input.images[i];
        if (!image) continue;

        const fileExtension = path.extname(image.fileName);
        const uniqueFileName = `post_${input.postId}_${timestamp}_${i}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        const buffer = Buffer.from(image.fileData, 'base64');
        fs.writeFileSync(filePath, buffer);

        uploadResults.push({
          originalName: image.fileName,
          fileName: uniqueFileName,
          filePath: `/uploads/images/${uniqueFileName}`,
          alt: image.alt,
          size: buffer.length,
        });

        post.attachments.push(uniqueFileName);
      }

      post.updatedAt = new Date();
      postDatabase.set(input.postId, post);

      return {
        message: `${input.images.length} images uploaded successfully`,
        uploadedImages: uploadResults,
        uploadedAt: new Date(),
        post,
      };
    }),
});
