import Sidebar from '@/components/shop/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Image from 'next/image';

const Layout = ({ children }) => {
  return (
    <main className='bg-[#EEF2F4] border-box'>
      <div className='bg-[#041B60] flex flex-row justify-center px-16 h-16'>
        <div className='flex-1 max-w-[1440px]  flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Image
              src='/images/assets911-logo.png'
              width={200}
              height={200}
              alt='logo'
            />
            <Input className='rounded-3xl' placeholder='Search.....' />
          </div>
        </div>
      </div>
      <div className='flex justify-center px-16 h-[calc(100vh-64px)] '>
        <div className='max-w-[1440px] flex flex-1 flex-row justify-start space-x-3  items-start pt-5'>
          <Sidebar />
          <div className='flex-1 max-h-full pb-2 overflow-y-auto'>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
