import { env } from '~/config/environment'

// Nhung domain duoc phep truy cap vao tai nguyen cua server
export const WHITELIST_DOMAINS = [
  'https://trello-frontend-eosin.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT