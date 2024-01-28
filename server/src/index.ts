import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import cacheControl from "express-cache-controller";

import app from "./app";
import { env } from "./utils";
import { examineToken } from "./middlerwares";

const server: Express = express();

server.use(cors({ credentials: true, origin: "http://34.143.251.150:80" }));
server.use(morgan("dev"));
server.use(cookieParser());
server.use(cacheControl());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(examineToken);
server.use(app);

export default main(env.PORT || 3000, server);

function main(port: number, sv: Express): void {
    sv.listen(port, () => {
        console.log(`Server running on http://localhost:${port}/`);
    });
}