/** Public company details — must match RapidGateway / KYC documents exactly. */
export const COMPANY = {
  legalName: 'Digital Dunya',
  productName: 'Court Files',
  website: 'https://clerkdiary.com',
  email: 'aliwheed@gmail.com',
  phone: '+923027857887',
  phoneDisplay: '+92 302 7857887',
  /** Exact address as submitted in merchant documents */
  address:
    'House #3 street #2 Mohallah Eid Gah Minchinabad District Bahawalnagar',
  paymentGateway: 'RapidGateway',
} as const;
