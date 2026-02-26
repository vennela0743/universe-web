export type OpportunityType = "hackathon" | "project" | "research";

export interface Opportunity {
  id: string;
  ownerUserId: string;
  ownerDisplayName: string;
  title: string;
  type: OpportunityType;
  skillsNeeded: string[];
  duration: string;
  commitment: string;
  description: string;
  createdAt: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  applicantUserId: string;
  applicantDisplayName: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  projectRoomId?: string;
}

export interface RoomMember {
  userId: string;
  displayName: string;
  joinedAt: string;
}

export interface ProjectRoom {
  id: string;
  opportunityId: string;
  title: string;
  createdAt: string;
  members: RoomMember[];
}

export interface RoomChatMessage {
  id: string;
  authorUserId: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
}

export interface RoomUpdate {
  id: string;
  authorUserId: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
}
