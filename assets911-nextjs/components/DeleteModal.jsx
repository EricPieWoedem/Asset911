import React, { useCallback } from 'react';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';
import { useDeleteAssetMutation } from '@/redux/features/assets/assetsApiSlice';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const DeleteModal = ({ setDeleteTransferModal, assetId }) => {
  const router = useRouter();
  const [deleteAsset] = useDeleteAssetMutation();

  const handleDelete = useCallback(async () => {
    await deleteAsset(assetId)
      .unwrap()
      .then(() => {
        toast({
          description: 'Asset deleted',
        });
        router.push('/user/assets');
      })
      .catch(() => {
        toast({
          description: 'Failed to delete asset',
        });
      });
  }, [assetId, deleteAsset, router]);

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-screen h-screen backdrop-blur-sm backdrop-invert-[30%]'>
      <div className='flex flex-col gap-3 p-5 bg-white min-w-[80vw] rounded-lg shadow-md md:min-w-[450px]'>
        <div className='flex items-center justify-between'>
          <p className='font-medium text-gray-500'>Delete Confirmation</p>
          <XCircle
            className='text-red-500 cursor-pointer'
            onClick={() => setDeleteTransferModal(false)}
          />
        </div>
        <p>Are you sure you want to delete this asset?</p>
        <Button className='self-end bg-blue-500' onClick={() => handleDelete()}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteModal;
