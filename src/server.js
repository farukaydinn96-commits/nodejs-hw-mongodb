import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import swaggerUI from "swagger-ui-express";
import contactsRouter from "./routers/contacts.js";
import authRouter from "./routers/auth.js";

import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const PORT = process.env.PORT || 3000;

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve("docs", "swagger.json"), "utf8"),
  );
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

  app.use("/auth", authRouter);
  app.use("/contacts", contactsRouter);

  app.use("*", notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
