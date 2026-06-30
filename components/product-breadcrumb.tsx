'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export type ProductBreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

export function ProductBreadcrumb({
  items,
  className,
}: {
  items: ProductBreadcrumbItem[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <nav aria-label="breadcrumb" className={cn('mb-6', className)}>
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap rounded-full border border-[#6f4a2f]/10 bg-[linear-gradient(135deg,rgba(250,244,235,0.96),rgba(241,229,214,0.95))] px-3 py-2 shadow-[0_8px_24px_rgba(66,38,18,0.06)] sm:px-4 sm:py-3">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isHome = index === 0 && item.label === 'Trang chủ';

            return (
              <div key={`${item.label}-${index}`} className="flex items-center">
                <BreadcrumbItem>
                  {item.current || isLast ? (
                    <BreadcrumbPage className="rounded-full px-2 py-1 text-sm font-medium text-[#412512]">
                      {isHome ? <Home className="mr-1.5 h-4 w-4" /> : null}
                      <span>{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href || '#'}
                        className="flex items-center rounded-full px-2 py-1 text-sm font-medium text-[#7b5735] transition-all duration-200 hover:bg-[#f5e3cb] hover:text-[#3c2413]"
                      >
                        {isHome ? <Home className="mr-1.5 h-4 w-4" /> : null}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5 text-[#8f6340]" />
                  </BreadcrumbSeparator>
                ) : null}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
