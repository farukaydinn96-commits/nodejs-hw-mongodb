import { Contact } from "../db/models/contacts.js";
export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortBy = "_id",
  sortOrder = "asc",
  filter = {},
}) => {
  const skip = (page - 1) * perPage;
  const contactQuery = Contact.find({ userId });

  if (filter.isFavourite !== undefined) {
    contactQuery.where("isFavourite").equals(filter.isFavourite);
  }
  if (filter.contactType) {
    contactQuery.where("contactType").equals(filter.contactType);
  }

  const contacts = await contactQuery
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(perPage);

  const totalItems = await Contact.find({ userId })
    .merge(contactQuery)
    .countDocuments();

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await Contact.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const updateContact = async (contactId, userId, payload) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true },
  );
  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });
  return contact;
};
