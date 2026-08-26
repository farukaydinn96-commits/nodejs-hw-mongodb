import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contacts.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "_id",
    sortOrder = "asc",
    isFavourite,
    contactType,
  } = req.query;
  const contacts = await getAllContacts({
    userId: req.user._id,
    page,
    perPage,
    sortBy,
    sortOrder,
    filter: { isFavourite, contactType },
  });
  res.status(200).json({
    status: 200,
    message: "Successfully found contacts!",
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);
  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  let photo;
  if (req.file) {
    photo = await saveFileToCloudinary(req.file);
  }

  const contact = await createContact({
    ...req.body,
    userId: req.user._id,
    photo,
  });

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  let photo;

  if (req.file) {
    photo = await saveFileToCloudinary(req.file);
  }

  const result = await updateContact(
    contactId,
    { ...req.body, photo },
    req.user._id,
  );

  if (!result) {
    throw createHttpError(404, "Contact not found");
  }
  res.status(200).json({
    status: 200,
    message: "Successfully updated a contact!",
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const result = await deleteContact(contactId, req.user._id);
  if (!result) {
    throw createHttpError(404, "Contact not found");
  }
  res.status(204).send();
};
