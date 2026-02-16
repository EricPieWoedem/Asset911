'use client';

import Link from 'next/link';
import AssetCard from '@/components/AssetCard';
import {
  useGetAssetsQuery,
  useGetStatisticsQuery,
} from '@/redux/features/assets/assetsApiSlice';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import AssetCardSkeleton from '@/components/AssetCardSkeleton';

const Page = () => {
  const {
    data: assets,
    isLoading,
    isSuccess,
    error,
  } = useGetAssetsQuery({ pageSize: 4, pageNumber: 1, search: '' });
  const { data: statistics } = useGetStatisticsQuery();

  return (
    <div className='h-full'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Assets'
          bgcolor='bg-green-100'
          cardValue={statistics?.totalAssets}
        />
        <StatsCard
          title='Total Sold Assets'
          bgcolor='bg-orange-100'
          cardValue={statistics?.totalSold}
        />
        <StatsCard
          title='Total Transferred Assets'
          bgcolor='bg-blue-100'
          cardValue={statistics?.totalTransferred}
        />
        <StatsCard
          title='Total Lost Assets'
          bgcolor='bg-red-100'
          cardValue={statistics?.totalLost}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 p-3 md:grid-cols-2 lg:grid-cols-4'>
        {!isLoading &&
          isSuccess &&
          assets.assets?.map(asset => (
            <AssetCard
              key={asset.uniqueNumber}
              image={asset.images[0]}
              type={asset.type}
              brand={asset.brand}
              model={asset.model}
              status={asset.status}
              route={`/user/assets/${asset._id}`}
            />
          ))}
        {isLoading && (
          <>
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
          </>
        )}
        {error?.status === 404 && (
          <div className=' flex  flex-col items-center justify-end h-[30vh] col-span-4 gap-5'>
            <p className='text-lg font-medium'>
              No Assets Found, add some new assets
            </p>
            <Link href='/user/assets/new'>
              <Button className='bg-blue-500'>Add new asset</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
