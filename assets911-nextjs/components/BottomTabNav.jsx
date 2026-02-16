'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const BottomTabNav = ({ menuItems }) => {
  const pathname = usePathname();
  const isCurrentPath = path => {
    const pathSegments = pathname.split('/');
    const routeName = pathSegments.slice(0, 3).join().replaceAll(',', '/');
    return routeName === path;
  };
  return (
    <div className='flex items-center justify-between w-full px-4 text-gray-700 xl:hidden h-14'>
      {menuItems?.map(items => (
        <Link
          href={items.route}
          key={items.title}
          className={`${isCurrentPath(items.route) && 'text-blue-700'}`}
        >
          {items.icon}
        </Link>
      ))}
    </div>
  );
};

export default BottomTabNav;
