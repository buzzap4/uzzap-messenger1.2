import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '', // Updated to match /lib/supabase.ts
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '' // Updated to match /lib/supabase.ts
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
      if (error.message.includes('The resource was not found')) { // Check the error message
        console.log(`Bucket "${bucketName}" not found. Creating it...`);
        // Buckets are created with public access to allow public file sharing.
        // Ensure this aligns with your application's security requirements.
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
