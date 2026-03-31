import { Suspense } from 'react';
import { ShareContent } from '@/components/share-content';
import { Loader2 } from 'lucide-react';

function ShareFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<ShareFallback />}>
      <ShareContent />
    </Suspense>
  );
}
