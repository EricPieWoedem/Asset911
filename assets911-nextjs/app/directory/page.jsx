'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useSelector } from 'react-redux';
import { useGetPublicAssetQuery } from '@/redux/features/assets/assetsApiSlice';
import { toast } from '@/components/ui/use-toast';

const Page = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const currentUser = useSelector(selectCurrentUser);
  const { data, isLoading } = useGetPublicAssetQuery(search);

  return (
    <div className='w-full h-[100vh] flex justify-center items-center bg-gradient-to-r from-indigo-700 via-indigo-700 to-blue-900 text-white'>
      <div className='w-[80%] 2xl:w-[60%] gap-10 flex justify-center flex-col items-center'>
        <div className='absolute top-2 right-5'>
          {Object?.keys(currentUser)?.length &&
          currentUser?.institutionName?.id == 'police' ? (
            <UserNav userGroup='police' />
          ) : (
            <Button onClick={() => router.push('/login/police')}>Login</Button>
          )}
        </div>
        <div className='flex justify-center'>
          <Image
            src='/images/assets911-logo.png'
            width={500}
            height={500}
            alt='logo'
          />
        </div>
        <p className='font-medium text-center md:text-xl'>
          Welcome to our Assets Directory Search, your gateway to exploring the
          wealth of possessions within our database! Here, you can seamlessly
          search for existing assets using their unique identification numbers.
          Whether you&apos;re a curious browser or seeking specific details, our
          user-friendly interface makes the process a breeze.
        </p>
        <Input
          className='md:w-[50%] py-3 text-black'
          placeholder='IMEI / VIN / SERIAL NO.'
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          onClick={() => {
            if (!isLoading && !data) {
              alert('Asset not found');
            } else {
              router.push(`/directory/${search}`);
            }
          }}
          className='text-lg'
        >
          Find Asset
        </Button>
      </div>
    </div>
  );
};

export default Page;
