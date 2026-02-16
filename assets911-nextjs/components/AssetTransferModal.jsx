import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';
import { useTransferAssetMutation } from '@/redux/features/assets/assetsApiSlice';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from './ui/textarea';

const AssetTransferModal = ({ setTransferAssetModal, assetId }) => {
  const [transferAsset] = useTransferAssetMutation();
  const [newOwner, setNewOwner] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!newOwner && assetId) return alert('Failed');
    try {
      await transferAsset({
        newOwner,
        assetId,
        notes,
        transferDate: new Date().toString(),
      }).unwrap();
      setTransferAssetModal(false);
      toast({
        description: 'Asset transferred',
      });
      setTransferAssetModal(false);
    } catch (error) {
      toast({
        description: 'Failed to transfer Asset',
      });
    }
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-screen h-screen backdrop-blur-sm backdrop-invert-[30%]'>
      <div className='flex flex-col gap-3 p-5 bg-white min-w-[80vw] rounded-lg shadow-md md:min-w-[450px]'>
        <div className='flex items-center justify-between'>
          <p className='font-medium text-gray-500'>New Owner</p>
          <XCircle
            className='text-red-500 cursor-pointer'
            onClick={() => setTransferAssetModal(false)}
          />
        </div>
        <Input
          placeholder='Enter email or phoneNumber'
          type='text'
          onChange={e => setNewOwner(e.target.value)}
          value={newOwner}
        />
        <Textarea
          onChange={e => setNotes(e.target.value)}
          value={notes}
          placeholder='Enter transfer description'
        />
        <Button className='self-end bg-blue-500' onClick={() => handleSubmit()}>
          Transfer
        </Button>
      </div>
    </div>
  );
};

export default AssetTransferModal;
