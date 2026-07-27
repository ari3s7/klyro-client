import { api } from "@/lib/axios";

interface EditChannelInput {
  name: string;
  type: "TEXT" | "VOICE";
}

export const editChannel = async (
  channelId: string,
  data: EditChannelInput
) => {
  const response = await api.patch(`/channel/${channelId}`, data);

  return response.data;
};
