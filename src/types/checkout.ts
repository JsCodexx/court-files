export type CheckoutAvailability = {
  rapidGateway: boolean;
  manual: boolean;
};

export const DEFAULT_CHECKOUT: CheckoutAvailability = {
  rapidGateway: false,
  manual: true,
};
