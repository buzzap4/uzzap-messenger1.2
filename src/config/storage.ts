import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export const storageConfig = {
  bucketName: 'uzzap', // The name you gave your bucket in Supabase Storage
  // No need for region in Supabase as it's handled by the client
};

export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .storage
      .getBucket(bucketName);

    if (error) {
      if (error.message === 'The resource was not found') {
        console.log(`Bucket "${bucketName}" not found. Creating it...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
        if (createError) throw createError;
        console.log(`Bucket "${bucketName}" created successfully.`);
        return true;
      }
      throw error;
    }
    return !!data;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};
