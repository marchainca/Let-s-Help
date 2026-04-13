import 'dotenv/config';

export default {
  expo: {
    name: "solidarity-monitorin",
    slug: "solidarity-monitorin",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.API_URL,
      appEnv: process.env.APP_ENV,
    },
  },
};
