'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useGetServerSessionQuery } from '@/redux/features/auth/authApiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useEffect } from 'react';
import Loader from '@/components/Loader/Loader';

const RequireAuth = ({ children }) => {
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetServerSessionQuery();

  useEffect(() => {
    if (data && !isLoading) {
      dispatch(
        setCredentials({
          user: {
            name: data.name,
            email: data.email,
            permissions: data.permissions,
            institutionName: data.institutionName,
            token: data.accessToken,
          },
        })
      );

      if (Object.keys(data).includes('ghanaCardNumber')) {
        if (!data.ghanaCardNumber) {
          router.push('/user/settings');
        }
      }
    }
    if (!isLoading && !data) {
      router.push('/');
    }
  }, [data, isLoading, router, dispatch]);

  if (!isLoading && data) {
    if (
      pathName.includes('institution') &&
      data?.permissions?.includes(302) &&
      !pathName.includes('ecfatum')
    ) {
      return children;
    } else if (
      pathName.includes('ecfatum') &&
      data?.permissions?.includes(203)
    ) {
      return children;
    } else if (
      pathName.includes('user') &&
      data.accessToken &&
      !data?.institutionName &&
      !data?.permissions
    ) {
      return children;
    } else if (
      pathName.includes('police') &&
      data.institutionName.id == 'police'
    ) {
      return children;
    } else {
      return <h1>no permissions</h1>;
    }
  }
  if (isLoading) return <Loader />;
};
export default RequireAuth;
