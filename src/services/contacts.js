import { Contact } from "../db/Contact.js";

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = "asc",
  sortBy = "name",
  filter = {},
  userId,
}) => {
  const skip = (page - 1) * perPage;

  const contactFilter = { ...filter, userId };

  const contactsQuery = Contact.find(contactFilter);
  const contacts = await contactsQuery
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });
  const totalItems = await Contact.countDocuments(contactFilter);
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, userId, payload) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
  });
};

export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};
