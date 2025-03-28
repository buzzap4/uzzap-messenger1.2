import { DEFAULT_AVATAR_URL, FALLBACK_AVATAR_URL } from './constants';

class AvatarCache {
  private cache: Map<string, string> = new Map();
  private static instance: AvatarCache;

  private constructor() {}

  static getInstance(): AvatarCache {
    if (!AvatarCache.instance) {
      AvatarCache.instance = new AvatarCache();
    }
    return AvatarCache.instance;
  }

  getAvatarUrl(userId: string, username?: string): string {
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    const avatarUrl = `${DEFAULT_AVATAR_URL}?seed=${username || userId}`;
    this.cache.set(userId, avatarUrl);
    return avatarUrl;
  }

  getFallbackUrl(): string {
    return FALLBACK_AVATAR_URL;
  }

  setAvatarUrl(userId: string, url: string) {
    this.cache.set(userId, url);
  }

  clearCache() {
    this.cache.clear();
  }
}

export const avatarCache = AvatarCache.getInstance();
