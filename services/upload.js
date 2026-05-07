import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

const BASE_URL = 'https://comut-backend.onrender.com/api';

export const uploadFile = async (fileUri, fileName, mimeType, title = '', onProgress) => {
  const token = await SecureStore.getItemAsync('comut_token');
  const isZip = mimeType === 'application/zip' || fileName.endsWith('.zip');
  const endpoint = isZip ? `${BASE_URL}/content/upload-zip` : `${BASE_URL}/content/upload`;

  const uploadTask = FileSystem.createUploadTask(
    endpoint,
    fileUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType,
      parameters: { title: title || fileName },
      headers: { Authorization: `Bearer ${token}` }
    },
    (data) => {
      if (onProgress) {
        const progress = data.totalBytesSent / data.totalBytesExpectedToSend;
        onProgress(Math.min(progress, 1));
      }
    }
  );

  const result = await uploadTask.uploadAsync();
  if (result.status !== 200 && result.status !== 201) {
    throw new Error(JSON.parse(result.body)?.error || 'Upload échoué');
  }
  return JSON.parse(result.body);
};
