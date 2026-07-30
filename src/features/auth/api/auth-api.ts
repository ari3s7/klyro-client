import { api } from "@/lib/axios";
import type { RegisterInput, LoginInput } from "../types";

export const register = async (data: RegisterInput) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginInput) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return response.data;
};