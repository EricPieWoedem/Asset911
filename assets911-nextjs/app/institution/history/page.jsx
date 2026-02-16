'use client';

import { assignmentHistoryColumns } from '../assets/assignmentHistoryColumns';
import { useGetAllAssetsAssignmentHistroyQuery } from '@/redux/features/assets/institutionAssetsApiSlice';
import CustomDataTable from '@/components/CustomDataTable';
import { useState } from 'react';

const Page = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const { data } = useGetAllAssetsAssignmentHistroyQuery({
    pageNumber,
    search,
  });

  const onSearchChange = searchParams => {
    setSearch(searchParams);
    setPageNumber(1);
  };
  return (
    <div>
      <CustomDataTable
        columns={assignmentHistoryColumns}
        data={data?.results || []}
        totalPages={data?.totalPages}
        currentPage={data?.currentPage}
        total={data?.total}
        setPage={setPageNumber}
        onSearchChange={onSearchChange}
        title='Assignment History'
      />
    </div>
  );
};

export default Page;
