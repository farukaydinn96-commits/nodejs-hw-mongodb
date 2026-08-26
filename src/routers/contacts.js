import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js"; // Güvenliği ekledik
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contacts.js";
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  patchContactController,
  deleteContactController,
} from "../controllers/contacts.js";

const router = Router();

router.use(authenticate);

router.get("/contacts", ctrlWrapper(getContactsController));
router.get(
  "/contacts/:contactId",
  isValidId,
  ctrlWrapper(getContactByIdController),
);
router.post(
  "/contacts",
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);
router.patch(
  "/contacts/:contactId",
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);
router.delete(
  "/contacts/:contactId",
  isValidId,
  ctrlWrapper(deleteContactController),
);

export default router;
