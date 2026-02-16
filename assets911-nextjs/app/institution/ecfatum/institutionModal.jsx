'use client';

import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputFormField } from '@/components/forms/formFields';
import { Button } from '@/components/ui/button';
import {
  useAddInstitutionMutation,
  useGetInstitutionByIdQuery,
} from '@/redux/features/assets/ecfatumApiSlice';
import { XCircle } from 'lucide-react';

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

const InstitutionModal = ({ setOpen, open, id }) => {
  const [addInstitution] = useAddInstitutionMutation();
  const { data, isLoading } = useGetInstitutionByIdQuery(id);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async data => {
    try {
      await addInstitution(data).unwrap();
      toast({
        description: 'Created Successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        description: 'Failed to create',
      });
    }
  };
  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-screen h-screen backdrop-blur-sm backdrop-invert-[30%]'>
      <div className='flex flex-col gap-3 p-5 bg-white rounded-lg shadow-md min-w-[80vw]  md:min-w-[500px] lg:min-w-[800px]'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl'>Add Institution</h2>
          <XCircle
            className='text-red-700 cursor-pointer'
            onClick={() => setOpen(false)}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            <InputFormField
              form={form}
              label='Name'
              name='name'
              placeholder='Name of Institution'
              requiredIndicator
            />
            <InputFormField
              form={form}
              label='Contact'
              name='phoneNumber'
              placeholder='+233000000'
              requiredIndicator
            />
            <InputFormField
              form={form}
              label='Email'
              name='email'
              placeholder='johnDoe@gmail.com'
              requiredIndicator
            />
            <InputFormField
              form={form}
              label='Address'
              name='address'
              placeholder='7 halogenic street'
              requiredIndicator
            />
            <Button>Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default InstitutionModal;
