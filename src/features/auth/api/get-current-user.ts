import { api } from "@/lib/axios";

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get("/auth/me");
  return response.data.data;
};