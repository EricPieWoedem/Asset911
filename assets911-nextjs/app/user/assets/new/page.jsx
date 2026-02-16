'use client';

import * as z from 'zod';
import DropzoneComponent from '@/components/ImageDropZone';
import axios from 'axios';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import {
  useAddAssetMutation,
  useGetBrandsQuery,
  useAddNewBrandOrModelMutation,
  useGetAssetCategoriesQuery,
  useGetBrandsAndModelsQuery,
} from '@/redux/features/assets/assetsApiSlice';
import { ChevronLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InputFormField,
  SelectFormField,
  TextareaFormField,
  InputFileFormField,
  AutompleteInputFormField,
} from '@/components/forms/formFields';
import ImageToPDF from '@/components/ImageToPDF';
import { uniqueNumberInfo } from '@/utils/data';
import { createOptions } from '@/utils/helpers';
import AutoCompleteInput from '@/components/AutoCompleteInput';

const formSchema = z.object({
  model: z.string().min(2, 'Select a model'),
  brand: z.string().min(2, 'Select a brand'),
  type: z.string().min(2, 'Select a type'),
  categoryType: z.string().min(2, 'Select a category'),
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
  presentLocation: z.string().min(2, 'Enter a vaild location'),
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
  presentLocation: '',
  categoryType: '',
};

const NewAsset = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  // const [brandOptions, setBrandOptions] = useState([]);
  // const [models, setModels] = useState([]);
  const [addAsset] = useAddAssetMutation();
  // const { data: brandsData } = useGetBrandsQuery();
  // const [addNewBrandOrModel] = useAddNewBrandOrModelMutation();
  const { data: assetCategoriesData, isLoading: assetCategoriesIsLoading } =
    useGetAssetCategoriesQuery();
  const { data: brandsAndModelsData, isLoading: brandsAndModelsIsLoading } =
    useGetBrandsAndModelsQuery();
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
      router.push('/user/assets');
      toast({
        description: response,
      });
    } catch (error) {
      toast({
        description: error.data,
      });
    }
  };

  // useEffect(() => {
  //   if (brandsData) {
  //     const cars = brandsData.find(brand => brand.type === 'cars');
  //     const electronics = brandsData.find(
  //       brand => brand.type === 'electronics'
  //     );
  //     if (form.watch('type') === 'Car') {
  //       setBrandOptions(createOptions(Object.keys(cars.properties)));
  //     } else {
  //       setBrandOptions(createOptions(Object.keys(electronics.properties)));
  //     }
  //   }
  //   return () => {
  //     setBrandOptions([]);
  //   };
  // }, [form.watch('type'), brandsData]);

  // useEffect(() => {
  //   if (brandsData && form.watch('brand')) {
  //     const cars = brandsData.find(brand => brand.type === 'cars');
  //     const electronics = brandsData.find(
  //       brand => brand.type === 'electronics'
  //     );
  //     if (form.watch('type') === 'Car') {
  //       setModels(createOptions(cars.properties[form.watch('brand')]));
  //     } else {
  //       setModels(createOptions(electronics.properties[form.watch('brand')]));
  //     }
  //   }
  //   return () => {
  //     setBrandOptions([]);
  //   };
  // }, [form.watch('brand'), brandsData]);

  const categoryOptions = useMemo(() => {
    const transformedData = {};
    assetCategoriesData?.map(data => {
      transformedData[data.name] = data.categoryType;
    });
    return transformedData || [];
  }, [assetCategoriesData]);

  const categorySelectOptions = useMemo(() => {
    if (Object.keys(categoryOptions)) {
      return Object.keys(categoryOptions);
    }
  }, [categoryOptions]);

  const subCategoryOptions = useMemo(() => {
    if (categoryOptions[form.watch('type')]) {
      return categoryOptions[form.watch('type')];
    } else {
      return [];
    }
  }, [form.watch('type')]);

  const brandsSelectOptions = useMemo(() => {
    if (
      form.watch('categoryType') &&
      brandsAndModelsData[form.watch('categoryType')]
    ) {
      return Object.keys(brandsAndModelsData[form.watch('categoryType')]);
    } else {
      return [];
    }
  }, [form.watch('categoryType')]);

  const modelsSelectOptions = useMemo(() => {
    if (
      form.watch('brand') &&
      brandsAndModelsData[form.watch('categoryType')]
    ) {
      const selectedCategory = brandsAndModelsData[form.watch('categoryType')];
      const selectedBrand = selectedCategory[form.watch('brand')];
      if (selectedBrand?.length) {
        return selectedBrand;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [form.watch('brand')]);

  // const handleCreateNewOption = useCallback(
  //   async (optionType, value) => {
  //     try {
  //       await addNewBrandOrModel({
  //         type: form.watch('type') === 'Car' ? 'cars' : 'electronics',
  //         data:
  //           optionType === 'brand'
  //             ? { brands: value, model: '' }
  //             : { model: value, brands: form.watch('brand') },
  //       }).unwrap();
  //     } catch (error) {
  //       alert(`Failed to add ${optionType}: ${error.message}`);
  //     }
  //   },
  //   [addNewBrandOrModel, form]
  // );

  return (
    <div className='pb-3'>
      <div className='flex flex-row items-center gap-3 lg:gap-10'>
        <ChevronLeftCircle
          className='cursor-pointer'
          onClick={() => {
            router.back();
          }}
        />
        <h2 className='my-5 font-semibold md:text-xl'>Add New Asset</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DropzoneComponent
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
          <Card className='my-5'>
            <CardContent className='grid gap-3 py-10 md:grid-cols-2 lg:gap-8'>
              <div className='grid gap-3 md:col-span-2 lg:gap-8 md:grid-cols-2 '>
                <AutompleteInputFormField
                  form={form}
                  label='Asset Type'
                  name='type'
                  options={categorySelectOptions}
                  requiredIndicator
                  placeholder='Asset type'
                />
                <AutompleteInputFormField
                  form={form}
                  label='Asset Category'
                  name='categoryType'
                  options={subCategoryOptions}
                  requiredIndicator
                  placeholder='Asset Category'
                />
                <AutompleteInputFormField
                  form={form}
                  label='Brand'
                  name='brand'
                  options={brandsSelectOptions}
                  requiredIndicator
                  placeholder='Brand'
                />
                <AutompleteInputFormField
                  form={form}
                  label='Model'
                  name='model'
                  options={modelsSelectOptions}
                  requiredIndicator
                  placeholder='Model'
                />
              </div>
              <InputFormField
                form={form}
                label={
                  uniqueNumberInfo[form.watch('type')]?.label ||
                  uniqueNumberInfo.others.label
                }
                name='uniqueNumber'
                placeholder='Enter assets unique identifier'
                requiredIndicator
                helpText={
                  uniqueNumberInfo[form.watch('type')]?.info ||
                  uniqueNumberInfo.others.info
                }
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
                label='Present Location'
                name='presentLocation'
                placeholder='Enter present location'
                requiredIndicator
              />
              <div>
                <InputFileFormField
                  form={form}
                  label='Proof of Ownership'
                  name='purchaseReciept'
                  requiredIndicator
                  type='file'
                  dialogComponent={<ImageToPDF />}
                />
                <ImageToPDF />
              </div>
              <InputFormField
                form={form}
                label='Date of purchase'
                name='dateOfPurchase'
                type='date'
                requiredIndicator
              />
              <InputFormField
                form={form}
                label='Asset Value'
                name='price'
                placeholder='Enter estimated price of asset'
                requiredIndicator
              />
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
