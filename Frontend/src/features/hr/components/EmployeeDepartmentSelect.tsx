import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function EmployeeDepartmentSelect({
  name,
  initialValue,
  options,
  placeholder,
}: {
  name: string;
  initialValue: string;
  options: (string | number)[][];
  placeholder: string;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="relative">
      <Select name={name} value={value} onValueChange={setValue} required>
        <SelectTrigger
          ref={trigger}
          className={value ? "w-full pe-14" : "w-full"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-10000">
          {options.map(([id, label]) => (
            <SelectItem key={String(id)} value={String(id)}>
              {String(label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
          aria-label={t("hr.clearDepartment", {
            defaultValue: "Clear department",
          })}
          onClick={(event) => {
            event.preventDefault();
            setValue("");
            trigger.current?.focus();
          }}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
