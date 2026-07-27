import { api } from "@/lib/axios";
import type { Message } from "../types";

export const getMessages = async (
  channelId: string
): Promise<Message[]> => {
  const response = await api.get(
    `/channel/${channelId}/messages`
  );

  return response.data.data;
};

interface SendMessageInput {
  content: string;
}

export const sendMessage = async (
  channelId: string,
  data: SendMessageInput
) => {
  const response = await api.post(
    `/channel/${channelId}/messages`,
    data
  );

  return response.data.data;
};

interface UpdateMessageInput {
  content: string;
}

export const editMessage = async (
  messageId: string,
  data: UpdateMessageInput
): Promise<Message> => {
  const response = await api.put(`/messages/${messageId}`, data);

  return response.data.data;
};