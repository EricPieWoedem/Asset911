import { Skeleton } from './ui/skeleton';

const AssetCardSkeleton = () => {
  return (
    <div className='w-full space-y-3'>
      <Skeleton className='h-80' />
      <Skeleton className='h-10' />
    </div>
  );
};

export default AssetCardSkeleton;
