import type { Channel } from "@/features/channel/types";



export interface Server {
  id: string;
  name: string;
  inviteCode: string;
  imageUrl?: string | null;
  createdAt: string;
  channels: Channel[];
  owner: {
    id: string;
    username: string;
  };
}

export interface JoinServerInput {
  inviteCode: string;
}