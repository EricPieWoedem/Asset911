'use client';

import React from 'react';
import {
  useGetSingleTransferDocumentQuery,
  useResendTransferConfirmationOtpMutation,
  useCancelAssetTransferMutation,
} from '@/redux/features/assets/assetsApiSlice';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { ChevronLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Page = ({ params }) => {
  const { data } = useGetSingleTransferDocumentQuery(params.id);
  const [resendTransferConfirmationOtp] =
    useResendTransferConfirmationOtpMutation();
  const [cancelAssetTransfer] = useCancelAssetTransferMutation();
  const router = useRouter();

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
                <label htmlFor='brand'>Brand:</label>
                <Input disabled={true} value={data?.assetId.brand} id='brand' />
              </div>
              <div>
                <label htmlFor='model'>Model:</label>
                <Input disabled={true} value={data?.assetId.model} id='model' />
              </div>
              <div>
                <label htmlFor='type'>Asset Type:</label>
                <Input disabled={true} value={data?.assetId.type} id='type' />
              </div>
              <div>
                <label htmlFor='uniqueNumber'>Unique Number:</label>
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
                    data?.to?.name ||
                    data?.notAnExistingUser ||
                    data?.to.phoneNumber ||
                    data?.to.email
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
                <label htmlFor='dateOfTransfer'>Date of Transfer:</label>
                <Input
                  disabled={true}
                  value={formatDate(data?.createdAt)}
                  id='dateOfTransfer'
                />
              </div>
              <div>
                <label htmlFor='status'>Status:</label>
                <Input disabled={true} value={data?.status} id='status' />
              </div>
              <div>
                <label htmlFor='notes'>Notes:</label>
                <Input disabled={true} value={data?.notes} id='notes' />
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-end gap-3 py-5 lg:gap-5'>
          <Button
            className='bg-red-500 hover:bg-red-300'
            disabled={
              data?.status === 'complete' || data?.status === 'cancelled'
            }
            onClick={async () => {
              try {
                await cancelAssetTransfer(params.id).unwrap();
                alert('Asset Transfer Cancelled');
              } catch (error) {
                Promise.reject(error);
              }
            }}
          >
            Cancel Transfer
          </Button>
          <Button
            className='bg-green-500 hover:bg-green-300'
            onClick={async () => {
              try {
                await resendTransferConfirmationOtp(params.id).unwrap();
                alert('OTP sent successfully');
              } catch (error) {
                Promise.reject(error);
              }
            }}
            disabled={
              data?.status === 'complete' || data?.status === 'cancelled'
            }
          >
            Resend Code
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;
