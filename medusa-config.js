const dotenv = require("dotenv");
const path = require("path");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const PAYHERE_API_KEY = "8cL2q2uVS6748aiKIwbPNt4Ds9cWpaRam4PXNoMzCM8x";
const PAYHERE_MERCHANT_ID = "1226131";
const PAYHERE_MERCHANT_SECRET = "MTQ0MTEyNjMzOTQyNTgzOTI5ODEyMDY3MTI0NzAwMzYzNjI0Mjk4NA==";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
  {
    resolve: '@payhere/payhere-mobilesdk-reactnative',
    options: {
      api_key: PAYHERE_API_KEY,
      merchantId: PAYHERE_MERCHANT_ID,
      merchantSecret: PAYHERE_MERCHANT_SECRET,
    },
  }
];

const modules = {
  /*eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },*/
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
  paymentProviders: [
    {
      id: "payhere",
      config: {
        merchant_id: "1226131",
        merchant_secret: "MTQ0MTEyNjMzOTQyNTgzOTI5ODEyMDY3MTI0NzAwMzYzNjI0Mjk4NA==",
      },
      pluginOptions: {
        path: path.resolve(__dirname, "../src/services/payhere-payment/index.ts"),
      },
    },
  ]
};
