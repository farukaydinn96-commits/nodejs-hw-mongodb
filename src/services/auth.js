import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../db/models/User.js";
import { Session } from "../db/models/Session.js";
import { sendEmail } from "../utils/sendMail.js";

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

export const sendResetToken = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  const resetToken = jwt.sign(
    { email: user.email, sub: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`;

  const emailTemplate = `
    <div>
      <h2>Şifre Sıfırlama İsteği</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı 5 dakika boyunca geçerlidir.</p>
      <a href="${resetLink}">Şifremi Sıfırla</a>
    </div>
  `;

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Password Reset Request",
      html: emailTemplate,
    });
  } catch (error) {
    throw createHttpError(
      500,
      "Failed to send the email, please try again later.",
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, process.env.JWT_SECRET);
  } catch (err) {
    throw createHttpError(401, "Token is expired or invalid.");
  }

  const user = await User.findOne({ email: entries.email, _id: entries.sub });
  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  await User.updateOne({ _id: user._id }, { password: encryptedPassword });

  await Session.deleteMany({ userId: user._id });
};
