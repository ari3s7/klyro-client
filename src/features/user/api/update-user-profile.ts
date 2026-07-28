import { api } from "@/lib/axios";
import type { UserProfile } from "./get-user-profile";

export const updateUserProfile = async (data: { bio: string }): Promise<UserProfile> => {
  const response = await api.patch(`/users/me`, data);
  return response.data.data;
};