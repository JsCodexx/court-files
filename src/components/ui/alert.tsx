import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-md border px-4 py-3 text-sm mb-4',
  {
    variants: {
      variant: {
        default: 'bg-card text-foreground',
        destructive:
          'border-destructive/40 bg-destructive/10 text-destructive',
        info: 'border-primary/40 bg-accent text-accent-foreground',
        success: 'border-success/40 bg-success/10 text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

export { Alert, alertVariants };
