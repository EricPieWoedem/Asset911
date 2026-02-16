'use client';

import '../globals.css';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useLoginInstitutionAdminMutation } from '@/redux/features/auth/authApiSlice';
import { useForm } from 'react-hook-form';

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loginInstitutionAdmin] = useLoginInstitutionAdminMutation();

  const defaultValues = {
    email: '',
    password: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {}, []);

  const onSubmit = async data => {
    try {
      const userData = await loginInstitutionAdmin(data).unwrap();

      dispatch(
        setCredentials({
          user: userData.userProfile,
          accessToken: userData.accessToken,
        })
      );
      router.push('/institution');
    } catch (error) {
      alert('Failed to login');
    }
  };

  return (
    <main>
      <div className='flex flex-row h-screen '>
        <div className='w-[50%] hidden md:relative'>
          <Image fill src='/images/assets911.png' alt='logo' />
        </div>
        <div className='md:w-[50%] box-border flex items-center justify-center'>
          <div className='w-[60%] flex flex-col items-center'>
            <Image
              src='/images/blue-logo.png'
              alt='logo'
              width={300}
              height={300}
              className='md:hidden'
            />
            <h1 className='mb-5 text-2xl font-semibold tracking-tight'>
              Login
            </h1>
            <p className='text-sm text-[#71717A] text-center text-muted-foreground'>
              Enter your email and password to login to your institution
              dashboard
            </p>
            <form className='w-full mt-5' onSubmit={handleSubmit(onSubmit)}>
              <div className='space-y-5'>
                <Input
                  placeholder={`${
                    errors.email?.message || 'johndoe@gmail.com'
                  }`}
                  {...register('email', {
                    required: 'Enter a valid email',
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  })}
                  className={`${errors.email && 'border-red-500'}`}
                />
                <Input
                  placeholder={`${errors.password?.message || 'Password'}`}
                  {...register('password', { required: 'Password required' })}
                  className={`${errors.password && 'border-red-500'}`}
                />
              </div>
              <Button className='w-full my-5 bg-blue-500'>Login</Button>
              {/* <div className='flex flex-row items-center'>
                <hr className='w-full' />
                <p className='w-[400px] text-center text-muted-foreground text-[#71717A] text-sm'>
                  OR CONTINUE WITH
                </p>
                <hr className='w-full' />
              </div>
              <div className='flex items-center justify-center w-full my-2'>
                <GoogleLogin
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
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
