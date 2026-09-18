import { User } from "../models/user";
import { hashPassword, generateToken } from "./authService";
import type { IUser } from "../models/user";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token: generateToken(user as IUser),
  };
}

export async function getUserByEmail(email: string) {
  const user = await User.findOne({ email });
  return user;
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  return user;
}