import RequireAuth from '@/components/RequireAuth';
import React from 'react';

const Layout = ({ children }) => {
  return <RequireAuth>{children}</RequireAuth>;
};

export default Layout;
