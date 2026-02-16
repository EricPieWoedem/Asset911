'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useGetServerSessionQuery } from '@/redux/features/auth/authApiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/features/auth/authSlice';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';

// DEV MODE BYPASS: Set NEXT_PUBLIC_BYPASS_AUTH=true in .env.local to bypass authentication
const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

// Mock user data for dev mode
const getMockUserData = (pathName) => {
  if (pathName.includes('institution') && pathName.includes('ecfatum')) {
    return {
      name: 'Dev ECFATUM Admin',
      email: 'dev@ecfatum.com',
      permissions: [201, 203], // ECFATUM permissions
      institutionName: { id: 'ecfatum', name: 'ECFATUM' },
      accessToken: 'dev-bypass-token',
    };
  } else if (pathName.includes('institution')) {
    return {
      name: 'Dev Institution Admin',
      email: 'dev@institution.com',
      permissions: [302], // Institution permissions
      institutionName: { id: 'institution', name: 'Test Institution' },
      accessToken: 'dev-bypass-token',
    };
  } else if (pathName.includes('police')) {
    return {
      name: 'Dev Police Officer',
      email: 'dev@police.com',
      permissions: [],
      institutionName: { id: 'police', name: 'Police' },
      accessToken: 'dev-bypass-token',
    };
  } else {
    // Default to regular user
    return {
      name: 'Dev User',
      email: 'dev@user.com',
      permissions: [],
      institutionName: null,
      accessToken: 'dev-bypass-token',
      ghanaCardNumber: 'GHA-123456789-0', // Include to avoid redirect to settings
    };
  }
};

const RequireAuth = ({ children }) => {
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetServerSessionQuery();
  const [mockData] = useState(() => BYPASS_AUTH ? getMockUserData(pathName) : null);

  useEffect(() => {
    if (BYPASS_AUTH && mockData) {
      // Set mock credentials when bypass is enabled
      dispatch(
        setCredentials({
          user: {
            name: mockData.name,
            email: mockData.email,
            permissions: mockData.permissions,
            institutionName: mockData.institutionName,
            token: mockData.accessToken,
          },
        })
      );
      return; // Skip normal auth flow
    }

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
    if (!isLoading && !data && !BYPASS_AUTH) {
      router.push('/');
    }
  }, [data, isLoading, router, dispatch, mockData]);

  // Bypass mode: always render children
  if (BYPASS_AUTH && mockData) {
    return children;
  }

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
