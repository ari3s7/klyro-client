export interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "VOICE";
  position: number;
}