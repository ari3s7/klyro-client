import { api } from "@/lib/axios"; 

export type UserProfile = {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await api.get(`/users/${userId}`);
  return res.data.data;
}

