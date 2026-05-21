/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useCallback, useState, forwardRef, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";
import { countries } from "country-data-list";
import { TCountry } from "@/types/types";

const ALLOWED_COUNTRY_CODES = new Set(["KE", "UG", "RW", "TZ", "BW", "ZM"]);

const allowedCountries = countries.all.filter(
  (country: TCountry) =>
    country.alpha2 && ALLOWED_COUNTRY_CODES.has(country.alpha2)
);

interface CountryDropdownProps {
  options?: TCountry[];
  onChange?: (country: TCountry) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

const CountryDropdownComponent = (
  {
    options = allowedCountries,
    onChange,
    defaultValue,
    disabled = false,
    slim = false,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<TCountry | undefined>(undefined);

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (c) => c.alpha3 === defaultValue || c.alpha2 === defaultValue
      );
      setSelectedCountry(initialCountry ?? undefined);
    } else {
      setSelectedCountry(undefined);
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country: TCountry) => {
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 rounded-md bg-transparent px-1.5 py-1 cursor-pointer",
          "hover:bg-gray-100 transition-colors disabled:opacity-50 focus-visible:outline-none",
          slim ? "w-auto" : " justify-between"
        )}
        {...props}>
        {selectedCountry ? (
          <CircleFlag
            countryCode={selectedCountry.alpha2?.toLowerCase() ?? ""}
            height={22}
            width={22}
            className="shrink-0 rounded-full"
          />
        ) : (
          <Globe size={18} className="shrink-0 text-muted-foreground" />
        )}
        <ChevronDown
          size={13}
          className="shrink-0 opacity-50 transition-transform duration-200 [[data-state=open]>&]:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent collisionPadding={10} side="bottom" className="w-52 p-0">
        <Command>
          <CommandList>
            <div className="sticky top-0 z-10 bg-popover">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .map((option, key) => (
                  <CommandItem
                    key={key}
                    className="flex items-center gap-2.5 px-3 py-2"
                    onSelect={() => handleSelect(option)}
                  >
                    <CircleFlag
                      countryCode={option.alpha2?.toLowerCase() ?? ""}
                      height={18}
                      width={18}
                      className="shrink-0 rounded-full"
                    />
                    <span className="flex-1 truncate text-sm">{option.name}</span>
                    <CheckIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        option.name === selectedCountry?.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";
export const CountryDropdown = forwardRef(CountryDropdownComponent);
