'use client';

import { useState } from 'react';
import { institutionColumns } from './institutionColumns';
import { useGetInstitutionsQuery } from '@/redux/features/assets/ecfatumApiSlice';
import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import useDebounce from '@/hooks/useDebounce';
import Link from 'next/link';

const Page = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedValue = useDebounce(search);
  const [open, setOpen] = useState(false);
  const { data } = useGetInstitutionsQuery({
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
        <h2 className='text-lg font-medium'>Institutions</h2>
        <Link href='/institution/ecfatum/new'>
          <Button className='bg-blue-500 '>Add new Institution</Button>
        </Link>
      </div>
      <CustomDataTable
        columns={institutionColumns}
        data={data?.institutions || []}
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
