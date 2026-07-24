export interface Message {
  id: string;
  content: string;
  createdAt: string;

  sender: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}