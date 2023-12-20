import {
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { endOfDay, format, startOfDay } from "date-fns";
import React from "react";
import { DateRange, DateRangePicker } from "react-date-range";
import {
  defaultInputRanges,
  defaultStaticRanges,
} from "../utils/defaultDateRange";

export default function DatePicker({
  baseDate,
  range,
  onDateChange,
  onApply,
  disabled,
  maxDate,
  ...rest
}) {
  const popM = useDisclosure();

  const popsize = useBreakpointValue({ base: null, lg: "auto" });

  const displayMobile = useBreakpointValue({ base: true, lg: false });
  const displayDesktop = useBreakpointValue({ base: false, lg: true });
  const setRange = (dateRange) => {
    if (onDateChange) onDateChange(dateRange);
  };
  return (
    <Popover
      matchWidth
      placement="bottom-end"
      isOpen={disabled ? null : popM.isOpen}
      onClose={popM.onClose}
    >
      <PopoverTrigger>
        <Flex
          flexDirection={{ base: "row", lg: "row" }}
          tabIndex="0"
          role="button"
          aria-label="Date Range"
          p={2}
          borderWidth={1}
          borderRadius="15"
          onClick={popM.onOpen}
          variant="outline"
          h="44px"
          maxh="44px"
          {...rest}
        >
          <Text mr={2} color="brand.600" fontSize="sm">
            {format(range[0].start_date, "MM/dd/yyyy")}
          </Text>
          <Text fontSize="sm" mr={2}>
            to
          </Text>
          <Text color="brand.600" fontSize="sm">
            {format(range[0].end_date, "MM/dd/yyyy")}
          </Text>
        </Flex>
      </PopoverTrigger>
      <PopoverContent width={popsize}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Date Range</PopoverHeader>
        <PopoverBody>
          {displayMobile && (
            <DateRange
              minDate={baseDate}
              maxDate={maxDate}
              editableDateInputs
              rangeColors={["#48BB78", "#68D391", "#9AE6B4"]}
              color="#48BB78"
              onChange={(item) => {
                item.selection.start_date = startOfDay(
                  item.selection.startDate
                );

                item.selection.end_date = endOfDay(item.selection.endDate);

                setRange([item.selection]);
              }}
              moveRangeOnFirstSelection={false}
              ranges={range}
            />
          )}
          {displayDesktop && (
            <DateRangePicker
              minDate={baseDate}
              maxDate={maxDate}
              editableDateInputs
              rangeColors={["#48BB78", "#68D391", "#9AE6B4"]}
              color="#48BB78"
              onChange={(item) => {
                item.selection.start_date = item.selection.startDate;

                item.selection.end_date = item.selection.endDate;

                setRange([item.selection]);
              }}
              showSelectionPreview
              moveRangeOnFirstSelection={false}
              months={1}
              ranges={range}
              staticRanges={defaultStaticRanges}
              inputRanges={defaultInputRanges}
              direction="horizontal"
            />
          )}
        </PopoverBody>
        <PopoverFooter d="flex" justifyContent="flex-end">
          <Button
            colorScheme="brand"
            onClick={() => {
              popM.onClose();
              if (onApply) onApply();
            }}
          >
            Apply
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
