import { Storage } from "@google-cloud/storage";
import path from "path";

import { env } from "./";

const gcs = new Storage({
    keyFilename: path.join(__dirname, env.BUCKET_PARH),
    projectId: env.PROJECT_ID
});

export const pagebookBucket = gcs.bucket(env.BUCKET_NAME);