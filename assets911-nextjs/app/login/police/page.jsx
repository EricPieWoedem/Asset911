'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { usePoliceLoginMutation } from '@/redux/features/auth/authApiSlice';
import { useForm } from 'react-hook-form';

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loginPolice] = usePoliceLoginMutation();

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
      const userData = await loginPolice(data).unwrap();

      dispatch(
        setCredentials({
          user: userData.userProfile,
          accessToken: userData.accessToken,
        })
      );
      router.push('/directory');
    } catch (error) {
      alert('Failed to login');
    }
  };

  return (
    <main>
      <div className='flex flex-row h-screen '>
        <div className='w-[50%]  relative'>
          <Image fill src='/images/assets911.png' alt='logo' />
        </div>
        <div className='w-[50%] box-border flex items-center justify-center'>
          <div className=' w-[60%] flex flex-col items-center'>
            <h1 className='mb-5 text-2xl font-semibold tracking-tight'>
              Police Login
            </h1>
            <p className='text-sm text-[#71717A] text-muted-foreground'>
              Enter your email and password to Login
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
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
