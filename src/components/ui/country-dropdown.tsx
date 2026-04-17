/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useCallback, useState, forwardRef, useEffect } from "react";

// shadcn
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

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";

// data
import { countries } from "country-data-list";
import { TCountry } from "@/types/types";

const ALLOWED_COUNTRY_CODES = new Set(["KE", "UG", "RW", "TZ", "BW", "ZM", "CD"]);

const allowedCountries = countries.all.filter(
  (country: TCountry) =>
    country.alpha2 && ALLOWED_COUNTRY_CODES.has(country.alpha2)
);

// Dropdown props
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
    placeholder = "Select a country",
    slim = false,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<TCountry | undefined>(
    undefined
  );

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (country) =>
          country.alpha3 === defaultValue || country.alpha2 === defaultValue
      );
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        setSelectedCountry(undefined);
      }
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

  const triggerClasses = cn(
    "flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    slim ? "w-20" : "w-full min-w-[140px]"
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        className={triggerClasses}
        disabled={disabled}
        {...props}>
        {selectedCountry ? (
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            {selectedCountry.emoji ? (
              <span className="text-base leading-none shrink-0">
                {selectedCountry.emoji}
              </span>
            ) : (
              <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                <CircleFlag
                  countryCode={selectedCountry.alpha2?.toLowerCase() || ""}
                  height={20}
                />
              </div>
            )}
            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {selectedCountry.name}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground flex-1 min-w-0">
            <Globe size={16} className="shrink-0" />
            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {placeholder}
              </span>
            )}
          </div>
        )}
        <ChevronDown size={16} className="shrink-0 ml-1 opacity-60" />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0"
      >
        <Command className="w-full max-h-50 sm:max-h-67.5">
          <CommandList>
            <div className="sticky top-0 z-10 bg-popover">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .map((option, key: number) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={key}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-2 overflow-hidden">
                      {option.emoji ? (
                        <span className="text-base leading-none shrink-0">{option.emoji}</span>
                      ) : (
                        <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                          <CircleFlag
                            countryCode={option.alpha2?.toLowerCase() || ""}
                            height={20}
                          />
                        </div>
                      )}
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {option.name}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        option.name === selectedCountry?.name
                          ? "opacity-100"
                          : "opacity-0"
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