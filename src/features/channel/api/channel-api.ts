import { api } from "@/lib/axios";
import type{ Channel } from "../types";

export const getChannels = async (
  serverId: string
): Promise<Channel[]> => {
  const response = await api.get(`/server/${serverId}/channel`);

  return response.data.data;
};

interface CreateChannelInput {
  name: string;
}

export const createChannel = async (serverId: string, data: CreateChannelInput) => {
  const response = await api.post(`server/${serverId}/channel`, data);

  return response.data.data;
};