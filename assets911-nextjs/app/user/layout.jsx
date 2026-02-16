import RequireAuth from '@/components/RequireAuth';
import Sidebar from '@/components/Sidebar';
import PageMenuDropDown from '@/components/PageMenuDropDown';
import { Briefcase, Cog, LayoutDashboard, Rotate3D } from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import BottomTabNav from '@/components/BottomTabNav';

export const metadata = {
  title: 'ASSET911',
  description: 'Assset managemnt platform',
};

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard />,
    route: '/user',
  },
  {
    title: 'Assets',
    icon: <Briefcase />,
    route: '/user/assets',
  },
  {
    title: 'Transferred',
    icon: <Rotate3D />,
    route: '/user/transferred',
  },
  {
    title: 'Settings',
    icon: <Cog />,
    route: '/user/settings',
  },
];

const options = [
  { label: 'Dashboard', route: '/user' },
  { label: 'Assets', route: '/user/assets' },
  { label: 'Transferred', route: '/user/transferred' },
  { label: 'Settings', route: '/user/settings' },
];
const Layout = ({ children }) => {
  return (
    <RequireAuth>
      <div className='grid h-screen w-full grid-cols-1 xl:grid-cols-[280px_1fr]'>
        <Sidebar menuItems={menuItems} userGroup='/user' />
        <div className='box-border w-full h-full '>
          <div className='flex items-center justify-between px-4 py-4 bg-white xl:justify-end'>
            <div className='xl:hidden'>
              <Image
                src='/images/blue-logo.png'
                width={120}
                height={40}
                alt='logo'
              />
            </div>
            <div className='flex items-center gap-4 pr-4 md:pr-0'>
              <UserNav userGroup='user' />
            </div>
          </div>
          <div className=' h-[calc(100vh-125px)] px-5 py-2 overflow-auto xl:h-[calc(100vh-69px)] '>
            {children}
          </div>
          <BottomTabNav menuItems={menuItems} />
        </div>
        <Toaster />
      </div>
    </RequireAuth>
  );
};

export default Layout;
