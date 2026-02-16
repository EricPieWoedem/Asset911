'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetInstitutionAssetByIdQuery,
  useGetAssetAssignmentHistoryQuery,
  useUpdateInstitutionAssetMutation,
  useUnAssignAssetMutation,
} from '@/redux/features/assets/institutionAssetsApiSlice';
import { useForm } from 'react-hook-form';
import { assignmentHistoryColumns } from '../assignmentHistoryColumns';
import { formatDate } from '@/utils/helpers';
import AssignModal from '@/components/AssignModal';
import CustomDataTable from '@/components/CustomDataTable';

const assetType = [
  'Car',
  'Phone',
  'Laptop',
  'Tablet',
  'Watch',
  'Headphones',
  'Camera',
];

const status = [
  'stolen',
  'lost',
  'sold',
  'okay',
  'damaged',
  'recovered',
  'for sale',
];

const defaultValues = {
  model: '',
  brand: '',
  uniqueNumber: '',
  dateOfPurchase: '',
  price: '',
  identificationDetails: '',
  otherDetails: '',
  registrationAddress: '',
  assetLocation: '',
};

const Page = ({ params }) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assignAssetModal, setAssignAssetModal] = useState(false);
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading } = useGetInstitutionAssetByIdQuery(params.id);
  const { data: assignmentHistory } = useGetAssetAssignmentHistoryQuery({
    assetId: params.id,
    pageNumber,
    search,
  });
  const [updateAsset] = useUpdateInstitutionAssetMutation();
  const [unAssignAsset] = useUnAssignAssetMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSearchChange = searchParams => {
    setSearch(searchParams);
    setPageNumber(1);
  };

  // change variable names data to something else
  const onSubmit = useCallback(
    async data => {
      const dataToSubmit = {
        ...data,
        type: selectedType,
        status: selectedStatus,
        id: params.id,
      };
      await updateAsset(dataToSubmit).unwrap();
    },
    [selectedType, selectedStatus, params.id, updateAsset]
  );

  const setDefaultValues = useCallback(
    assetObject => {
      reset({
        model: assetObject?.model,
        brand: assetObject?.brand,
        uniqueNumber: assetObject?.uniqueNumber,
        dateOfPurchase: assetObject?.dateOfPurchase,
        price: assetObject?.price,
        identificationDetails: assetObject?.identificationDetails,
        otherDetails: assetObject?.otherDetails,
        registrationAddress: assetObject?.registrationAddress,
        assetLocation: assetObject?.assetLocation,
      });
      setSelectedType(assetObject?.type);
      setSelectedStatus(assetObject?.status);
    },
    [reset]
  );

  const handleUnAssign = async () => {
    await unAssignAsset(params.id)
      .unwrap()
      .then(() => alert('Asset Unassigned'))
      .catch(() => 'asset assigned');
  };

  useEffect(() => {
    if (!isLoading) {
      setDefaultValues(data);
    }
  }, [isLoading, setDefaultValues, data]);

  return (
    <div className='h-full '>
      {!isLoading && (
        <div className='flex flex-row flex-grow h-full overflow-hidden '>
          <div className='hidden lg:block w-[45%] p-5 '>
            <div className='relative h-full '>
              <Image
                src={data?.images[0] || '/images/ImagePlaceholder.svg'}
                fill
                alt='asset-image'
                className='object-contain rounded-md'
                blurDataURL={data?.asset?.images[0]}
              />
            </div>
          </div>
          <div className=' w-full lg:w-[55%] lg:px-5 '>
            <div className='flex flex-col items-center h-full lg:justify-center '>
              <form
                className='w-full overflow-y-auto'
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className='grid grid-cols-1 gap-2 lg:gap-5 lg:grid-cols-2'>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Status</p>
                    <Select
                      onValueChange={e => setSelectedStatus(e)}
                      value={selectedStatus}
                    >
                      <SelectTrigger>
                        <SelectValue className='text-gray-400' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {status.map(type => (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Asset Type</p>
                    <Select
                      onValueChange={e => setSelectedType(e)}
                      value={selectedType}
                    >
                      <SelectTrigger className=''>
                        <SelectValue
                          placeholder='--choose type--'
                          className='text-gray-400'
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {assetType.map(type => (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Unique Number</p>
                    <Input
                      placeholder={
                        defaultValues.uniqueNumber || 'IMEI / Serial No.'
                      }
                      {...register('uniqueNumber')}
                    />
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Brand</p>
                    <Input placeholder='Brand' {...register('brand')} />
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Model</p>
                    <Input placeholder='Model' {...register('model')} />
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>
                      Date of Purchase
                    </p>
                    <Input
                      type='date'
                      placeholder='Date of purchase'
                      {...register('dateOfPurchase')}
                    />
                  </div>
                  <div className='flex flex-col justify-between gap-2 lg:col-span-2 '>
                    <p className='font-medium text-gray-500 '>
                      Place of registration
                    </p>
                    <Input
                      placeholder='Madina Estate, Accra'
                      {...register('registrationAddress')}
                    />
                  </div>
                  <div className='flex flex-col justify-between gap-2 lg:col-span-2 '>
                    <p className='font-medium text-gray-500 '>Asset Location</p>
                    <Input
                      placeholder='Madina Estate, Accra'
                      {...register('assetLocation')}
                    />
                  </div>

                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>
                      Specification Details
                    </p>
                    <Textarea
                      id=''
                      rows={3}
                      placeholder='Identification details'
                      {...register('identificationDetails')}
                    />
                  </div>
                  <div className='flex flex-col justify-between gap-2 '>
                    <p className='font-medium text-gray-500 '>Other Details</p>
                    <Textarea
                      id=''
                      rows={3}
                      placeholder='Please add additional details on your phone status here'
                      {...register('otherDetails')}
                    />
                  </div>
                  <p className='px-2 text-sm italic font-medium text-right text-gray-500 lg:col-span-2'>
                    {`Asset registered on : ${formatDate(data?.createdAt)}`}
                  </p>
                </div>
                <div className='flex flex-col gap-3 pt-10 pb-5 lg:pb-0 lg:gap-5 lg:flex-row'>
                  {/* <Button
                    className='w-full bg-red-500'
                    type='button'
                    onClick={handleDelete}
                  >
                    Delete Asset
                  </Button> */}
                  <Button className='w-full bg-blue-500' type='submit'>
                    Update Asset
                  </Button>
                  <Button
                    className='w-full bg-blue-500'
                    type='button'
                    onClick={() => setAssignAssetModal(true)}
                  >
                    Assign Asset
                  </Button>
                  <Button
                    className='w-full bg-red-500'
                    type='button'
                    onClick={handleUnAssign}
                  >
                    Unassign Asset
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div>
        <CustomDataTable
          columns={assignmentHistoryColumns}
          data={assignmentHistory?.results || []}
          totalPages={assignmentHistory?.totalPages}
          currentPage={assignmentHistory?.currentPage}
          total={assignmentHistory?.total}
          setPage={setPageNumber}
          title='Assignment History'
          onSearchChange={onSearchChange}
        />
      </div>
      {assignAssetModal && (
        <AssignModal
          setAssignAssetModal={setAssignAssetModal}
          assignAssetModal={assignAssetModal}
          assetId={params.id}
        />
      )}
    </div>
  );
};

export default Page;
