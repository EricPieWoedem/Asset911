'use client';

import React, { useState } from 'react';
import { useGetSingleTransferDocumentQuery } from '@/redux/features/assets/assetsApiSlice';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import TransferConfirmationModal from '@/components/TransferConfirmationModal';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Page = ({ params }) => {
  const router = useRouter();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { data } = useGetSingleTransferDocumentQuery(params.id);

  return (
    <>
      <ChevronLeftCircle
        className='cursor-pointer'
        onClick={() => {
          router.back();
        }}
      />
      <div className='flex flex-col justify-between h-full'>
        <div className='flex flex-col justify-between w-full gap-10 pt-5 md:flex-row'>
          <div className='w-full'>
            <h1 className='text-center'>Asset Details</h1>
            <div className='space-y-5 '>
              <div>
                <label htmlFor='brand'>Brand</label>
                <Input disabled={true} value={data?.assetId.brand} id='brand' />
              </div>
              <div>
                <label htmlFor='model'>Model</label>
                <Input disabled={true} value={data?.assetId.model} id='model' />
              </div>
              <div>
                <label htmlFor='type'>Asset Type</label>
                <Input disabled={true} value={data?.assetId.type} id='type' />
              </div>
              <div>
                <label htmlFor='uniqueNumber'>Unique Number</label>
                <Input
                  disabled={true}
                  value={data?.assetId.uniqueNumber}
                  id='uniqueNumber'
                />
              </div>
            </div>
          </div>
          <div className='w-full'>
            <h1 className='text-center '>Transfer Information</h1>
            <div className='space-y-5 '>
              <div>
                <label htmlFor='transferredTo'>Transferred to:</label>
                <Input
                  disabled={true}
                  value={
                    data?.to?.name || data?.to?.phoneNumber || data?.to?.email
                  }
                  id='transferredTo'
                />
              </div>
              <div>
                <label htmlFor='transferredFrom'>Transferred from:</label>
                <Input
                  disabled={true}
                  value={
                    data?.from.name ||
                    data?.from.phoneNumber ||
                    data?.from.email
                  }
                  id='transferredFrom'
                />
              </div>
              <div>
                <label htmlFor='dateOfTransfer'>Date of Transfer</label>
                <Input
                  disabled={true}
                  value={formatDate(data?.createdAt)}
                  id='dateOfTransfer'
                />
              </div>
              <div>
                <label htmlFor='status'>Status</label>
                <Input disabled={true} value={data?.status} id='status' />
              </div>
              <div>
                <label htmlFor='notes'>Notes</label>
                <Textarea disabled={true} value={data?.notes} id='notes' />
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-end py-5 lg:py-0 '>
          <Button
            className='bg-green-400 hover:bg-green-300'
            onClick={() => setShowTransferModal(true)}
            disabled={data?.status === 'complete'}
          >
            Confirm Transfer
          </Button>
        </div>
        {showTransferModal && (
          <TransferConfirmationModal
            id={data?.assetId._id}
            setShowTransferModal={setShowTransferModal}
          />
        )}
      </div>
    </>
  );
};

export default Page;
