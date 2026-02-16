'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useGetPublicAssetQuery } from '@/redux/features/assets/assetsApiSlice';
import { Input } from '@/components/ui/input';
import {
  setCredentials,
  selectCurrentUser,
} from '@/redux/features/auth/authSlice';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { useGetServerSessionQuery } from '@/redux/features/auth/authApiSlice';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

const Page = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetPublicAssetQuery(params?.id);
  const { data: police, isLoading: policeIsLoading } =
    useGetServerSessionQuery();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (police && !policeIsLoading) {
      dispatch(
        setCredentials({
          user: {
            name: police.name,
            email: police.email,
            institutionName: police.institutionName,
            token: police.accessToken,
          },
        })
      );
    }
  }, [police, policeIsLoading, dispatch]);

  useEffect(() => {
    if (!isLoading && !data) {
      router.push('/directory');
      toast({ description: 'Asset not found' });
    }
  }, [isLoading]);

  return (
    <div className='h-full  flex-col justify-center items-center max-w-[2000px] '>
      <div className='flex items-center justify-between py-3 px-5 bg-[#041B60] shadow-lg rounded-lg'>
        <Image
          src='/images/assets911-logo.png'
          alt='logo'
          width={150}
          height={100}
          onClick={() => router.push('/directory')}
          className='cursor-pointer'
        />
        <div>
          {Object?.keys(currentUser)?.length &&
          currentUser?.institutionName?.id == 'police' ? (
            <UserNav userGroup='police' />
          ) : (
            <Button onClick={() => router.push('/directory')}>Login</Button>
          )}
        </div>
      </div>
      <div className='flex  flex-col flex-grow h-[calc(100vh-70px)] lg:flex-row '>
        <div className='w-full min-h-[300px] h-full lg:w-[45%] p-5 '>
          <div className='relative h-full'>
            <Image
              src={data?.images[0] || '/images/ImagePlaceholder.svg'}
              fill
              alt='aseet-image'
              className='object-contain w-full h-full rounded-md'
              blurDataURL={data?.images[0]}
            />
          </div>
        </div>
        <div className=' w-full lg:w-[55%] p-5 '>
          <div className='flex flex-col items-center h-full lg:justify-center '>
            <div className='w-full overflow-y-auto'>
              <div className='grid grid-cols-1 gap-2 lg:gap-5 lg:grid-cols-2'>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Status</p>
                  <Input value={data?.status} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Asset Type</p>
                  <Input value={data?.type} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Unique Number</p>
                  <Input value={data?.uniqueNumber} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Brand</p>
                  <Input value={data?.brand} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Model</p>
                  <Input value={data?.model} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Date of Purchase</p>
                  <Input value={data?.dateOfPurchase} disabled />
                </div>
                <div className='flex flex-col justify-between gap-2 lg:col-span-2 '>
                  <p className='font-medium text-gray-500 '>
                    Place of registration
                  </p>
                  <Input value={data?.registrationAddress} disabled />
                </div>
                {currentUser?.institutionName?.id == 'police' && (
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Owner Name</p>
                    <Input value={data?.owner.name} disabled />
                  </div>
                )}
                {currentUser?.institutionName?.id == 'police' && (
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Owner Contact</p>
                    <Input value={data?.owner.phoneNumber} disabled />
                  </div>
                )}

                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>
                    Specification Details
                  </p>
                  <Textarea
                    id=''
                    rows={3}
                    value={data?.identificationDetails}
                    disabled
                  />
                </div>
                <div className='flex flex-col justify-between gap-2 '>
                  <p className='font-medium text-gray-500 '>Other Details</p>
                  <Textarea
                    id=''
                    rows={3}
                    value={data?.otherDetails}
                    disabled
                  />
                </div>
                <p className='px-2 text-sm italic font-medium text-right text-gray-500 lg:col-span-2'>
                  {`Asset registered on : ${formatDate(data?.createdAt)}`}
                </p>
              </div>
              {/* <div className='flex items-end justify-end pt-10 lg:flex-row'>
                <Button className=' bg-red-500 w-[50%]' type='button'>
                  Report
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
