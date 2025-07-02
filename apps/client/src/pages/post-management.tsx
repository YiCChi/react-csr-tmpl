import { isDefinedError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import FileUploadDemo from '../components/file-upload-demo.tsx';
import { orpc } from '../utils/orpc.ts';
import { trpc, trpcClient } from '../utils/trpc.ts';

export default function PostManagementPage() {
  const [selectedPostId, setSelectedPostId] = useState<number>(1);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    authorId: 1,
    tags: '',
    metadata: '',
  });

  const queryClient = useQueryClient();

  // test demo
  const { error: e } = useQuery(orpc.post.errorExample.queryOptions());
  const { error: de } = useQuery(orpc.post.definedErrorExample.queryOptions());

  if (isDefinedError(e)) {
    console.log(e.status);
    e.status;
    if (e.code === 'BAR') {
      console.error('错误代码 BAR:', e.data);
    } else if (e.code === 'FORBIDDEN') {
      console.error('错误代码 FORBIDDEN:', e.data);
    }
  } else {
    console.log(e);
  }

  // test demo

  // 查询文章列表
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery(orpc.post.getPosts.queryOptions({ input: { page: 1, limit: 10 } }));

  // 查询单个文章
  const {
    data: selectedPost,
    isLoading: postLoading,
    error: postError,
  } = useQuery(trpc.getPost.queryOptions({ id: selectedPostId }));

  // 获取热门标签
  const { data: popularTags } = useQuery(trpc.getPopularTags.queryOptions());

  // 创建文章 mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      authorId: number;
      tags: string[];
      metadata: Record<string, any>;
    }) => {
      return trpcClient.createPost.mutate(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getPosts']] });
      queryClient.invalidateQueries({ queryKey: [['getPopularTags']] });
      setNewPostData({ title: '', content: '', authorId: 1, tags: '', metadata: '' });
    },
  });

  // 点赞 mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number; userId: number }) => {
      return trpcClient.toggleLike.mutate({ postId, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
      queryClient.invalidateQueries({ queryKey: [['getPosts']] });
    },
  });

  // 文件上传 mutations
  const uploadAttachmentMutation = useMutation({
    mutationFn: async (data: {
      postId: number;
      fileName: string;
      fileData: string;
      fileType: string;
    }) => {
      return trpcClient.uploadAttachment.mutate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
    },
  });

  // FormData 文件上传
  const uploadFormDataMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return trpcClient.uploadAttachmentFormData.mutate(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
    },
  });

  // 批量图片上传
  const uploadImagesMutation = useMutation({
    mutationFn: async (data: {
      postId: number;
      images: { fileName: string; fileData: string; alt?: string }[];
    }) => {
      return trpcClient.uploadImages.mutate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
    },
  });

  const handleCreatePost = () => {
    const tags = newPostData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    let metadata = {};
    try {
      metadata = newPostData.metadata ? JSON.parse(newPostData.metadata) : {};
    } catch (e) {
      alert('元数据格式错误，请输入有效的 JSON');
      return;
    }

    createPostMutation.mutate({
      title: newPostData.title,
      content: newPostData.content,
      authorId: newPostData.authorId,
      tags,
      metadata,
    });
  };

  const handleLikeToggle = () => {
    if (!selectedPost) return;
    toggleLikeMutation.mutate({ postId: selectedPost.id, userId: 1 });
  };

  // Base64 文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!(file && selectedPost)) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      uploadAttachmentMutation.mutate({
        postId: selectedPost.id,
        fileName: file.name,
        fileData: base64Data,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  // FormData 文件上传
  const handleFormDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!(file && selectedPost)) return;

    const formData = new FormData();
    formData.append('postId', selectedPost.id.toString());
    formData.append('file', file);

    uploadFormDataMutation.mutate(formData);
  };

  // 批量图片上传
  const handleImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedPost) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<{ fileName: string; fileData: string; alt?: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = (reader.result as string).split(',')[1];
              resolve({
                fileName: file.name,
                fileData: base64Data,
                alt: file.name,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    ).then((images) => {
      uploadImagesMutation.mutate({
        postId: selectedPost.id,
        images,
      });
    });
  };

  const formatComplexData = (data: any) => {
    if (data instanceof Map) {
      return Object.fromEntries(data);
    }
    if (data instanceof Set) {
      return Array.from(data);
    }
    if (data instanceof Date) {
      return data.toLocaleString();
    }
    return data;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>文章管理 - tRPC Demo</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        演示 tRPC 的文件上传功能：Base64、FormData 和批量图片上传
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* 文章列表 */}
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <h3>📚 文章列表</h3>
          {postsLoading ? (
            <p>加载中...</p>
          ) : postsError ? (
            <>
              <p style={{ color: 'red' }}>加载失败: {postsError.message || '未知错误'}</p>
            </>
          ) : (
            <div>
              {posts?.posts?.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    border: selectedPostId === post.id ? '2px solid #1976d2' : '1px solid #eee',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedPostId === post.id ? '#f3f9ff' : 'white',
                  }}
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{post.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    作者: {post.authorId} | 浏览: {post.viewCount} | 点赞:{' '}
                    {formatComplexData(post.likes).length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    发布: {formatComplexData(post.publishedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {formatComplexData(post.tags)
                      .slice(0, 3)
                      .map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 热门标签 */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>🔥 热门标签</h4>
            {popularTags ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {popularTags.tags.map(([tag, count]: [string, number]) => (
                  <span
                    key={tag}
                    style={{
                      background: '#fff3e0',
                      color: '#e65100',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: '1px solid #ffcc02',
                    }}
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>加载中...</p>
            )}
          </div>
        </div>

        {/* 文章详情和文件上传 */}
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <h3>📖 文章详情 & 文件上传</h3>
          {postLoading ? (
            <p>加载中...</p>
          ) : postError ? (
            <p style={{ color: 'red' }}>加载失败: {postError?.shape?.data.foo || '未知错误'}</p>
          ) : selectedPost ? (
            <div>
              {/* 文章信息 */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>{selectedPost.title}</h2>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  作者 ID: {selectedPost.authorId} | 浏览量: {selectedPost.viewCount} | 点赞数:{' '}
                  {formatComplexData(selectedPost.likes).length}
                </div>
                <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>{selectedPost.content}</p>

                <div
                  style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}
                >
                  {formatComplexData(selectedPost.tags).map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleLikeToggle}
                  disabled={toggleLikeMutation.isPending}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff4081',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {toggleLikeMutation.isPending
                    ? '处理中...'
                    : `❤️ 点赞 (${formatComplexData(selectedPost.likes).length})`}
                </button>
              </div>

              {/* 文件上传区域 */}
              <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📎 文件上传演示</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {/* Base64 上传 */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>📄 Base64 上传</h5>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
                      传统方式，适用于小文件
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      style={{ fontSize: '12px', marginBottom: '8px' }}
                    />
                    {uploadAttachmentMutation.isPending && (
                      <p style={{ fontSize: '12px', color: '#1976d2' }}>上传中...</p>
                    )}
                    {uploadAttachmentMutation.isError && (
                      <p style={{ fontSize: '12px', color: '#d32f2f' }}>
                        上传失败: {uploadAttachmentMutation.error?.message}
                      </p>
                    )}
                    {uploadAttachmentMutation.isSuccess && (
                      <p style={{ fontSize: '12px', color: '#2e7d32' }}>上传成功！</p>
                    )}
                  </div>

                  {/* FormData 上传 */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>🚀 FormData 上传</h5>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
                      推荐方式，支持大文件
                    </p>
                    <input
                      type="file"
                      onChange={handleFormDataUpload}
                      style={{ fontSize: '12px', marginBottom: '8px' }}
                    />
                    {uploadFormDataMutation.isPending && (
                      <p style={{ fontSize: '12px', color: '#1976d2' }}>上传中...</p>
                    )}
                    {uploadFormDataMutation.isError && (
                      <p style={{ fontSize: '12px', color: '#d32f2f' }}>
                        上传失败: {uploadFormDataMutation.error?.message}
                      </p>
                    )}
                    {uploadFormDataMutation.isSuccess && (
                      <p style={{ fontSize: '12px', color: '#2e7d32' }}>上传成功！</p>
                    )}
                  </div>

                  {/* 批量图片上传 */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>🖼️ 批量图片上传</h5>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>
                      多选图片同时上传
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImagesUpload}
                      style={{ fontSize: '12px', marginBottom: '8px' }}
                    />
                    {uploadImagesMutation.isPending && (
                      <p style={{ fontSize: '12px', color: '#1976d2' }}>上传中...</p>
                    )}
                    {uploadImagesMutation.isError && (
                      <p style={{ fontSize: '12px', color: '#d32f2f' }}>
                        上传失败: {uploadImagesMutation.error?.message}
                      </p>
                    )}
                    {uploadImagesMutation.isSuccess && (
                      <p style={{ fontSize: '12px', color: '#2e7d32' }}>
                        上传成功 {uploadImagesMutation.data?.uploadedImages?.length} 张图片！
                      </p>
                    )}
                  </div>
                </div>

                {/* 附件列表 */}
                {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                    }}
                  >
                    <h5 style={{ margin: '0 0 8px 0' }}>📎 附件列表:</h5>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedPost.attachments.map((attachment: string, index: number) => (
                        <span
                          key={index}
                          style={{
                            background: '#fff3e0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #ffcc02',
                          }}
                        >
                          {attachment}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 元数据展示 */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f3f9ff',
                  borderRadius: '6px',
                }}
              >
                <h5 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>🗂️ 文章元数据 (Map 对象)</h5>
                <pre
                  style={{
                    margin: '0',
                    fontSize: '12px',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  {JSON.stringify(formatComplexData(selectedPost.metadata), null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p>请从左侧选择一篇文章查看详情</p>
          )}
        </div>
      </div>

      {/* 创建新文章 */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        <h3 style={{ color: '#1976d2' }}>✍️ 创建新文章</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          演示创建包含复杂数据类型的文章记录
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              标题:
            </label>
            <input
              type="text"
              value={newPostData.title}
              onChange={(e) => setNewPostData((prev) => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="请输入文章标题"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              作者 ID:
            </label>
            <input
              type="number"
              value={newPostData.authorId}
              onChange={(e) =>
                setNewPostData((prev) => ({ ...prev, authorId: Number(e.target.value) }))
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>内容:</label>
          <textarea
            value={newPostData.content}
            onChange={(e) => setNewPostData((prev) => ({ ...prev, content: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical',
            }}
            placeholder="请输入文章内容"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              标签 (Set 类型, 逗号分隔):
            </label>
            <input
              type="text"
              placeholder="typescript,tutorial,trpc"
              value={newPostData.tags}
              onChange={(e) => setNewPostData((prev) => ({ ...prev, tags: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              元数据 (Map 类型, JSON 格式):
            </label>
            <input
              type="text"
              placeholder='{"readingTime": 5, "difficulty": "beginner"}'
              value={newPostData.metadata}
              onChange={(e) => setNewPostData((prev) => ({ ...prev, metadata: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleCreatePost}
          disabled={!(newPostData.title && newPostData.content) || createPostMutation.isPending}
          style={{
            padding: '12px 24px',
            backgroundColor:
              newPostData.title && newPostData.content && !createPostMutation.isPending
                ? '#1976d2'
                : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor:
              newPostData.title && newPostData.content && !createPostMutation.isPending
                ? 'pointer'
                : 'not-allowed',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          {createPostMutation.isPending ? '创建中...' : '发布文章'}
        </button>

        {createPostMutation.isError && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px',
              color: '#d32f2f',
            }}
          >
            创建失败: {createPostMutation.error?.message}
          </div>
        )}

        {createPostMutation.isSuccess && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              color: '#2e7d32',
            }}
          >
            文章发布成功！已添加到文章列表中。
          </div>
        )}
      </div>

      {/* File Upload Demo Component */}
      {selectedPost && (
        <FileUploadDemo
          postId={selectedPostId}
          onUploadSuccess={(result) => {
            console.log('Upload successful:', result);
            // Automatically refresh the post data to show new attachments
            queryClient.invalidateQueries({ queryKey: [['getPost']] });
          }}
        />
      )}

      <div
        style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>💡 文件上传演示说明</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#1565c0' }}>
          <li>
            <strong>Base64 上传:</strong> 适合小文件，文件内容编码后通过 JSON 传输
          </li>
          <li>
            <strong>FormData 上传:</strong> 推荐方式，支持大文件，使用原生 FormData API
          </li>
          <li>
            <strong>批量图片上传:</strong> 支持多选图片文件同时上传处理
          </li>
          <li>
            <strong>点赞功能:</strong> 演示 Set 数据类型的使用，自动去重用户ID
          </li>
          <li>
            <strong>文章元数据:</strong> 使用 Map 对象存储额外的键值对信息
          </li>
        </ul>
      </div>
    </div>
  );
}
