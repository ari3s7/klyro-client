export interface Attachment {
  id?: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  content: string | null;
  type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "AUDIO";
  createdAt: string;
  isEdited?: boolean;

  sender: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  attachments?: Attachment[];
}