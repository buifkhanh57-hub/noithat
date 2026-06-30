'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      size="icon"
      className={cn(
        'fixed bottom-24 left-6 z-40 h-11 w-11 rounded-full shadow-lg transition-opacity',
        'animate-fade-in'
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Lên đầu trang"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
