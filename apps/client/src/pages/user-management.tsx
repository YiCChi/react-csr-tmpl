import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import { trpc, trpcClient } from '../utils/trpc.ts';

export default function UserManagementPage() {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    tags: '',
    metadata: '',
  });

  const queryClient = useQueryClient();

  // 查询所有用户
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery(trpc.getAllUsers.queryOptions());

  // 查询单个用户
  const {
    data: selectedUser,
    isLoading: userLoading,
    error: userError,
  } = useQuery(trpc.getUser.queryOptions({ id: selectedUserId }));

  // 创建用户 mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      tags: string[];
      metadata: Record<string, any>;
    }) => {
      return trpcClient.createUser.mutate(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getAllUsers']] });
      setNewUserData({ name: '', email: '', tags: '', metadata: '' });
    },
  });

  // 上传头像 mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (avatarData: {
      userId: number;
      fileName: string;
      fileData: string;
      fileType: string;
    }) => {
      return trpcClient.uploadAvatar.mutate(avatarData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['getAllUsers']] });
      queryClient.invalidateQueries({ queryKey: [['getUser']] });
    },
  });

  const handleCreateUser = () => {
    const tags = newUserData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    let metadata = {};
    try {
      metadata = newUserData.metadata ? JSON.parse(newUserData.metadata) : {};
    } catch (e) {
      alert('元数据格式错误，请输入有效的 JSON');
      return;
    }

    createUserMutation.mutate({
      name: newUserData.name,
      email: newUserData.email,
      tags,
      metadata,
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!(file && selectedUser)) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      uploadAvatarMutation.mutate({
        userId: selectedUser.id,
        fileName: file.name,
        fileData: base64Data,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>用户管理 - tRPC Demo</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        演示 tRPC 的复杂数据类型支持：Date、Set、Map 以及文件上传功能
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* 用户列表 */}
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <h3>用户列表</h3>
          {usersLoading ? (
            <p>加载中...</p>
          ) : usersError ? (
            <p style={{ color: 'red' }}>加载失败: {usersError?.message || '未知错误'}</p>
          ) : (
            <div>
              {users?.map((user: any) => (
                <div
                  key={user.id}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    border: selectedUserId === user.id ? '2px solid #1976d2' : '1px solid #eee',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user.id ? '#f3f9ff' : 'white',
                  }}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div>
                    <strong>{user.name}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    ID: {user.id} | 标签: {formatComplexData(user.tags).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 用户详情 */}
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <h3>用户详情</h3>
          {userLoading ? (
            <p>加载中...</p>
          ) : userError ? (
            <p style={{ color: 'red' }}>加载失败: {userError?.message || '未知错误'}</p>
          ) : selectedUser ? (
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  👤
                </div>
                <div>
                  <h2 style={{ margin: '0', color: '#1976d2' }}>{selectedUser.name}</h2>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: '16px' }}>
                    {selectedUser.email}
                  </p>
                  <p style={{ margin: '4px 0', color: '#999', fontSize: '14px' }}>
                    用户 ID: {selectedUser.id}
                  </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    // style={{ display: 'none' }}
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending ? '上传中...' : '上传头像'}
                    </button>
                  </label>
                </div>
              </div>

              <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ marginTop: '0', color: '#1976d2' }}>📊 复杂数据类型展示</h4>

                <div style={{ marginBottom: '16px' }}>
                  <h5>📅 Date 对象:</h5>
                  <p>
                    <strong>创建时间:</strong> {formatComplexData(selectedUser.createdAt)}
                  </p>
                  <p>
                    <strong>最后登录:</strong> {formatComplexData(selectedUser.lastLoginAt)}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h5>🏷️ Set 对象 (标签集合):</h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {formatComplexData(selectedUser.tags).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5>🗂️ Map 对象 (元数据映射):</h5>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #ddd',
                      padding: '12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <pre style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(formatComplexData(selectedUser.metadata), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {uploadAvatarMutation.isError && (
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
                  头像上传失败: {uploadAvatarMutation.error?.message}
                </div>
              )}

              {uploadAvatarMutation.isSuccess && (
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
                  头像上传成功！
                </div>
              )}
            </div>
          ) : (
            <p>请从左侧选择一个用户查看详情</p>
          )}
        </div>
      </div>

      {/* 创建新用户 */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        <h3 style={{ color: '#1976d2' }}>➕ 创建新用户</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          演示创建包含复杂数据类型的用户记录
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              姓名:
            </label>
            <input
              type="text"
              value={newUserData.name}
              onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="请输入用户姓名"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              邮箱:
            </label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="请输入邮箱地址"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              标签 (Set 类型, 逗号分隔):
            </label>
            <input
              type="text"
              placeholder="admin,premium,user"
              value={newUserData.tags}
              onChange={(e) => setNewUserData((prev) => ({ ...prev, tags: e.target.value }))}
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
              placeholder='{"theme": "dark", "language": "zh"}'
              value={newUserData.metadata}
              onChange={(e) => setNewUserData((prev) => ({ ...prev, metadata: e.target.value }))}
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
          onClick={handleCreateUser}
          disabled={!(newUserData.name && newUserData.email) || createUserMutation.isPending}
          style={{
            padding: '12px 24px',
            backgroundColor:
              newUserData.name && newUserData.email && !createUserMutation.isPending
                ? '#1976d2'
                : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor:
              newUserData.name && newUserData.email && !createUserMutation.isPending
                ? 'pointer'
                : 'not-allowed',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          {createUserMutation.isPending ? '创建中...' : '创建用户'}
        </button>

        {createUserMutation.isError && (
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
            创建失败: {createUserMutation.error?.message}
          </div>
        )}

        {createUserMutation.isSuccess && (
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
            用户创建成功！新用户已添加到列表中。
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>💡 演示说明</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#1565c0' }}>
          <li>
            <strong>Date 对象:</strong> 创建时间和最后登录时间会自动保持为 Date 类型
          </li>
          <li>
            <strong>Set 对象:</strong> 标签以 Set 形式存储，自动去重
          </li>
          <li>
            <strong>Map 对象:</strong> 元数据以 Map 形式存储键值对
          </li>
          <li>
            <strong>文件上传:</strong> 支持头像上传，使用 base64 编码传输
          </li>
          <li>
            <strong>SuperJSON:</strong> 所有复杂数据类型都通过 SuperJSON 自动序列化
          </li>
        </ul>
      </div>
    </div>
  );
}
