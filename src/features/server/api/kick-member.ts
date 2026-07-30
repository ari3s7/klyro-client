import { api } from "@/lib/axios";

export const kickMember = async (serverId: string, memberId: string) => {
  const response = await api.delete(`/servers/${serverId}/members/${memberId}`);
  return response.data;
};
