import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ActiveModifiers, DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  minDate?: Date; // Minimum selectable date
  maxDate?: Date; // Maximum selectable date
  defaultFrom?: Date; // Default start date
  defaultTo?: Date; // Default end date
  name?: string; // Name for the field
  onChange?: (value: DateRange | undefined) => void; // Callback for value change
  className?: string; // Optional custom class name
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  hideIcon?: boolean;
}

export default function DatePickerWithRange({
  className,
  minDate = new Date("1900-01-01"), // Default minimum date
  maxDate = new Date(), // Default maximum date (today)
  defaultFrom,
  defaultTo,
  name,
  onChange,
  hideIcon,
  disabled,
  size = "default",
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedRange: DateRange | undefined, selectedDay: Date, activeModifiers: ActiveModifiers, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedRange) {
      const boundedFrom =
        selectedRange.from && minDate
          ? new Date(Math.max(selectedRange.from.getTime(), minDate.getTime()))
          : selectedRange.from;

      const boundedTo =
        selectedRange.to && maxDate
          ? new Date(Math.min(selectedRange.to.getTime(), maxDate.getTime()))
          : selectedRange.to;

      const newRange = { from: boundedFrom, to: boundedTo };
      setDate(newRange);
      onChange?.(newRange);
      // if (newRange.from && newRange.to) {
      //   setOpen(false);
      // }
    } else {
      setDate(undefined);
      onChange?.(undefined);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} asChild>
          <Button
            id={name}
            size={size}
            variant={"outline"}
            className={cn(
              "min-w-[200px] justify-between text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {/* {!hideIcon && <CalendarIcon className="mr-2 h-4 w-4" />} */}
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
            {!hideIcon && <CalendarIcon className=" h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) => date > maxDate || date < minDate}
          />
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        name={`${name}_from`}
        value={date?.from ? date.from.toISOString() : ""}
      />
      <input
        type="hidden"
        name={`${name}_to`}
        value={date?.to ? date.to.toISOString() : ""}
      />
    </div>
  );
}
