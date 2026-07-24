export interface Server {
  id: string;
  name: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface JoinServerInput {
  inviteCode: string;
}