/**
 * Shared TypeScript-compatible type definitions (as JSDoc)
 * PhotoVault — shared/types/index.js
 *
 * These types are used across frontend and backend for consistency.
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} [displayName]
 * @property {string} [bio]
 * @property {string} [avatarUrl]
 * @property {string} [location]
 * @property {string} [website]
 * @property {string} [worksLink]
 * @property {'user'|'admin'} role
 * @property {number} totalLikes
 * @property {number} totalDownloads
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Photo
 * @property {string} _id
 * @property {string} title
 * @property {string} [description]
 * @property {string} imageUrl
 * @property {string} imagePublicId
 * @property {string} [thumbnailUrl]
 * @property {User} photographer
 * @property {string[]} tags
 * @property {string[]} [aiTags]
 * @property {string} [aiDescription]
 * @property {boolean} aiGenerated
 * @property {number} likeCount
 * @property {number} downloadCount
 * @property {number} viewCount
 * @property {boolean} isPublic
 * @property {boolean} [isLiked]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} total
 * @property {number} page
 * @property {number} pages
 * @property {number} limit
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} [data]
 */

// API endpoint constants (shared reference)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  PHOTOS: {
    LIST: '/api/photos',
    UPLOAD: '/api/photos/upload',
    BY_ID: (id) => `/api/photos/${id}`,
    DOWNLOAD: (id) => `/api/photos/${id}/download`,
  },
  LIKES: {
    LIKE: (photoId) => `/api/likes/${photoId}`,
    UNLIKE: (photoId) => `/api/likes/${photoId}`,
  },
  SEARCH: '/api/search',
  USERS: {
    BY_ID: (id) => `/api/users/${id}`,
    PHOTOS: (id) => `/api/users/${id}/photos`,
    STATS: (id) => `/api/users/${id}/stats`,
  },
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_FILE_SIZE_MB = 20
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
