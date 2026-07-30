import { api } from "@/lib/axios";

export const leaveServer = async (serverId: string) => {
  const response = await api.post("/servers/leave", { serverId });
  return response.data;
};
