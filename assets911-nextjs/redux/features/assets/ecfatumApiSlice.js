import { apiSlice } from '@/redux/app/api/apiSlice';

export const ecfatumApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getInstitutions: builder.query({
      query: query =>
        `/ecfatum/institutions/get-all-institutions?pageNumber=${query.pageNumber}&search=${query.search}`,
      providesTags: ['Institutions'],
    }),
    getInstitutionById: builder.query({
      query: id => `/ecfatum/institutions/${id}`,
      providesTags: ['Institutions'],
    }),
    addInstitution: builder.mutation({
      query: institution => ({
        url: '/ecfatum/institutions/create-institution',
        method: 'POST',
        body: institution,
      }),
      invalidatesTags: ['Institutions'],
    }),
    updateInstitution: builder.mutation({
      query: institution => ({
        url: `/ecfatum/institutions/${institution.id}/update`,
        method: 'PATCH',
        body: {
          phoneNumber: institution.phoneNumber,
          name: institution.name,
          email: institution.email,
          address: institution.address,
        },
      }),
      invalidatesTags: ['Institutions'],
    }),
  }),
});

export const {
  useGetInstitutionByIdQuery,
  useGetInstitutionsQuery,
  useAddInstitutionMutation,
  useUpdateInstitutionMutation,
} = ecfatumApiSlice;
