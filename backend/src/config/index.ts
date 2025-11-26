/**
 * Application configuration
 */
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  initialBalance: 1000,
  maxHistoryLimit: 100,
  bodyLimit: '10kb'
} as const;

export type Config = typeof config;
