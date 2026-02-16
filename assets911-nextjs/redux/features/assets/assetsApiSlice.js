import { apiSlice } from '@/redux/app/api/apiSlice';

export const assetsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAssets: builder.query({
      query: queries =>
        `/asset/user/?pageSize=${queries?.pageSize || 10}&pageNumber=${
          queries?.pageNumber || 1
        }&search=${queries?.search || ''}`,
      providesTags: ['Assets'],
    }),

    getAsset: builder.query({
      query: id => `/asset/${id}`,
      providesTags: ['Assets'],
    }),
    addAsset: builder.mutation({
      query: asset => ({
        url: '/asset/add',
        method: 'POST',
        body: asset,
      }),
      invalidatesTags: ['Assets'],
    }),
    updateAsset: builder.mutation({
      query: asset => ({
        url: `/asset/update/${asset.id}`,
        method: 'PATCH',
        body: asset,
      }),
      providesTags: ['Assets'],
    }),
    transferAsset: builder.mutation({
      query: asset => ({
        url: `/asset/transfer-asset/${asset.assetId}`,
        method: 'POST',
        body: {
          newOwner: asset.newOwner,
          notes: asset.notes,
          transferDate: asset.transferDate,
        },
      }),
      invalidatesTags: ['Assets'],
    }),
    getStatistics: builder.query({
      query: () => '/user/stats',
      providesTags: ['Assets'],
    }),
    deleteAsset: builder.mutation({
      query: id => ({
        url: `/asset/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assets'],
    }),
    getTransferredAssets: builder.query({
      query: () => '/asset/user/transferred',
      providesTags: ['Assets'],
    }),
    getSingleTransferDocument: builder.query({
      query: id => `/asset/transfer-record/${id}`,
      providesTags: ['Assets'],
    }),
    getRecievedAssets: builder.query({
      query: () => '/asset/user/recieved',
      providesTags: ['Assets'],
    }),
    confirmTransfer: builder.mutation({
      query: params => ({
        url: `/asset/confirm-transfer/${params.id}`,
        method: 'PATCH',
        body: { code: params.otp },
      }),
      invalidatesTags: ['Assets'],
    }),
    resendTransferConfirmationOtp: builder.mutation({
      query: id => ({
        url: `asset/resend-confirmation-code/${id}`,
        method: 'GET',
      }),
    }),
    getPublicAsset: builder.query({
      query: id => `/public/${id}`,
    }),
    getPublicAssetByPolice: builder.query({
      query: id => `/police/assets/${id}`,
    }),
    cancelAssetTransfer: builder.mutation({
      query: params => ({
        url: `/asset/cancel-asset/${params}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Assets'],
    }),
    getBrands: builder.query({
      query: () => '/brands',
    }),
    addNewBrandOrModel: builder.mutation({
      query: body => ({
        url: `/brands/${body.type}`,
        method: 'PATCH',
        body: body.data,
      }),
    }),
    getAssetCategories: builder.query({
      query: () => '/brands/category',
    }),
    getBrandsAndModels: builder.query({
      query: () => '/brands/brandsAndModel',
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useAddAssetMutation,
  useGetAssetQuery,
  useUpdateAssetMutation,
  useTransferAssetMutation,
  useGetStatisticsQuery,
  useDeleteAssetMutation,
  useGetTransferredAssetsQuery,
  useGetSingleTransferDocumentQuery,
  useGetRecievedAssetsQuery,
  useConfirmTransferMutation,
  useResendTransferConfirmationOtpMutation,
  useGetPublicAssetQuery,
  useGetPublicAssetByPoliceQuery,
  useCancelAssetTransferMutation,
  useGetBrandsQuery,
  useAddNewBrandOrModelMutation,
  useGetAssetCategoriesQuery,
  useGetBrandsAndModelsQuery,
} = assetsApiSlice;
