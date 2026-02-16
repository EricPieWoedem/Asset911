'use client';

import * as z from 'zod';
import DropzoneComponent from '@/components/ImageDropZone';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { useGetBrandsQuery } from '@/redux/features/assets/assetsApiSlice';
import { useAddInstitutionAssetMutation } from '@/redux/features/assets/institutionAssetsApiSlice';
import { ChevronLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InputFormField,
  SelectFormField,
  TextareaFormField,
  InputFileFormField,
} from '@/components/forms/formFields';

const assetType = [
  { value: 'Car', label: 'Car' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Watch', label: 'Watch' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'Camera', label: 'Camera' },
];

const handleCreateNewOption = (value, options) => {
  const newOption = { value, label: value };
  options.push(newOption);
};

const createOptions = values => {
  const options = values.map(value => ({ value: value, label: value }));
  return options;
};

const formSchema = z.object({
  model: z.string().min(2, 'Select a model'),
  brand: z.string().min(2, 'Select a brand'),
  type: z.string().min(2, 'Select a type'),
  uniqueNumber: z.string().min(5, 'Enter valid unique identifier'),
  dateOfPurchase: z.string().min(10, 'Enter valid date'),
  purchaseReciept: z.any().refine(value => value, {
    message: 'Upload proof of ownership',
  }),
  price: z.string().min(1, 'Enter valid price'),
  identificationDetails: z
    .string()
    .min(2, 'Enter valid identidication details'),
  otherDetails: z.string(),
  registrationAddress: z.string().min(2, 'Enter a vaild location'),
  assetLocation: z.string().min(2, 'Enter a valid location'),
});

const defaultValues = {
  model: '',
  brand: '',
  uniqueNumber: '',
  dateOfPurchase: '',
  price: '',
  identificationDetails: '',
  otherDetails: '',
  registrationAddress: '',
  type: '',
  assetLocation: '',
};

const NewAsset = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [models, setModels] = useState([]);
  const [addAsset] = useAddInstitutionAssetMutation();
  const { data: brandsData } = useGetBrandsQuery();
  const router = useRouter();

  const preset_key = 'assets911';
  const cloud_name = 'jhay';

  const handleImageUpload = async imageFiles => {
    const files = imageFiles;

    try {
      const uploadPromises = files.map(async file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset_key);
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          formData
        );
        return response.data.secure_url;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      return uploadedImages;
    } catch (error) {
      toast({
        description: 'Failed to upload images',
      });
    }
  };

  const form = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async data => {
    const images = await handleImageUpload(selectedImages);
    const purchaseReciept = await handleImageUpload([data.purchaseReciept]);
    const dataToSubmit = {
      ...data,
      purchaseReciept: purchaseReciept[0],
      images,
    };
    try {
      const response = await addAsset(dataToSubmit).unwrap();
      router.push('/institution/assets');
      toast({
        description: 'Created Successfully',
      });
    } catch (error) {
      toast({
        description: 'Failed to create',
      });
    }
  };

  useEffect(() => {
    if (brandsData) {
      const cars = brandsData.find(brand => brand.type === 'cars');
      const electronics = brandsData.find(
        brand => brand.type === 'electronics'
      );
      if (form.watch('type') === 'Car') {
        setBrandOptions(createOptions(Object.keys(cars.properties)));
      } else {
        setBrandOptions(createOptions(Object.keys(electronics.properties)));
      }
    }
    return () => {
      setBrandOptions([]);
    };
  }, [form.watch('type'), brandsData]);

  useEffect(() => {
    if (brandsData && form.watch('brand')) {
      const cars = brandsData.find(brand => brand.type === 'cars');
      const electronics = brandsData.find(
        brand => brand.type === 'electronics'
      );
      if (form.watch('type') === 'Car') {
        setModels(createOptions(cars.properties[form.watch('brand')]));
      } else {
        setModels(createOptions(electronics.properties[form.watch('brand')]));
      }
    }
    return () => {
      setBrandOptions([]);
    };
  }, [form.watch('brand'), brandsData]);

  return (
    <div className='pb-3'>
      <div className='flex flex-row items-center gap-3 lg:gap-10'>
        <ChevronLeftCircle
          className='cursor-pointer'
          onClick={() => {
            router.back();
          }}
        />
        <h2 className='my-5 text-xl font-semibold'>Add New Asset</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DropzoneComponent
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
          <Card className='my-5'>
            <CardContent className='grid gap-3 py-10 md:grid-cols-2 lg:gap-8'>
              <div className='grid col-span-2 gap-3 lg:gap-8 md:grid-cols-3 '>
                <SelectFormField
                  form={form}
                  label='Asset Type'
                  name='type'
                  options={assetType}
                  requiredIndicator
                  placeholder='Select asset type'
                  onCreateOption={value =>
                    handleCreateNewOption(value, assetType)
                  }
                />
                <SelectFormField
                  form={form}
                  label='Brand'
                  name='brand'
                  options={brandOptions}
                  requiredIndicator
                  placeholder='Select  brand'
                />
                <SelectFormField
                  form={form}
                  label='Model'
                  name='model'
                  options={models}
                  requiredIndicator
                  placeholder='Select model'
                />
                <InputFormField
                  form={form}
                  label='IMEI / VIN / Serial No. / Unique number'
                  name='uniqueNumber'
                  placeholder='Enter assets unique identifier'
                  requiredIndicator
                />
                <InputFormField
                  form={form}
                  label='Registration Location'
                  name='registrationAddress'
                  placeholder='Enter registration location'
                  requiredIndicator
                />
                <InputFormField
                  form={form}
                  label='Date of purchase'
                  name='dateOfPurchase'
                  placeholder='Enter registration location'
                  type='date'
                  requiredIndicator
                />
                <InputFormField
                  form={form}
                  label='Asset Location'
                  placeholder='Enter asset location'
                  requiredIndicator
                  name='assetLocation'
                />
                <InputFormField
                  form={form}
                  label='Asset Value'
                  name='price'
                  placeholder='Enter estimated price of asset'
                  requiredIndicator
                />
                <InputFileFormField
                  form={form}
                  label='Proof of Ownership'
                  name='purchaseReciept'
                  requiredIndicator
                  type='file'
                />
              </div>

              <TextareaFormField
                form={form}
                label='Identification Details'
                name='identificationDetails'
                placeholder='Enter identification details'
                requiredIndicator
              />
              <TextareaFormField
                form={form}
                label='Other Details'
                name='otherDetails'
                placeholder='Enter other details'
              />
            </CardContent>
          </Card>
          <Button className='mb-5 bg-green-500 lg:mb-0'>Add Asset</Button>
        </form>
      </Form>
    </div>
  );
};

export default NewAsset;
