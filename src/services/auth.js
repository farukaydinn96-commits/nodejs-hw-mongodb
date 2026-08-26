import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../db/models/User.js";
import { Session } from "../db/models/Session.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const registerUser = async (payload) => {
  const userExists = await User.findOne({ email: payload.email });
  if (userExists) {
    throw createHttpError(409, "Email in use");
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await User.create({
    ...payload,
    password: encryptedPassword,
  });
};

const createSession = () => {
  const accessToken = crypto.randomBytes(30).toString("base64");
  const refreshToken = crypto.randomBytes(30).toString("base64");

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, "User not found or incorrect password");
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, "User not found or incorrect password");
  }

  // Varsa kullanıcının eski oturumunu siliyoruz
  await Session.deleteOne({ userId: user._id });

  const newSession = createSession();

  return await Session.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, "Session not found");
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, "Session token expired");
  }

  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  return await Session.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};
