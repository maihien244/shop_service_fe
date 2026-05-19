'use client';

import * as React from 'react';
import { format } from 'date-fns';

import * as Button from '@/components/ui/button';
import * as DatepickerPrimivites from '@/components/ui/datepicker';
import * as Popover from '#/components/ui/popover';
import type { DateRange } from 'react-day-picker';

type SingleDatepickerProps = {
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
};

export function DatePicker({ value, defaultValue, onChange }: SingleDatepickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(
    value ?? defaultValue ?? undefined,
  );

  const handleChange = (value: DateRange | undefined) => {
    setRange(value);
    onChange?.(value);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button.Root variant='neutral' mode='stroke'>
          {range?.from ? (
            <>
              {format(range.from, 'LLL dd, y')}
              {range.to && <> - {format(range.to, 'LLL dd, y')}</>}
            </>
          ) : (
            <span>Chọn khoảng thời gian</span>
          )}
        </Button.Root>
      </Popover.Trigger>
      <Popover.Content className='p-0' showArrow={false} side='left'>
        <DatepickerPrimivites.Calendar
          mode='range'
          className=''
          disabled={{ before: new Date() }}
          selected={range}
          onSelect={handleChange}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
