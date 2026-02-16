'use client';

import AssetCard from '@/components/AssetCard';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetTransferredAssetsQuery,
  useGetRecievedAssetsQuery,
} from '@/redux/features/assets/assetsApiSlice';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumberWithCommas } from '@/utils/helpers';
import AssetCardSkeleton from '@/components/AssetCardSkeleton';

const Page = ({ searchParams }) => {
  const newSearchParams = useSearchParams();
  const [pageNumberValue, setPageNumberValue] = useState(1);
  const router = useRouter();
  const {
    data,
    isSuccess,
    error,
    isLoading: transferredLoading,
  } = useGetTransferredAssetsQuery({
    pageSize: 10,
    pageNumber: pageNumberValue,
    search: '',
  });
  const {
    data: recievedAssets,
    isSuccess: recievedAssetsSuccess,
    error: recievedAssetsError,
    isLoading: recievedAssetsLoading,
  } = useGetRecievedAssetsQuery({
    pageSize: 10,
    pageNumber: pageNumberValue,
    search: '',
  });
  const searchParamsValue =
    searchParams?.pageType || newSearchParams.get('pageType');

  useEffect(() => {
    router.push('/user/transferred?pageType=transferred');
  }, []);

  return (
    <div>
      <div className='flex items-center justify-between '>
        <div className='flex items-center gap-5'>
          <button
            className={`flex items-center gap-2 py-2 cursor-pointer ${
              pageNumberValue === 1 && 'text-gray-400'
            }`}
            onClick={() => setPageNumberValue(prev => prev - 1)}
            disabled={pageNumberValue === 1}
          >
            <ArrowLeftCircle />
            <p className='hidden md:block'>Prev</p>
          </button>
          <p className='hidden font-medium md:block'>{`${pageNumberValue} of ${formatNumberWithCommas(
            data?.totalPages || recievedAssets?.totalPages || 0
          )}`}</p>
          <button
            className={`flex items-center gap-2 py-2 cursor-pointer ${
              pageNumberValue === data?.totalPages ||
              pageNumberValue === recievedAssets?.totalPages ||
              (pageNumberValue === 1 && 'text-gray-400')
            }`}
            disabled={
              pageNumberValue === data?.totalPages ||
              pageNumberValue === recievedAssets?.totalPages ||
              pageNumberValue === 1
            }
            onClick={() => setPageNumberValue(prev => prev + 1)}
          >
            <p className='hidden md:block'>Next</p>
            <ArrowRightCircle />
          </button>
        </div>
        <div className='flex flex-row items-center text-white border-2 rounded-md'>
          <div
            onClick={() =>
              router.push('/user/transferred?pageType=transferred')
            }
            className={`${
              searchParamsValue === 'transferred'
                ? 'bg-[#041B60]'
                : 'bg-transparent  hover:bg-transparent text-black'
            } px-2 py-1 md:py-2 text-sm md:text-base rounded-md cursor-pointer`}
          >
            Transferred
          </div>
          <div
            onClick={() => router.push('/user/transferred?pageType=recieved')}
            className={`${
              searchParamsValue === 'recieved'
                ? 'bg-[#041B60]'
                : 'bg-transparent  hover:bg-transparent text-black'
            } px-2 py-1 md:py-2 text-sm md:text-base rounded-md cursor-pointer `}
          >
            Recieved
          </div>
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {searchParamsValue === 'transferred' &&
          isSuccess &&
          data?.transferredAssets?.map(transferredAsset => (
            <AssetCard
              key={transferredAsset?.asset?.uniqueNumber}
              image={transferredAsset?.asset?.images[0]}
              type={transferredAsset?.asset?.type}
              brand={transferredAsset?.asset?.brand}
              model={transferredAsset?.asset?.model}
              status={transferredAsset?.asset?.status}
              route={`/user/transferred/${transferredAsset?._id}`}
            />
          ))}
        {searchParamsValue === 'recieved' &&
          recievedAssetsSuccess &&
          recievedAssets?.recievedAssets?.map(recievedAsset => (
            <AssetCard
              key={recievedAsset?.asset?.uniqueNumber}
              image={recievedAsset?.asset?.images[0]}
              type={recievedAsset?.asset?.type}
              brand={recievedAsset?.asset?.brand}
              model={recievedAsset?.asset?.model}
              status={transferredAsset?.asset?.status}
              route={`/user/transferred/recieved/${recievedAsset?._id}`}
            />
          ))}
        {error?.status === 404 && searchParamsValue === 'transferred' && (
          <div className='flex flex-col justify-end items-center h-[30vh] gap-5 col-span-4 '>
            <p>No Transferred Assets Found, add some new assets</p>
          </div>
        )}
        {recievedAssetsError?.status === 404 &&
          searchParamsValue === 'recieved' && (
            <div className='flex flex-col justify-end items-center h-[30vh] gap-5 col-span-4 '>
              <p>
                No Recieved Assets Found, assets transferred to you will apear
                here.
              </p>
            </div>
          )}
        {(transferredLoading || recievedAssetsLoading) && (
          <>
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
