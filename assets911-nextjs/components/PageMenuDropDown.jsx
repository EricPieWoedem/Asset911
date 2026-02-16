'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PageMenuDropDown = ({ options, defaultRoute }) => {
  const [dropdownRoute, setDropdownRoute] = useState(defaultRoute);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const matchedOption = options.find(option =>
      pathname.includes(option.route) && option.route !== defaultRoute
        ? true
        : option.route === defaultRoute && pathname === defaultRoute
    );

    if (matchedOption) {
      setDropdownRoute(matchedOption.route);
    } else {
      setDropdownRoute(defaultRoute);
    }
  }, [pathname]);

  return (
    <Select
      value={dropdownRoute}
      onValueChange={e => {
        setDropdownRoute(e);
        router.push(e);
      }}
    >
      <SelectTrigger className='w-[180px] border-0 '>
        <SelectValue placeholder='' className='text-gray-400' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(option => (
            <SelectItem key={option.route} value={option.route}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default PageMenuDropDown;
