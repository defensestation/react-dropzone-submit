import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options?: OptionType[];
  loadOptions?: (search: string) => Promise<OptionType[]>;
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function MultiSelect({
  options: propOptions,
  loadOptions,
  value = [],
  onChange,
  placeholder = "Select items...",
  className,
  isLoading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [options, setOptions] = React.useState<OptionType[]>(propOptions || []);
  const [optionsLoading, setOptionsLoading] = React.useState(false);

  // Load options when search term changes (if loadOptions provided)
  React.useEffect(() => {
    if (!loadOptions) return;

    const loadData = async () => {
      setOptionsLoading(true);
      try {
        const result = await loadOptions(searchTerm);
        setOptions(result);
      } catch (error) {
        console.error("Error loading options", error);
      } finally {
        setOptionsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadOptions]);

  // Ensure selected values are included in options
  React.useEffect(() => {
    // Start with provided options or empty array
    const baseOptions = propOptions || [];
    
    // Create a new array with all options plus any selected values not in options
    const mergedOptions = [...baseOptions];
    
    // Add any selected values that aren't already in the options
    value.forEach(selectedItem => {
      const exists = mergedOptions.some(option => option.value === selectedItem.value);
      if (!exists) {
        mergedOptions.push(selectedItem);
      }
    });
    
    setOptions(mergedOptions);
  }, [propOptions, value]);

  // Handle selection of an item
  const handleSelect = (option: OptionType) => {
    const isSelected = value.some((item) => item.value === option.value);
    let newValue: OptionType[];

    if (isSelected) {
      newValue = value.filter((item) => item.value !== option.value);
    } else {
      newValue = [...value, option];
    }

    onChange(newValue);
  };

  // Remove a selected item
  const handleRemove = (option: OptionType, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((item) => item.value !== option.value));
  };

  // Clear all selected items
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[90%] overflow-hidden">
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.map((item) => (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {item.label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => handleRemove(item, e)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {value.length > 0 && (
              <div className="flex items-center justify-end p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleClear}
                >
                  Clear all
                </Button>
              </div>
            )}
            <CommandEmpty>
              {optionsLoading || isLoading
                ? "Loading..."
                : "No results found."}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const isSelected = value.some(
                  (item) => item.value === option.value
                );
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {option.label}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}