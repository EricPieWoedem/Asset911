import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/helpers';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
export const assignmentHistoryColumns = [
  {
    accessorKey: 'staffId',
    header: 'Staff ID',
  },
  {
    accessorKey: 'staffName',
    header: 'Staff Name',
  },
  {
    accessorKey: 'assginedOn',
    header: 'Assigned On',
    cell: ({ row }) => {
      const date = row.getValue('assginedOn');
      return formatDate(date);
    },
  },
  {
    accessorKey: 'unAssignedOn',
    header: 'UnAssigned On',
    cell: ({ row }) => {
      const unassigned = row.getValue('unAssignedOn');
      if (unassigned) {
        return formatDate(unassigned);
      } else {
        return 'In possesion';
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original.assetId;
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
