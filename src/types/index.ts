export type CourtCategory = 'Civil Courts' | 'Session Courts' | 'High Courts';

export type AdvocateFor = 'Party 1' | 'Party 2';

export type CaseStatus = 'pending' | 'decided';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  barAddress: string;
  password: string;
  createdAt: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
}

export interface HearingRecord {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  proceeding: string;
  adjournmentReason?: string;
  shortOrder?: string;
  remarks?: string;
  createdAt: string;
}

export interface CourtCase {
  id: string;
  caseId: string;
  category: CourtCategory;
  party1: {
    name: string;
    idCard: string;
    phone: string;
  };
  party2: {
    name: string;
    idCard: string;
    phone: string;
  };
  courtNumber?: string;
  judgeName: string;
  advocateFor: AdvocateFor;
  opponentCounsel: string;
  nextDate: string; // ISO date YYYY-MM-DD
  proceeding: string;
  remarks: string;
  status: CaseStatus;
  client: ClientInfo;
  hearings: HearingRecord[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}
