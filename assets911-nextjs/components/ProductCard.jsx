import React from 'react';
import { Card } from './ui/card';
import Image from 'next/image';

const ProductCard = () => {
  return (
    <div className='flex flex-row items-center h-40 gap-3 rounded-2xl'>
      <Image
        src='/images/ImagePlaceholder.svg'
        className='object-contain '
        alt='item image '
        width={120}
        height={120}
      />
      <div>
        <p>Asset Name</p>
        <p>Asset Type</p>
        <p>5000</p>
      </div>
    </div>
  );
};

export default ProductCard;
