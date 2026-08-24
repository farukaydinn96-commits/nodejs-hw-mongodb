import express from "express";
import pino from "pino-http";
import cors from "cors";
import contactsRouter from "./routers/contacts.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const setupServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors());
  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    }),
  );

  app.use(contactsRouter);

  app.use("*", notFoundHandler);

  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
