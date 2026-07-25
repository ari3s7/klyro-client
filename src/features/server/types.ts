export interface Server {
  id: string;
  name: string;
  inviteCode: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface JoinServerInput {
  inviteCode: string;
}