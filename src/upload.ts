import { supabase, storageConfig, ensureBucketExists } from './config/storage';

export const uploadFile = async (file: File, filePath: string): Promise<string | null> => {
  try {
    // Ensure the bucket exists
    const bucketExists = await ensureBucketExists(storageConfig.bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket "${storageConfig.bucketName}" does not exist and could not be created.`);
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(storageConfig.bucketName)
      .upload(filePath, file);

    if (error) throw error;

    console.log('File uploaded successfully:', data);
    return data?.path || null;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};
