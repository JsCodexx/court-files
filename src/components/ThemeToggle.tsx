import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface Props {
  className?: string;
}

const ThemeToggle: React.FC<Props> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn('shrink-0', className)}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light' : 'Dark'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;
