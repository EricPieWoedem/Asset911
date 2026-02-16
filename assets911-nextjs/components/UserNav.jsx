'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogoutMutation } from '@/redux/features/auth/authApiSlice';
import { useRouter } from 'next/navigation';
import { apiSlice } from '@/redux/app/api/apiSlice';
import { selectCurrentUser, logOut } from '@/redux/features/auth/authSlice';

export function UserNav({ userGroup }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const router = useRouter();
  const [logoutMutation] = useLogoutMutation();

  const generateFallBackAvatar = useCallback(name => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('');
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative w-8 h-8 rounded-full focus:outline-none'
        >
          <Avatar className='w-8 h-8 focus:outline-none'>
            <AvatarImage
              src={currentUser?.profileImage}
              alt='profile picture'
            />
            <AvatarFallback
              className={`${userGroup === 'police' && 'text-black'}`}
            >
              {generateFallBackAvatar(currentUser?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal '>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {currentUser?.name}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {currentUser?.email}
            </p>
            {/* <p className='text-xs leading-none text-muted-foreground'>
              {currentUser?.institutionName}
            </p> */}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userGroup === 'user' && (
          <DropdownMenuGroup>
            <Link
              href={
                userGroup === 'police' ? `/police` : `/${userGroup}/settings`
              }
            >
              <DropdownMenuItem>
                {userGroup === 'police' ? 'Reports' : 'Settings'}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logoutMutation();
            dispatch(apiSlice.util.resetApiState());
            dispatch(logOut());
            if (userGroup === 'institution') {
              return router.push('/login');
            } else if (userGroup === 'police') {
              return router.push('/login/police');
            } else {
              return router.push('/');
            }
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
