import { api } from "@/lib/axios";

interface EditServerInput {
  name: string;
  description?: string;
}

export const editServer = async (
  serverId: string,
  data: EditServerInput
) => {
  const response = await api.patch(`/servers/${serverId}`, data);

  return response.data;
};
