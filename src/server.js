import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

  app.use("/auth", authRouter);
  app.use("/contacts", contactsRouter);

  app.use("*", notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
