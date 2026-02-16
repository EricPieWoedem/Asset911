import { apiSlice } from '@/redux/app/api/apiSlice';

const userApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    profileUpdate: builder.mutation({
      query: body => ({
        url: '/user/update',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    userData: builder.query({
      query: () => ({
        url: '/user/profile',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useProfileUpdateMutation, useUserDataQuery } = userApiSlice;
