import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SigmaSquare } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const StatsCard = ({ title, bgcolor, cardValue }) => {
  return (
    <Card className={`${bgcolor} border-0`}>
      <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-row items-center justify-between'>
        <p className='text-2xl font-bold'>
          {cardValue?.toLocaleString() || <Skeleton className='w-20 h-5' />}
        </p>
        <SigmaSquare />
      </CardContent>
    </Card>
  );
};

export default StatsCard;
