'use client';

import { useState } from 'react';
import { assetColumns } from './assetColumns';
import { useGetInstitutionAssetsQuery } from '@/redux/features/assets/institutionAssetsApiSlice';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CustomDataTable from '@/components/CustomDataTable';
import useDebounce from '@/hooks/useDebounce';

const Page = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedValue = useDebounce(search);
  const { data } = useGetInstitutionAssetsQuery({
    pageSize: 10,
    pageNumber,
    search: debouncedValue,
  });

  const onSearchChange = searchParams => {
    setSearch(searchParams);
    setPageNumber(1);
  };
  return (
    <div>
      <div className='flex items-center justify-between py-5'>
        <h2 className='text-lg font-medium'>Assets</h2>
        <Link href='/institution/assets/add'>
          <Button className='bg-blue-500 '>Add new asset</Button>
        </Link>
      </div>
      <CustomDataTable
        columns={assetColumns}
        data={data?.assets || []}
        totalPages={data?.totalPages}
        currentPage={data?.currentPage}
        total={data?.total}
        setPage={setPageNumber}
        onSearchChange={onSearchChange}
        searchValue={search}
      />
    </div>
  );
};

export default Page;
