export type ManualPaidToMethod = 'bank' | 'easypaisa' | 'jazzcash';

export type ManualPlanId = 'monthly' | 'yearly';

export type ManualRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ManualPaymentSubmitBody {
  planId: ManualPlanId;
  paidToMethod: ManualPaidToMethod;
  transactionId: string;
  senderAccountName: string;
  senderAccountTitle: string;
  senderPhone?: string;
  notes?: string;
}

export interface ManualPaymentRequestDto {
  id: string;
  planId: string;
  amountPkr: number;
  status: ManualRequestStatus | string;
  paidToMethod: ManualPaidToMethod | string;
  transactionId: string;
  senderAccountName: string;
  senderAccountTitle: string;
  senderPhone: string;
  notes: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

export function isManualPaidToMethod(value: string): value is ManualPaidToMethod {
  return value === 'bank' || value === 'easypaisa' || value === 'jazzcash';
}

export function isManualPlanId(value: string): value is ManualPlanId {
  return value === 'monthly' || value === 'yearly';
}
