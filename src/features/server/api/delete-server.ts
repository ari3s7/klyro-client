import { api } from "@/lib/axios";

export const deleteServer = async (serverId: string) => {
  const response = await api.delete(`/servers/${serverId}`);
  return response.data;
};