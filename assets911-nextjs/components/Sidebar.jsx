'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuItem = ({ title, icon, route, isActive }) => {
  return (
    <Link href={route}>
      <div
        className={`flex px-5 gap-3 text-lg font-normal transition-all   ${
          isActive
            ? 'text-blue-900 bg-white rounded-md py-2 shadow'
            : 'text-white '
        }`}
      >
        {icon}
        <p className=''>{title}</p>
      </div>
    </Link>
  );
};

const Sidebar = ({ menuItems, userGroup }) => {
  const pathname = usePathname();
  return (
    <div className='bg-[#041B60] h-full hidden xl:flex items-center flex-col py-5 w-full'>
      <Image
        src='/images/assets911-logo.png'
        width={201}
        height={61}
        alt='logo'
      />
      <div className=' mt-6  w-[85%] flex flex-col gap-6 '>
        {menuItems?.map(item => (
          <MenuItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            route={`${item.route}?${
              item.route.includes('transferred') ? 'pageType=transferred' : ''
            }`}
            isActive={
              pathname.includes(item.route) && item.route !== userGroup
                ? true
                : item.route === userGroup && pathname === userGroup
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
