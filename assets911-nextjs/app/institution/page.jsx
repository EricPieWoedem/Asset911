'use client';

import { useState } from 'react';
import { assetColumns } from './assets/assetColumns';
import {
  useGetInstitutionAssetsQuery,
  useGetStatsQuery,
} from '@/redux/features/assets/institutionAssetsApiSlice';
import CustomDataTable from '@/components/CustomDataTable';
import StatsCard from '@/components/StatsCard';
import useDebounce from '@/hooks/useDebounce';

const Page = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedValue = useDebounce(search);
  const { data, error } = useGetInstitutionAssetsQuery({
    pageSize: 10,
    pageNumber,
    search: debouncedValue,
  });
  const { data: statsData } = useGetStatsQuery();

  const onSearchChange = searchParams => {
    setSearch(searchParams);
    setPageNumber(1);
  };

  return (
    <>
      <div className='grid gap-4 my-5 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Assets'
          bgcolor='bg-green-100'
          cardValue={statsData?.totalAssetCount}
        />
        <StatsCard
          title='Total Unassigned Assets'
          bgcolor='bg-orange-100'
          cardValue={statsData?.totalUnassignedAssetCount}
        />
        <StatsCard
          title='Total Assigned Assets'
          bgcolor='bg-blue-100'
          cardValue={statsData?.totalAssigned}
        />
        <StatsCard title='Out-of-order' bgcolor='bg-red-100' cardValue={0} />
      </div>

      <div>
        <CustomDataTable
          columns={assetColumns}
          data={data?.assets || []}
          totalPages={data?.totalPages}
          currentPage={data?.currentPage}
          total={data?.total}
          setPage={setPageNumber}
          onSearchChange={onSearchChange}
          searchValue={search}
          error={error}
          title='Assets Table'
        />
      </div>
    </>
  );
};

export default Page;
