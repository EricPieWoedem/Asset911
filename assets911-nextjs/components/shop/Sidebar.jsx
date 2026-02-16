import React from 'react';
import { Card } from '../ui/card';
import { ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const Sidebar = () => {
  return (
    <div className='hidden space-y-3 md:block'>
      <Card className='min-w-[260px] text-sm p-3 rounded-xl bg-white'>
        <h2 className='mb-1 font-medium text-[#041B60]'>Categories</h2>
        <div className='pl-3 space-y-1'>
          {[
            'Phone',
            'Laptop',
            'Tablet',
            'Desktop',
            'Camera',
            'Accessories',
          ].map(category => (
            <p key={category} className='cursor-pointer hover:underline'>
              {category}
            </p>
          ))}
        </div>
      </Card>
      {/* <Card className='min-w-[260px] text-sm p-3 rounded-xl bg-white  flex items-center justify-between '>
        <h2 className=' font-medium text-[#041B60]'>Location</h2>
        <ChevronRight />
      </Card> */}
      <Card className='min-w-[260px] text-sm p-3 rounded-xl bg-white  '>
        <h2 className=' font-medium text-[#041B60]'>Price</h2>
        <div className='py-2 space-y-3 '>
          <Input placeholder='max' />
          <Input placeholder='min' />
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
