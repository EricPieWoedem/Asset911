import { apiSlice } from '@/redux/app/api/apiSlice';

export const institutionAssetsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    addInstitutionAsset: builder.mutation({
      query: asset => ({
        url: '/institutions/assets',
        method: 'POST',
        body: asset,
      }),
      invalidatesTags: ['Assets'],
    }),
    updateInstitutionAsset: builder.mutation({
      query: asset => ({
        url: `/institutions/assets/${asset.id}`,
        method: 'PATCH',
        body: asset,
      }),
      invalidatesTags: ['Assets'],
    }),
    assignAsset: builder.mutation({
      query: staff => ({
        url: `/institutions/assets/assign/${staff.assetId}`,
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: ['Assets'],
    }),
    unAssignAsset: builder.mutation({
      query: staff => ({
        url: `/institutions/assets/unassign/${staff}`,
        method: 'PATCH',
        body: staff,
      }),
      invalidatesTags: ['Assets'],
    }),
    getInstitutionAssets: builder.query({
      query: data =>
        `/institutions/assets/all?pageSize=${data?.pageSize || 10}&pageNumber=${
          data?.pageNumber || 1
        }&search=${data?.search || ''}`,
      providesTags: ['Assets'],
    }),
    getAssetAssignmentHistory: builder.query({
      query: query =>
        `/institutions/assets/history/${query.assetId}?pageNumber=${query.pageNumber}&search=${query.search}`,
      providesTags: ['Assets'],
    }),
    getInstitutionAssetById: builder.query({
      query: id => `/institutions/assets/view/${id}`,
      providesTags: ['Assets'],
    }),
    getAllAssetsAssignmentHistroy: builder.query({
      query: query =>
        `/institutions/assets/history?pageNumber=${query?.pageNumber}&search=${query.search}`,
      providesTags: ['Assets'],
    }),
    getStats: builder.query({
      query: () => `/institutions/assets/stats`,
      providesTags: ['Assets'],
    }),
  }),
});

export const {
  useAddInstitutionAssetMutation,
  useAssignAssetMutation,
  useGetAssetAssignmentHistoryQuery,
  useGetInstitutionAssetByIdQuery,
  useGetInstitutionAssetsQuery,
  useUnAssignAssetMutation,
  useUpdateInstitutionAssetMutation,
  useGetAllAssetsAssignmentHistroyQuery,
  useGetStatsQuery,
} = institutionAssetsApiSlice;
