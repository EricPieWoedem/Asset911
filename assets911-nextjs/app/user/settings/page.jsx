'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  useProfileUpdateMutation,
  useUserDataQuery,
} from '@/redux/features/user/userApiSlice';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const defaultValues = {
  name: '',
  email: '',
  phoneNumber: '',
  ghanaCardNumber: '',
};

const Settings = () => {
  const [updateProfile] = useProfileUpdateMutation();
  const { data: userProfile } = useUserDataQuery();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm(defaultValues);

  useEffect(() => {
    reset({
      name: userProfile?.name,
      email: userProfile?.email,
      phoneNumber: userProfile?.phoneNumber,
      ghanaCardNumber: userProfile?.ghanaCardNumber,
    });
  }, [userProfile, reset]);

  return (
    <div className='lg:w-[60%] '>
      <div>
        <h3 className='text-2xl font-medium'>Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Update your account settings.
        </p>
        <Separator className='mt-4' />
      </div>
      <form
        className='mt-6 lg:w-[80%] space-y-8 '
        onSubmit={handleSubmit(async data => {
          try {
            await updateProfile(data).unwrap();
            toast({ description: 'Updated Succesfully' });
          } catch (error) {
            toast({ description: 'Failed to update' });
          }
        })}
      >
        <div className='space-y-1'>
          <p>Full Name</p>
          <Input {...register('name')} />
          <p className='text-sm text-gray-600 text-muted-foreground'>
            This is your profile display name.
          </p>
        </div>
        <div className='space-y-1'>
          <p>Email</p>
          <Input
            disabled={userProfile?.provider === 'google'}
            {...register('email')}
          />
          <p className='text-sm text-gray-600 text-muted-foreground'>
            This is your email.
          </p>
        </div>
        <div className='space-y-1'>
          <p>Phone Number</p>
          <Input
            {...register('phoneNumber')}
            disabled={userProfile?.provider === 'phoneNumber'}
          />
          <p className='text-sm text-gray-600 text-muted-foreground'>
            This is your phone number.
          </p>
        </div>
        <div className='space-y-1'>
          <p>Ghana Card Number</p>
          <Input {...register('ghanaCardNumber')} />
          <p className='text-sm text-gray-600 text-muted-foreground'>
            This is your ghana card number.
          </p>
        </div>
        <Button className='mt-10'>Update</Button>
      </form>
    </div>
  );
};

export default Settings;
