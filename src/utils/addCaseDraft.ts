import type { CaseMatterCategory, CourtCategory, AdvocateFor } from '../types';

export const ADD_CASE_DRAFT_KEY = 'cf_add_case_draft_v1';

export type AddCaseDraft = {
  caseId: string;
  category: CourtCategory;
  caseCategory: CaseMatterCategory;
  party1Name: string;
  party1IdCard: string;
  party1Phone: string;
  party2Name: string;
  party2IdCard: string;
  party2Phone: string;
  courtNumber: string;
  city: string;
  judgeName: string;
  judgePersonId: string | null;
  advocateFor: AdvocateFor;
  party1Advocate: string;
  party1AdvocateId: string | null;
  party2Advocate: string;
  party2AdvocateId: string | null;
  nextDate: string;
  proceeding: string;
  remarks: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  savedAt: number;
};

export function readAddCaseDraft(): AddCaseDraft | null {
  try {
    const raw = sessionStorage.getItem(ADD_CASE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AddCaseDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() - (parsed.savedAt ?? 0) > 7 * 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(ADD_CASE_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeAddCaseDraft(draft: Omit<AddCaseDraft, 'savedAt'>): void {
  try {
    sessionStorage.setItem(
      ADD_CASE_DRAFT_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() })
    );
  } catch {
    /* ignore quota */
  }
}

export function clearAddCaseDraft(): void {
  try {
    sessionStorage.removeItem(ADD_CASE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
