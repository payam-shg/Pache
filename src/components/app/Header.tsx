
import { Coins, ArrowRightCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  pageTitle?: string;
  showBackButton?: boolean;
}

export default function Header({ pageTitle, showBackButton = false }: HeaderProps) {
  const displayTitle = pageTitle || "پاچه";
  
  return (
    <header className="py-6 px-4 md:px-6 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3" dir="ltr"> {/* Logo on left */}
          <Coins className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
        </div>
        {showBackButton && (
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center gap-2" dir="rtl">
              <Home className="h-5 w-5" />
              بازگشت به لیست پاچه‌ها
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
