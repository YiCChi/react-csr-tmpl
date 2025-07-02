import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { mayStr } from '../services/may-error.ts';
import { trpc } from '../utils/trpc.ts';

function Component() {
  const [str, setStr] = useState('empty');

  // 使用 tRPC 查询文章列表
  const { data: postsData, isLoading: postsLoading } = useQuery(
    trpc.getPosts.queryOptions({ page: 1, limit: 3 }),
  );

  // 使用 tRPC 查询用户列表
  const { data: usersData, isLoading: usersLoading } = useQuery(trpc.getAllUsers.queryOptions());

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2>Welcome to Pure React + tRPC Demo</h2>
      <p>This demo showcases advanced tRPC features including:</p>

      <div style={{ margin: '2rem 0' }}>
        <h3>🚀 Features Demonstrated</h3>
        <ul>
          <li>
            <strong>Complex Data Types:</strong> Date, Set, Map with superjson serialization
          </li>
          <li>
            <strong>Multiple File Upload Methods:</strong>
          </li>
          <ul>
            <li>FormData uploads (recommended)</li>
            <li>File object uploads</li>
            <li>Base64 string uploads</li>
            <li>Binary stream uploads</li>
          </ul>
          <li>
            <strong>Type-safe API calls</strong> with full TypeScript support
          </li>
          <li>
            <strong>Real-time data updates</strong> with React Query integration
          </li>
        </ul>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3>📋 Quick Preview</h3>

        <div style={{ marginBottom: '1rem' }}>
          <h4>Recent Posts:</h4>
          {postsLoading ? (
            <p>Loading posts...</p>
          ) : postsData?.posts ? (
            <ul>
              {postsData.posts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <strong>{post.title}</strong> - {post.tags?.size || 0} tags,{' '}
                  {post.likes?.size || 0} likes
                  <br />
                  <small>Published: {post.publishedAt?.toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts found</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4>Registered Users:</h4>
          {usersLoading ? (
            <p>Loading users...</p>
          ) : usersData ? (
            <ul>
              {usersData.slice(0, 3).map((user) => (
                <li key={user.id}>
                  <strong>{user.name}</strong> ({user.email}) - {user.tags?.size || 0} tags
                  <br />
                  <small>Joined: {user.createdAt?.toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found</p>
          )}
        </div>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3>🔗 Explore the Demo</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/users"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0066cc',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            👥 User Management
          </Link>
          <Link
            to="/posts"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            📝 Post Management
          </Link>
        </div>
      </div>

      <div
        style={{
          margin: '2rem 0',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
        }}
      >
        <h4>Test Local Function</h4>
        <div>Current value: {str}</div>
        <button
          type="button"
          onClick={() => setStr(mayStr())}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          Test mayStr() Function
        </button>
      </div>
    </div>
  );
}

Component.displayName = 'Welcome';

export { Component };
