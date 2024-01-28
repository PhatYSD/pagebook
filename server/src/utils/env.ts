import { cleanEnv, str, num } from "envalid";

const env = cleanEnv(process.env, {
    PORT: num(),
    JWT_SECRET_ACCESS: str(),
    JWT_SECRET_ACCESS_DEV: str(),
    JWT_SECRET_REFRESH: str(),
    JWT_SECRET_REFRESH_DEV: str(),
    NODE_ENV: str(),
    BUCKET_NAME: str(),
    PROJECT_ID: str(),
    BUCKET_PARH: str()
});

export default env;