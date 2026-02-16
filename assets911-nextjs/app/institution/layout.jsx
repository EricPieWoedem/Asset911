'use client';

import {
  Briefcase,
  Building2,
  Cog,
  History,
  LayoutDashboard,
  Siren,
} from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { Toaster } from '@/components/ui/toaster';
import { useGetServerSessionQuery } from '@/redux/features/auth/authApiSlice';
import RequireAuth from '@/components/RequireAuth';
import Sidebar from '@/components/Sidebar';
import PageMenuDropDown from '@/components/PageMenuDropDown';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard />,
    route: '/institution',
  },
  {
    title: 'Assets',
    icon: <Briefcase />,
    route: '/institution/assets',
  },
  {
    title: 'History',
    icon: <History />,
    route: '/institution/history',
  },

  // {
  //   title: 'Settings',
  //   icon: <Cog />,
  //   route: '/institution/settings',
  // },
];

const options = [
  { label: 'Dashboard', route: '/institution' },
  { label: 'Assets', route: '/institution/assets' },
  {
    label: 'History',
    route: '/institution/history',
  },
  {
    label: 'Institutions',
    route: '/institution/ecfatum',
  },
  // { label: 'Regulators', route: '/institution/regulators' },
];
const Layout = ({ children }) => {
  const { data, isLoading } = useGetServerSessionQuery();

  return (
    <RequireAuth>
      <div className='flex flex-row h-screen max-w-[2000px]'>
        <Sidebar
          menuItems={
            data?.permissions.includes(201)
              ? [
                  ...menuItems,
                  {
                    title: 'Institutions',
                    icon: <Building2 />,
                    route: '/institution/ecfatum',
                  },
                  // {
                  //   title: 'Regulators',
                  //   icon: <Siren />,
                  //   route: '/institution/regulators',
                  // },
                ]
              : menuItems
          }
          userGroup='/institution'
        />
        <div className='box-border w-full h-full px-2 overflow-y-auto md:px-4 xl:px-5'>
          <div className='sticky top-0 z-50 flex items-center justify-between py-4 bg-white xl:justify-end'>
            <div className='xl:hidden'>
              <PageMenuDropDown options={options} defaultRoute='/institution' />
            </div>
            <div className='flex items-center gap-4 pr-4 md:pr-0'>
              <UserNav userGroup='institution' />
            </div>
          </div>
          <div className='h-[calc(100vh-6rem)]'>{children}</div>
        </div>
        <Toaster />
      </div>
    </RequireAuth>
  );
};

export default Layout;
