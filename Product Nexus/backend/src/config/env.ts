import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_sales_os'
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '7d'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  
  // n8n
  n8n: {
    url: process.env.N8N_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || ''
  },
  
  // AI Services
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || ''
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  
  // Data Enrichment APIs
  enrichment: {
    receitaWS: {
      apiKey: process.env.RECEITAWS_API_KEY || ''
    },
    linkedin: {
      apiKey: process.env.LINKEDIN_API_KEY || '',
      apiSecret: process.env.LINKEDIN_API_SECRET || ''
    }
  },
  
  // CRM Integrations
  crm: {
    pipedrive: {
      apiToken: process.env.PIPEDRIVE_API_TOKEN || '',
      domain: process.env.PIPEDRIVE_DOMAIN || ''
    },
    rdStation: {
      clientId: process.env.RD_STATION_CLIENT_ID || '',
      clientSecret: process.env.RD_STATION_CLIENT_SECRET || '',
      refreshToken: process.env.RD_STATION_REFRESH_TOKEN || ''
    },
    hubspot: {
      apiKey: process.env.HUBSPOT_API_KEY || ''
    },
    salesforce: {
      clientId: process.env.SALESFORCE_CLIENT_ID || '',
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
      username: process.env.SALESFORCE_USERNAME || '',
      password: process.env.SALESFORCE_PASSWORD || ''
    }
  },
  
  // Meta Business (Facebook/Instagram Ads)
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN || '',
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || ''
  },
  
  // Google Ads
  googleAds: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
  },
  
  // WhatsApp Business API
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || '',
    apiToken: process.env.WHATSAPP_API_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
  },
  
  // Email Service
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@nexussales.com'
  },
  
  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || ''
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || ''
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;

