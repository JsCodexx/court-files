/** Routes under subscription / billing where shared billing nav is shown. */
export function isBillingRoute(pathname: string): boolean {
  return (
    pathname === '/plans' ||
    pathname === '/payments' ||
    pathname.startsWith('/payments/')
  );
}

/** Payment history / checkout hub — not manual proof upload. */
export function isPaymentsHubRoute(pathname: string): boolean {
  return pathname === '/payments';
}

export function isManualPaymentRoute(pathname: string): boolean {
  return pathname === '/payments/manual' || pathname.startsWith('/payments/manual/');
}
