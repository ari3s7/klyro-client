import { api } from "@/lib/axios";

export const deleteChannel = async (channelId: string) => {
  const response = await api.delete(`/channel/${channelId}`);

  return response.data;
};