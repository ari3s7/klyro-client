import { api } from "@/lib/axios";
import type { Attachment, Message } from "../types";

export const getMessages = async (
  channelId: string
): Promise<Message[]> => {
  const response = await api.get(
    `/channel/${channelId}/messages`
  );

  return response.data.data;
};

export interface UploadFileResult {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  type: "IMAGE" | "VIDEO" | "FILE";
}

export const uploadFile = async (file: File): Promise<UploadFileResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export interface SendMessageInput {
  content?: string;
  type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "AUDIO";
  attachments?: Attachment[];
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