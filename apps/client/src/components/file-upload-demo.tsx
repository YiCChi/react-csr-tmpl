import { useMutation, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useRef, useState } from 'react';
import { orpc } from '../utils/orpc.ts';
import { trpc, trpcClient } from '../utils/trpc.ts';

interface FileUploadDemoProps {
  postId: number;
  onUploadSuccess?: (result: any) => void;
}

export default function FileUploadDemo({ postId, onUploadSuccess }: FileUploadDemoProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'formdata' | 'base64' | 'binary'>('formdata');
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // FormData 上传 mutation
  const uploadFormDataMutation = useMutation(
    orpc.post.uploadAttachmentFormData.mutationOptions({
      // trpc.uploadAttachmentFormData.mutationOptions({
      onSuccess: (result) => {
        setUploadResults((prev) => [...prev, result]);
        queryClient.invalidateQueries({ queryKey: [['getPost']] });
        onUploadSuccess?.(result);
      },
    }),
  );

  // Base64 上传 mutation
  const uploadBase64Mutation = useMutation({
    mutationFn: async (data: {
      postId: number;
      fileName: string;
      fileData: string;
      fileType: string;
    }) => {
      return trpcClient.uploadAttachment.mutate(data);
    },
    onSuccess: (result) => {
      setUploadResults((prev) => [...prev, result]);
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
      onUploadSuccess?.(result);
    },
  });

  // 批量图片上传 mutation
  const uploadImagesMutation = useMutation({
    mutationFn: async (data: {
      postId: number;
      images: Array<{ fileName: string; fileData: string; alt?: string }>;
    }) => {
      return trpcClient.uploadImages.mutate(data);
    },
    onSuccess: (result) => {
      setUploadResults((prev) => [...prev, result]);
      queryClient.invalidateQueries({ queryKey: [['getPost']] });
      onUploadSuccess?.(result);
    },
  });

  // 二进制数据上传 mutation (暂时移除类型问题)
  const uploadBinaryMutation = useMutation(
    orpc.post.uploadFileWithPost.mutationOptions({
      onSuccess: (result) => {
        setUploadResults((prev) => [...prev, result]);
        onUploadSuccess?.(result);
      },
    }),
  );

  const handleSingleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      switch (uploadMethod) {
        case 'formdata': {
          const formData = new FormData();
          formData.append('postId', postId.toString());
          formData.append('file', file);
          console.log(Array.from(formData.keys()));
          await uploadFormDataMutation.mutateAsync(formData);
          break;
        }
        case 'base64': {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // 移除 data:type;base64, 前缀
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          await uploadBase64Mutation.mutateAsync({
            postId,
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type,
          });
          break;
        }
        case 'binary': {
          await uploadBinaryMutation.mutateAsync({ postId: 1, file });
          break;
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const images = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ fileName: string; fileData: string; alt?: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve({
                  fileName: file.name,
                  fileData: result.split(',')[1],
                  alt: file.name,
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );

      await uploadImagesMutation.mutateAsync({ postId, images });
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('postId', postId.toString());
        formData.append('file', file);
        await uploadFormDataMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}
    >
      <h3>📁 File Upload Demo</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>Upload Method: </label>
        <select
          value={uploadMethod}
          onChange={(e) => setUploadMethod(e.target.value as any)}
          style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
        >
          <option value="formdata">FormData (Recommended)</option>
          <option value="binary">File Object</option>
          <option value="base64">Base64 String</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4>Single File Upload</h4>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleSingleFileUpload}
          disabled={uploading}
          style={{ marginBottom: '0.5rem' }}
        />
        <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
          Method: {uploadMethod} - Supports any file type
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4>Multiple Image Upload (Base64)</h4>
        <input
          ref={multiFileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleMultipleImageUpload}
          disabled={uploading}
          style={{ marginBottom: '0.5rem' }}
        />
        <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
          Only images, processed as base64 batch upload
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4>Drag & Drop Upload</h4>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: '2px dashed #ccc',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '4px',
            backgroundColor: uploading ? '#f0f0f0' : '#fafafa',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? (
            <p>Uploading...</p>
          ) : (
            <p>Drag files here to upload (uses FormData method)</p>
          )}
        </div>
      </div>

      {uploading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p>⏳ Uploading...</p>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>📋 Upload Results</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {uploadResults.slice(-5).map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '0.5rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                }}
              >
                <strong>{result.message}</strong>
                <br />
                File: {result.fileName || result.originalName}
                {result.fileSize && <span> ({(result.fileSize / 1024).toFixed(1)} KB)</span>}
                <br />
                <small>Uploaded at: {new Date(result.uploadedAt).toLocaleString()}</small>
                {result.filePath && (
                  <div>
                    <a
                      href={`http://localhost:4000${result.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#0066cc' }}
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
