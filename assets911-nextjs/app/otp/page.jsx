'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  useVerifyPhoneNumberMutation,
  usePhoneNumberLoginMutation,
} from '@/redux/features/auth/authApiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page({ searchParams }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userError, setUserError] = useState('');
  const [verifyOtp] = useVerifyPhoneNumberMutation();
  const [phoneNumberLogin] = usePhoneNumberLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const searchParamsTest = useSearchParams();

  const phoneNumber = searchParams?.phone || searchParamsTest.get('phone');

  const defaultValues = {
    otp: '',
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
          <Image fill src='/images/assets911.png' alt='logo' />
        </div>
        <div className='w-full lg:w-[50%] box-border flex items-center justify-center'>
          <div className=' w-[70%] 2xl:w-[50%] flex flex-col items-center'>
            <h1 className='mb-5 text-2xl font-semibold tracking-tight'>
              Verify OTP
            </h1>
            <p className='text-sm text-[#71717A] text-muted-foreground'>
              Enter the 4 digit otp sent to your phone number
            </p>
            <form
              className='w-full mt-5'
              onSubmit={handleSubmit(async data => {
                setIsLoading(true);
                await verifyOtp({
                  phoneNumber,
                  otp: data.otp,
                })
                  .unwrap()
                  .then(res => {
                    dispatch(
                      setCredentials({
                        user: res?.userProfile,
                        accessToken: res?.accessToken,
                      })
                    );
                    if (Object.keys(res?.userProfile).length > 0) {
                      router.push('/user');
                    } else {
                      router.push('/user/settings');
                    }
                  })
                  .catch(() => {
                    setIsLoading(false);
                    setUserError('Invalid otp');
                  });
              })}
            >
              <div className='space-y-5'>
                <Input
                  placeholder={`${errors.otp?.message || 'OTP'}`}
                  {...register('otp', {
                    required: 'Enter your OTP',
                  })}
                  className={`${errors.otp && 'border-red-500'}`}
                />
              </div>
              <Button
                className={`w-full my-5 bg-blue-500 ${
                  isLoading && ' opacity-60'
                }`}
              >
                {isLoading ? 'Loading...' : 'Verify'}
              </Button>
              {userError && (
                <p
                  className='text-center text-red-500 cursor-pointer hover:underline'
                  onClick={async () => {
                    await phoneNumberLogin({
                      phoneNumber: searchParams.phone,
                    })
                      .then(() => {
                        setUserError('');
                      })
                      .catch(() => {
                        setUserError('Resend failed');
                      });
                  }}
                >
                  {userError}
                  <span> resend otp ?</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
