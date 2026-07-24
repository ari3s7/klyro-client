import { api } from "@/lib/axios";

export const deleteMessage = async (messageId: string) => {
  const response = await api.delete(`/messages/${messageId}`);

  return response.data;
};