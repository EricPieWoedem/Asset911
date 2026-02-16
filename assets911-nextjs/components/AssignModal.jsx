import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';
import { useAssignAssetMutation } from '@/redux/features/assets/institutionAssetsApiSlice';
import { toast } from './ui/use-toast';

const AssignModal = ({ setAssignAssetModal, assetId }) => {
  const [assignAssetTo] = useAssignAssetMutation();
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');

  const handleSubmit = async () => {
    if (!staffId && !staffName && assetId) return alert('Failed');
    try {
      await assignAssetTo({ staffId, assetId, staffName }).unwrap();
      toast({
        description: `Assigned to ${staffName}`,
      });
      setAssignAssetModal(false);
    } catch (error) {
      toast({
        description: `Failed to assign asset to ${staffName}`,
      });
    }
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-screen h-screen backdrop-blur-sm backdrop-invert-[30%]'>
      <div className='flex flex-col gap-3 p-5 bg-white rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <p className='font-medium text-gray-500'>Assign Asset to</p>
          <XCircle
            className='text-red-500 cursor-pointer'
            onClick={() => setAssignAssetModal(false)}
          />
        </div>
        <Input
          placeholder='Staff Id'
          type='text'
          onChange={e => setStaffId(e.target.value)}
        />
        <Input
          placeholder='Staff Name'
          type='text'
          onChange={e => setStaffName(e.target.value)}
        />
        <Button className='self-end bg-blue-500' onClick={() => handleSubmit()}>
          Assign
        </Button>
      </div>
    </div>
  );
};

export default AssignModal;
