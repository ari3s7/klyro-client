import { api } from "@/lib/axios";

export type ServerMember = {
  id: string;
  username: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  role?: string;
};

export const getServerMembers = async (serverId: string): Promise<ServerMember[]> => {
  const response = await api.get(`/servers/${serverId}/members`);
  return response.data.data;
};