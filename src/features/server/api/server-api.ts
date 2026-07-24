import { api } from "@/lib/axios";
import type { Server } from "../types";

export const getServers = async (): Promise<Server[]> => {
  const response = await api.get("/servers");
  return response.data.data;
};

interface CreateServerInput {
  name: string;
  description?: string;
}

export const createServer = async (data: CreateServerInput) => {
  const response = await api.post("/servers", data);

  return response.data.data;
};