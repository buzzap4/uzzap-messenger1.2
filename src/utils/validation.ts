export const validateMessage = (content: string): boolean => {
  if (!content.trim()) return false;
  if (content.length > 500) return false;
  // Add more validation rules
  return true;
};

export const validateUsername = (username: string): boolean => {
  if (!username.trim()) return false;
  if (username.length < 3 || username.length > 30) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  return true;
};

export const validateFileUpload = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (file.size > maxSize) return false;
  if (!allowedTypes.includes(file.type)) return false;
  return true;
};
