import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import dotenv from "dotenv";
import { getAllContacts, getContactById } from "./services/contacts.js";

dotenv.config();

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(
    pinoHttp({
      transport: {
        target: "pino-pretty",
      },
    }),
  );

  app.get("/contacts", async (req, res) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/contacts/:contactId", async (req, res) => {
    const { contactId } = req.params;
    try {
      const contact = await getContactById(contactId);

      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.use((req, res, next) => {
    res.status(404).json({ message: "Not found" });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
