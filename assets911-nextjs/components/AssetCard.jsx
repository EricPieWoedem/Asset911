import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

const AssetCard = ({ image, type, brand, model, route, status }) => {
  return (
    <div className='w-full'>
      <div className='relative w-full h-72 '>
        <Image
          src={image || '/images/ImagePlaceholder.svg'}
          fill
          alt='item image'
          className='object-contain rounded-md'
          priority
        />
      </div>
      <div className='px-2 my-2 text-sm'>
        <p className='flex items-start justify-between '>
          <span>Status:</span>
          {status.toUpperCase()}
        </p>
        <p className='flex items-center justify-between'>
          <span>Model:</span>
          {model}
        </p>
        {/* <p className='flex items-center justify-between'>
          <span>Asset Type:</span>
          {type}
        </p> */}
        <p className='flex items-center justify-between'>
          <span>Brand Name:</span>
          {brand}
        </p>
      </div>
      <Link href={route}>
        <Button className='w-full bg-blue-500'>View Asset</Button>
      </Link>
    </div>
  );
};

export default AssetCard;
