'use client';

import * as z from 'zod';
import { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputFormField } from '@/components/forms/formFields';
import { Button } from '@/components/ui/button';
import {
  useAddInstitutionMutation,
  useGetInstitutionByIdQuery,
  useUpdateInstitutionMutation,
} from '@/redux/features/assets/ecfatumApiSlice';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Contact is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
});

const defaultValues = {
  name: '',
  phoneNumber: '',
  email: '',
  address: '',
};

const InstitutionModal = ({ searchParams }) => {
  const [addInstitution] = useAddInstitutionMutation();
  const [update] = useUpdateInstitutionMutation();
  const { data: institutionData, isLoading } = useGetInstitutionByIdQuery(
    searchParams.id || ''
  );
  const form = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async data => {
    if (searchParams.id) {
      data.id = searchParams.id;
      try {
        await update(data).unwrap();
        toast({
          description: 'Updated Successfully',
        });
      } catch (error) {
        toast({
          description: 'Failed to update',
        });
      }
    } else {
      try {
        await addInstitution(data).unwrap();
        toast({
          description: 'Created Successfully',
        });
      } catch (error) {
        toast({
          description: 'Failed to create',
        });
      }
    }
  };

  useEffect(() => {
    if (searchParams.id && !isLoading) {
      form.reset(institutionData);
    }
  }, [searchParams, institutionData, isLoading]);
  return (
    <div className='lg:max-w-[1000px]'>
      <h2 className='mb-5 text-xl'>
        {searchParams.id ? 'Selected Institution' : 'Add new Institution'}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
          <InputFormField
            form={form}
            label='Name'
            name='name'
            placeholder='Name of Institution'
          />
          <InputFormField
            form={form}
            label='Contact'
            name='phoneNumber'
            placeholder='+233000000'
          />
          <InputFormField
            form={form}
            label='Email'
            name='email'
            placeholder='johnDoe@gmail.com'
          />
          <InputFormField
            form={form}
            label='Address'
            name='address'
            placeholder='7 halogenic street'
          />
          <Button>Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default InstitutionModal;
