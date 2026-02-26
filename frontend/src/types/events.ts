export type EventType = "event" | "hackathon";

export interface SpaceEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startTime: string;
  endTime: string;
  location: string;
  organizerName: string;
  createdAt: string;
}
