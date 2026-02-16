import ProductCard from '@/components/ProductCard';
import React from 'react';

const Page = () => {
  return (
    <div className='grid items-center gap-3 xl:grid-cols-3'>
      <ProductCard />
      <ProductCard />
      <ProductCard /> <ProductCard /> <ProductCard /> <ProductCard />
      <ProductCard /> <ProductCard /> <ProductCard /> <ProductCard />
      <ProductCard /> <ProductCard /> <ProductCard /> <ProductCard />
      <ProductCard /> <ProductCard /> <ProductCard /> <ProductCard />
      <ProductCard />
    </div>
  );
};

export default Page;
