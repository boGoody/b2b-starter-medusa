import { QUOTE_MODULE } from "./src/modules/quote";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV!, process.cwd());

// Get Redis URL from public URL environment variable
const REDIS_URL = process.env.REDIS_PUBLIC_URL;
console.log("Redis URL:", REDIS_URL);
const hasRedis = Boolean(REDIS_URL);
console.log("Has Redis:", hasRedis);

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    companyModuleService: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    // Redis modules with more explicit configuration
    ...(hasRedis
      ? {
          [Modules.CACHE]: {
            resolve: "@medusajs/cache-redis",
            options: {
              redisUrl: REDIS_URL,
              ttl: 30,
            }
          },
          [Modules.EVENT_BUS]: {
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: REDIS_URL,
            }
          },
          [Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                url: REDIS_URL,
              }
            }
          }
        }
      : {
          [Modules.CACHE]: {
            resolve: "@medusajs/medusa/cache-inmemory",
          },
          [Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
          }
        }
    ),
  },
});
