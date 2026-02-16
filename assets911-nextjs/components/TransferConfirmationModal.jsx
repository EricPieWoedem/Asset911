import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';
import { useConfirmTransferMutation } from '@/redux/features/assets/assetsApiSlice';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const TransferConfirmationModal = ({ id, setShowTransferModal }) => {
  const router = useRouter();
  const [confirmTransfer] = useConfirmTransferMutation();
  const [otp, setOtp] = useState();

  const handleSubmit = async () => {
    try {
      await confirmTransfer({ id, otp }).unwrap();
      toast({
        description: 'Asset transfer completed',
      });
      router.push('/user');
    } catch (error) {
      toast({
        description: 'Failed to complete transfer',
      });
    }
  };
  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-screen h-screen backdrop-blur-sm backdrop-invert-[30%]'>
      <div className='flex flex-col gap-3 p-5 bg-white rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <p className='font-medium text-gray-500'>Enter confirmation OTP</p>
          <XCircle
            className='text-red-500 cursor-pointer'
            onClick={() => setShowTransferModal(false)}
          />
        </div>
        <Input
          placeholder=''
          type='text'
          onChange={e => setOtp(e.target.value)}
        />
        <Button className='self-end bg-blue-500' onClick={() => handleSubmit()}>
          Verify
        </Button>
      </div>
    </div>
  );
};

export default TransferConfirmationModal;
