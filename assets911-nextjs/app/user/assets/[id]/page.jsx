'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import AssetTransferModal from '@/components/AssetTransferModal';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  useGetAssetCategoriesQuery,
  useGetAssetQuery,
  useUpdateAssetMutation,
} from '@/redux/features/assets/assetsApiSlice';
import { useForm } from 'react-hook-form';
import { createOptions, formatDate } from '@/utils/helpers';
import { toast } from '@/components/ui/use-toast';
import DeleteModal from '@/components/DeleteModal';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { uniqueNumberInfo } from '@/utils/data';
import {
  SelectFormField,
  InputFormField,
  TextareaFormField,
} from '@/components/forms/formFields';
import { Form } from '@/components/ui/form';

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
  presentLocation: '',
  type: '',
  status: '',
  categoryType: '',
};

const Page = ({ params }) => {
  const { data, isLoading } = useGetAssetQuery(params.id);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [transferAssetModal, setTransferAssetModal] = useState(false);
  const [deleteAssetModal, setDeleteAssetModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { data: assetCategoriesData } = useGetAssetCategoriesQuery();

  const [updateAsset] = useUpdateAssetMutation();

  const form = useForm({ defaultValues });

  // change variable names data to something else
  const onSubmit = useCallback(
    async data => {
      const dataToSubmit = {
        ...data,
        id: params.id,
      };
      await updateAsset(dataToSubmit)
        .unwrap()
        .then(() => {
          toast({
            description: 'Asset updated',
          });
        })
        .catch(() => {
          toast({
            description: 'Failed to update asset',
          });
        });
    },
    [selectedType, selectedStatus, updateAsset, params.id]
  );

  const toggleNextImage = () => {
    if (imageIndex < data.asset.images.length - 1) {
      setImageIndex(prev => prev + 1);
    }
  };

  const togglePrevImage = () => {
    if (imageIndex !== 0) {
      setImageIndex(prev => prev - 1);
    }
  };
  const setDefaultValues = useCallback(assetObject => {
    form.reset({
      model: assetObject.asset?.model,
      brand: assetObject.asset?.brand,
      uniqueNumber: assetObject.asset?.uniqueNumber,
      dateOfPurchase: assetObject.asset?.dateOfPurchase,
      price: assetObject.asset?.price,
      identificationDetails: assetObject.asset?.identificationDetails,
      otherDetails: assetObject.asset?.otherDetails,
      registrationAddress: assetObject.asset?.registrationAddress,
      presentLocation: assetObject.asset?.presentLocation,
      type: assetObject.asset?.type,
      status: assetObject.asset?.status,
      categoryType: assetObject.asset?.categoryType,
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setDefaultValues(data);
    }
  }, [isLoading, setDefaultValues, data]);

  const categoryOptions = useMemo(() => {
    const transformedData = {};
    assetCategoriesData?.map(data => {
      transformedData[data.name] = data.categoryType;
    });
    return transformedData;
  }, [assetCategoriesData]);

  const categorySelectOptions = useMemo(() => {
    if (Object.keys(categoryOptions)) {
      return createOptions(Object.keys(categoryOptions));
    }
  }, [categoryOptions]);

  return (
    <div className='h-full'>
      {!isLoading && (
        <div className='flex flex-col flex-grow h-full lg:flex-row '>
          <div className='w-full lg:w-[45%] p-5  '>
            <div className='flex flex-col items-center justify-center h-full '>
              <Image
                src={
                  data.asset?.images[imageIndex] ||
                  '/images/ImagePlaceholder.svg'
                }
                height={600}
                width={650}
                alt='aseet-image'
                className='object-contain rounded-md'
                blurDataURL={'/images/ImagePlaceholder.svg'}
              />
              <div className='flex gap-3 pt-5 bottom-24'>
                <ArrowLeftCircle
                  onClick={togglePrevImage}
                  className={`cursor-pointer  ${
                    imageIndex === 0 ? 'text-gray-300' : 'hover:scale-90'
                  }`}
                />
                <ArrowRightCircle
                  onClick={toggleNextImage}
                  className={`cursor-pointer  ${
                    imageIndex === data.asset?.images.length - 1
                      ? 'text-gray-300'
                      : 'hover:scale-90'
                  }`}
                />
              </div>
            </div>
          </div>
          <div className=' w-full lg:w-[55%] lg:px-5 '>
            <div className='flex flex-col items-center h-full lg:justify-center '>
              <Form {...form}>
                <form
                  className='w-full overflow-y-auto'
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className='grid grid-cols-1 gap-2 lg:gap-5 lg:grid-cols-2'>
                    <SelectFormField
                      form={form}
                      name='status'
                      label='Status'
                      options={createOptions(status)}
                    />
                    <InputFormField
                      form={form}
                      name='type'
                      label='Asset Type'
                      disabledField
                    />

                    <InputFormField
                      form={form}
                      name='uniqueNumber'
                      label={
                        uniqueNumberInfo[selectedType]?.label ||
                        uniqueNumberInfo.others?.label
                      }
                      disabled
                    />

                    <InputFormField
                      form={form}
                      name='brand'
                      label='Brand'
                      disabled
                    />

                    <InputFormField
                      form={form}
                      name='model'
                      label='Model'
                      disabled
                    />

                    <InputFormField
                      form={form}
                      name='dateOfPurchase'
                      type='date'
                      label='Date of purchase'
                      disabled
                    />

                    <InputFormField
                      form={form}
                      label='Place of registration'
                      name='registrationAddress'
                      disabled
                    />

                    <InputFormField
                      form={form}
                      label='Present Location'
                      name='presentLocation'
                    />

                    <TextareaFormField
                      form={form}
                      label=' Specification Details'
                      name='identificationDetails'
                      placeholder='Identification details'
                    />

                    <TextareaFormField
                      form={form}
                      label='Other Details'
                      name='otherDetails'
                      placeholder='Other Details'
                    />
                    <p className='px-2 text-sm italic font-medium text-right text-gray-500 lg:col-span-2'>
                      {`Asset registered on : ${formatDate(
                        data.asset?.createdAt
                      )}`}
                    </p>
                  </div>
                  <div className='flex flex-col gap-3 pt-10 pb-5 lg:pb-0 lg:gap-5 lg:flex-row'>
                    <Button
                      className='w-full bg-red-500'
                      type='button'
                      onClick={() => setDeleteAssetModal(true)}
                    >
                      Delete Asset
                    </Button>
                    <Button className='w-full bg-blue-500' type='submit'>
                      Update Asset
                    </Button>
                    <Button
                      className='w-full bg-blue-500'
                      type='button'
                      onClick={() => setTransferAssetModal(true)}
                    >
                      Transfer Asset
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
      {transferAssetModal && (
        <AssetTransferModal
          setTransferAssetModal={setTransferAssetModal}
          transferAssetModal={transferAssetModal}
          assetId={params.id}
        />
      )}
      {deleteAssetModal && (
        <DeleteModal
          setDeleteTransferModal={setDeleteAssetModal}
          assetId={params.id}
        />
      )}
    </div>
  );
};

export default Page;
