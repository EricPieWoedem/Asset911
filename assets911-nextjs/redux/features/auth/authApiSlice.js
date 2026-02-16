import { apiSlice } from '@/redux/app/api/apiSlice';

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: { ...credentials },
      }),
      invalidatesTags: ['User', 'Assets'],
    }),
    register: builder.mutation({
      query: credentials => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    socailAuth: builder.mutation({
      query: credentials => ({
        url: '/auth/',
        method: 'POST',
        body: { ...credentials },
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/server-session/logout',
        method: 'GET',
      }),
      invalidatesTags: ['User'],
    }),
    getServerSession: builder.query({
      query: () => ({
        url: '/server-session/get-auth',
      }),
      providesTags: ['User'],
      // DEV MODE BYPASS: Return mock data when bypass is enabled
      async queryFn(arg, api, extraOptions, baseQuery) {
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
          // Return mock user data based on current path
          const pathName = typeof window !== 'undefined' ? window.location.pathname : '';
          let mockData;
          
          if (pathName.includes('institution') && pathName.includes('ecfatum')) {
            mockData = {
              name: 'Dev ECFATUM Admin',
              email: 'dev@ecfatum.com',
              permissions: [201, 203],
              institutionName: { id: 'ecfatum', name: 'ECFATUM' },
              accessToken: 'dev-bypass-token',
            };
          } else if (pathName.includes('institution')) {
            mockData = {
              name: 'Dev Institution Admin',
              email: 'dev@institution.com',
              permissions: [302],
              institutionName: { id: 'institution', name: 'Test Institution' },
              accessToken: 'dev-bypass-token',
            };
          } else if (pathName.includes('police')) {
            mockData = {
              name: 'Dev Police Officer',
              email: 'dev@police.com',
              permissions: [],
              institutionName: { id: 'police', name: 'Police' },
              accessToken: 'dev-bypass-token',
            };
          } else {
            mockData = {
              name: 'Dev User',
              email: 'dev@user.com',
              permissions: [],
              institutionName: null,
              accessToken: 'dev-bypass-token',
              ghanaCardNumber: 'GHA-123456789-0',
            };
          }
          
          return { data: mockData };
        }
        
        // Normal flow: call the actual API
        return baseQuery({ url: '/server-session/get-auth' });
      },
    }),
    loginInstitutionAdmin: builder.mutation({
      query: credentials => ({
        url: '/institutions/auth/login',
        method: 'POST',
        body: { ...credentials },
      }),
      invalidatesTags: ['User', 'Assets'],
    }),
    phoneNumberLogin: builder.mutation({
      query: credentials => ({
        url: '/auth/phone-number',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    verifyPhoneNumber: builder.mutation({
      query: credentials => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    policeLogin: builder.mutation({
      query: credentials => ({
        url: '/police/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocailAuthMutation,
  useLogoutMutation,
  useGetServerSessionQuery,
  useLoginInstitutionAdminMutation,
  usePhoneNumberLoginMutation,
  useVerifyPhoneNumberMutation,
  usePoliceLoginMutation,
} = authApiSlice;
