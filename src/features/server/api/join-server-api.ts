import { api } from "@/lib/axios";

interface JoinServerInput {
  inviteCode: string;
}

export const joinServer = async (data: JoinServerInput) => {
  const response = await api.post("/servers/join", data);

  return response.data.data;
};