'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Facebook, MapPin, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HOTLINES = ['0866 062 818', '0972 990 557'];
const FACEBOOK_URL = 'https://www.facebook.com/share/18jS1ZxWAb/?mibextid=wwXIfr';
const MAPS_URL = 'https://maps.google.com/?q=Long+Xuyen+Phuc+Tho+Ha+Noi';

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <a href={`tel:${HOTLINES[0].replace(/\s/g, '')}`}>
            <Button size="icon" className="h-11 w-11 rounded-full bg-green-500 hover:bg-green-600 shadow-lg" title="Hotline">
              <Phone className="h-5 w-5" />
            </Button>
          </a>
          <a href={`https://zalo.me/${HOTLINES[0].replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
            <Button size="icon" className="h-11 w-11 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg" title="Zalo">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
            <Button size="icon" className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg" title="Facebook">
              <Facebook className="h-5 w-5" />
            </Button>
          </a>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            <Button size="icon" className="h-11 w-11 rounded-full bg-red-500 hover:bg-red-600 shadow-lg" title="Google Maps">
              <MapPin className="h-5 w-5" />
            </Button>
          </a>
        </div>
      )}
      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full brand-bg text-white shadow-xl transition-transform hover:scale-105',
          open && 'rotate-45'
        )}
        onClick={() => setOpen(!open)}
        title="Liên hệ"
      >
        {open ? <X className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
      </Button>
    </div>
  );
}
