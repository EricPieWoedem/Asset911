'use client';

import './globals.css';
import Image from 'next/image';
import { useState } from 'react';
import {
  useSocailAuthMutation,
  usePhoneNumberLoginMutation,
} from '@/redux/features/auth/authApiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userError, setUserError] = useState('');
  const [socialLogin] = useSocailAuthMutation();
  const [phoneNumberLogin] = usePhoneNumberLoginMutation();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    phoneNumber: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <main>
      <div className='flex flex-row h-screen '>
        <div className='lg:w-[50%]  relative w-0'>
          <Image
            fill
            src='/images/assets911.png'
            alt='logo'
            className='object-cover'
          />
        </div>
        <div className='w-full lg:w-[50%] box-border flex items-center justify-center'>
          <div className=' w-[70%] 2xl:w-[50%] flex flex-col items-center'>
            <Image
              src='/images/blue-logo.png'
              alt='logo'
              width={290}
              height={90}
              className='md:hidden'
            />
            <h1 className='mb-5 text-2xl font-semibold tracking-tight'>
              Login
            </h1>
            <p className='mb-2 text-sm text-red-500'>{userError}</p>
            <p className='text-sm text-[#71717A] text-muted-foreground'>
              Enter your phone number to login
            </p>
            <form
              className='w-full mt-5'
              onSubmit={handleSubmit(async data => {
                setIsLoading(true);
                await phoneNumberLogin(data)
                  .unwrap()
                  .then(res => router.push(`/otp?phone=${res}`))
                  .catch(() => {
                    setIsLoading(false);
                    setUserError('Failed to login, please try again');
                  });
              })}
            >
              <div className='space-y-5'>
                <Input
                  placeholder={`${
                    errors.phoneNumber?.message || 'Phone Number'
                  }`}
                  {...register('phoneNumber', {
                    required: 'Enter your phone number',
                  })}
                  className={`${errors.phoneNumber && 'border-red-500'}`}
                />
              </div>
              <Button
                className={`w-full my-5 bg-blue-500 ${
                  isLoading && ' opacity-60'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
              <div className='flex flex-row items-center'>
                <hr className='w-full' />
                <p className='w-[400px] text-center text-muted-foreground text-[#71717A] text-sm'>
                  OR CONTINUE WITH
                </p>
                <hr className='w-full' />
              </div>
              <div className='flex items-center justify-center w-full my-2'>
                <GoogleLogin
                  cancel_on_tap_outside
                  onSuccess={async response => {
                    const userToken = response.credential;
                    try {
                      const socialUserData = await socialLogin({
                        user: userToken,
                      }).unwrap();

                      dispatch(
                        setCredentials({
                          user: socialUserData.userProfile,
                          accessToken: socialUserData.accessToken,
                        })
                      );
                      router.push('/user');
                    } catch (error) {
                      setUserError('Failed to login, please try again');
                    }
                  }}
                  onError={() => {
                    setUserError('Failed to login, please try again');
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
