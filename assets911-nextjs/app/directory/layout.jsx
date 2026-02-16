'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useGetServerSessionQuery } from '@/redux/features/auth/authApiSlice';
import { Toaster } from '@/components/ui/toaster';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { data: police, isLoading: policeIsLoading } =
    useGetServerSessionQuery();

  useEffect(() => {
    if (police && !policeIsLoading) {
      dispatch(
        setCredentials({
          user: {
            name: police.name,
            email: police.email,
            institutionName: police.institutionName,
            token: police.accessToken,
          },
        })
      );
    }
  }, [police, policeIsLoading, dispatch]);
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
};

export default Layout;
