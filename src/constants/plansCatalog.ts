export interface Plan {
  id: string;
  name: string;
  description: string;
  amountPkr: number;
  currency: string;
  durationDays: number;
  features: string[];
}

/** Default catalog — keep in sync with court_files_server `plansCatalog.ts`. */
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Full access for 30 days',
    amountPkr: 150,
    currency: 'PKR',
    durationDays: 30,
    features: [
      'Unlimited cases (after 10 free)',
      'Calendar & search',
      'Email support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    description: 'Full access for 365 days — best value',
    amountPkr: 1400,
    currency: 'PKR',
    durationDays: 365,
    features: [
      'Unlimited cases (after 10 free)',
      'Calendar & search',
      'Priority support',
      'Save vs monthly',
    ],
  },
];
