import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

interface AuthResponse {
  user: any;
  token: string;
}

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Create new user
  const user = new User({ email, password });
  await user.save();

  // Generate token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  return { user, token };
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid login credentials");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid login credentials");
  }

  // Generate token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  return { user, token };
};

export const getCurrentUser = async (token: string) => {
  if (!token) {
    throw new Error("Please authenticate");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    _id: string;
  };
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
