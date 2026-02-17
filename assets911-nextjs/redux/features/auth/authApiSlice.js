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
