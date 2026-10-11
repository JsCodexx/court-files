import React from 'react';
import { Check } from '../icons';
import { cn } from '../../lib/utils';
import { Plan } from '../../pages/PlansPage';

function formatPkr(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

type PlanOfferCardProps = {
  plan: Plan;
  periodLabel: string;
  footer: React.ReactNode;
  className?: string;
};

/** Pricing card — forest header band matches landing & brand board. */
export function PlanOfferCard({
  plan,
  periodLabel,
  footer,
  className,
}: PlanOfferCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        plan.id === 'yearly' && 'ring-2 ring-[hsl(var(--brand-fresh)/0.3)]',
        className
      )}
    >
      <div className="bg-[hsl(var(--brand-forest))] px-5 py-4 dark:bg-sidebar">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/85">
          {plan.name}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-primary-foreground" dir="ltr">
          {formatPkr(plan.amountPkr)}
          <span className="ms-1 text-sm font-normal text-primary-foreground/75">
            / {periodLabel}
          </span>
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
          {(plan.features ?? []).map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-fresh))]" weight="bold" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">{footer}</div>
      </div>
    </article>
  );
}
