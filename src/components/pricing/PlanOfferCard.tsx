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

/** Pricing card — soft brand gradient (matches search & app panels). */
export function PlanOfferCard({
  plan,
  periodLabel,
  footer,
  className,
}: PlanOfferCardProps) {
  return (
    <article
      className={cn(
        'app-panel flex flex-col shadow-brand-hover transition-shadow',
        plan.id === 'yearly' &&
          'ring-1 ring-[hsl(var(--brand-fresh)/0.35)] ring-offset-2 ring-offset-background',
        className
      )}
    >
      <div className="brand-band px-5 py-4">
        <p className="page-eyebrow !text-[hsl(var(--brand-fresh))]">{plan.name}</p>
        <p
          className="mt-1 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--brand-forest))] dark:text-foreground"
          dir="ltr"
        >
          {formatPkr(plan.amountPkr)}
          <span className="ms-1 text-sm font-normal text-muted-foreground">
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
