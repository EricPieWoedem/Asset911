'use client';

import Link from 'next/link';
import AssetCard from '@/components/AssetCard';
import useDebounce from '@/hooks/useDebounce';
import { useMemo, useState } from 'react';
import { useGetAssetsQuery } from '@/redux/features/assets/assetsApiSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatNumberWithCommas } from '@/utils/helpers';
import AssetCardSkeleton from '@/components/AssetCardSkeleton';

const Assets = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [pageNumberValue, setPageNumberValue] = useState(1);
  const {
    data: assets,
    isLoading,
    isSuccess,
    error,
  } = useGetAssetsQuery({
    pageSize: 10,
    pageNumber: pageNumberValue,
    search: debouncedSearch,
  });

  const totalPages = useMemo(() => {
    return assets?.totalPages || 1;
  }, [assets]);

  return (
    <div>
      <div className='flex items-end justify-between md:my-5 md:items-center'>
        <div className='flex items-center gap-5'>
          <button
            className={`flex items-center gap-2 py-2 cursor-pointer ${
              pageNumberValue === 1 && 'text-gray-400'
            }`}
            onClick={() => setPageNumberValue(prev => prev - 1)}
            disabled={pageNumberValue === 1}
          >
            <ArrowLeftCircle />
            <p>Prev</p>
          </button>
          <p className='hidden font-medium md:block'>{`${pageNumberValue} of ${formatNumberWithCommas(
            totalPages
          )}`}</p>
          <button
            className={`flex items-center gap-2 py-2 cursor-pointer ${
              pageNumberValue === totalPages && 'text-gray-400'
            }`}
            disabled={pageNumberValue === totalPages}
            onClick={() => setPageNumberValue(prev => prev + 1)}
          >
            <p>Next</p>
            <ArrowRightCircle />
          </button>
        </div>
        <div className='flex flex-row items-end gap-2 md:items-center'>
          <Input
            className='hidden w-full md:block max-w-44'
            placeholder='Search....'
            onChange={e => {
              setSearch(e.target.value);
            }}
          />
          <Link href='/user/assets/new'>
            <Button className='hidden bg-blue-500 md:block'>
              Add new asset
            </Button>
            <Button className='bg-blue-500 md:hidden '>
              <Plus />
            </Button>
          </Link>
        </div>
      </div>
      <div className='grid gap-4 py-3 md:px-10 md:grid-cols-2 lg:px-0 lg:grid-cols-4'>
        {!isLoading &&
          isSuccess &&
          assets.assets?.map(asset => (
            <AssetCard
              key={asset.uniqueNumber}
              image={asset.images[0]}
              type={asset.type}
              brand={asset.brand}
              model={asset.model}
              status={asset?.status}
              route={`/user/assets/${asset._id}`}
            />
          ))}
        {isLoading && (
          <>
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
          </>
        )}
        {error?.status === 404 && (
          <div className='flex flex-col justify-end items-center h-[30vh] gap-5 col-span-4 '>
            <p>No Assets Found, add some new assets</p>
            <Link href='/user/assets/new'>
              <Button className='bg-blue-500'>Add new asset</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;
