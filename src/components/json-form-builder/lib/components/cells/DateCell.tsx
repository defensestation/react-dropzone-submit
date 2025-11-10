/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import { Input } from '@/components/ui/input';
import {
  CellProps,
  isDateControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { VanillaRendererProps, withVanillaCellProps } from '@jsonforms/vanilla-renderers';
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React, { useEffect } from 'react';

export const DateCell = (props: CellProps & VanillaRendererProps) => {
  const { data, className, id, enabled, uischema, path, handleChange } = props;
  const [date, setDate] = React.useState<Date>()
  useEffect(() => {
    if(date){
      handleChange(path, format(date, 'yyyy-MM-dd'))
    }
  }, [date])
  return (
    <Popover>
    <PopoverTrigger asChild>
      <Button
        variant={"outline"}
        disabled={!enabled}
        autoFocus={uischema.options && uischema.options.focus}
        className={cn(
          "justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
      id={id}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={data?parseISO(data):undefined}
        onSelect={setDate}
        initialFocus
      />
    </PopoverContent>
  </Popover>
  );
};
/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export const dateCellTester: RankedTester = rankWith(3, isDateControl);

export default withJsonFormsCellProps(withVanillaCellProps(DateCell));
