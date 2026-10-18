import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
export function CreatableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  required,
  maxLength,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const choose = (next: string) => {
    onValueChange(next);
    setOpen(false);
    setSearch("");
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-2"
      >
        <Input
          aria-label={placeholder}
          placeholder={placeholder}
          value={search}
          maxLength={maxLength}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (search.trim()) choose(search.trim());
            }
          }}
        />
        <ScrollArea className="mt-2 max-h-60 overflow-y-auto">
          {options
            .filter((option) =>
              option.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
            )
            .map((option) => (
              <Button
                key={option}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start whitespace-normal text-start"
                onClick={() => choose(option)}
              >
                <Check
                  className={`size-4 shrink-0 ${value === option ? "" : "invisible"}`}
                />
                {option}
              </Button>
            ))}
          {search.trim() && !options.includes(search.trim()) && (
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal text-start"
              onClick={() => choose(search.trim())}
            >
              <Plus className="size-4 shrink-0" />
              {search.trim()}
            </Button>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
