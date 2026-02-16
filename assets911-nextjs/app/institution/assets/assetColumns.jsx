import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export const assetColumns = [
  {
    accessorKey: 'uniqueNumber',
    header: 'Unique Number',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
      const assignedTo = row.getValue('assignedTo');
      return <div>{assignedTo.staff ? assignedTo.staff : 'available'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original._id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='w-8 h-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(asset)}
            >
              Copy Asset ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/institution/assets/${asset}`}>
              <DropdownMenuItem>View Asset</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
