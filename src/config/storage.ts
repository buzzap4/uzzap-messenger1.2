import { supabase } from '../../lib/supabase';
import { StorageError } from '@supabase/storage-js';

export { supabase };

export const storageConfig = {
  bucketName: 'uzzap',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
};

export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: existingBucket, error: getBucketError } = await supabase
      .storage
      .getBucket(bucketName);

    if (getBucketError) {
      if (getBucketError.message.includes('The resource was not found')) {
        const { data: newBucket, error: createError } = await supabase.storage
          .createBucket(bucketName, {
            public: true,
            fileSizeLimit: storageConfig.maxFileSize,
            allowedMimeTypes: storageConfig.allowedFileTypes
          });

        if (createError) throw createError;
        return !!newBucket;
      }
      throw getBucketError;
    }

    return !!existingBucket;
  } catch (error) {
    console.error('Storage configuration error:', error);
    if (error instanceof StorageError) {
      throw new Error(`Storage error: ${error.message}`);
    }
    throw error;
  }
};

// Add type-safe file upload validation
export const validateFile = (file: File): boolean => {
  if (file.size > storageConfig.maxFileSize) {
    throw new Error(`File size exceeds ${storageConfig.maxFileSize / 1024 / 1024}MB limit`);
  }
  if (!storageConfig.allowedFileTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  return true;
};
