import { api } from "@/lib/axios";

export const logout = async () => {
  await api.post("/auth/logout");
};