export type CourtCategory =
  | 'Civil Courts'
  | 'Session Courts'
  | 'High Courts'
  | 'Supreme Courts'
  | 'Family Courts'
  | 'Magisterial Courts'
  | 'Others';

export type AdvocateFor = 'Party 1' | 'Party 2';

export type CaseStatus = 'pending' | 'decided' | 'party_left';

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
  city: string;
  judgeName: string;
  advocateFor: AdvocateFor;
  party1Advocate: string;
  party2Advocate: string;
  nextDate: string; // ISO date YYYY-MM-DD
  proceeding: string;
  remarks: string;
  status: CaseStatus;
  /** Reason for decided (required) or party left (optional). */
  statusRemarks: string;
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
