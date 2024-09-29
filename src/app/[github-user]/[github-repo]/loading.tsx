import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-screen p-4 w-screen gap-4 grid grid-rows-[auto_1fr]">
      <Skeleton className="h-14 w-full flex-shrink-0" />
      <div className="h-full flex w-full gap-4">
        <Skeleton className="h-full w-full" />

        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
