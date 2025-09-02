import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  backTo?: string; // route path to go back to
  actions?: ReactNode;
  dense?: boolean;
}

export const PageHeader = ({ title, subtitle, icon, backTo = '/dashboard', actions, dense }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4,0,0.2,1] }}
      className={`w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 ${dense ? 'py-3' : 'py-5'} px-2 md:px-4 rounded-lg mb-6 shadow-soft/30`}
    >
      <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
        <div className="flex items-start gap-3">
          {backTo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backTo)}
              className="mt-1 inline-flex"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Back</span>
            </Button>
          )}
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              {icon}
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground max-w-prose">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
