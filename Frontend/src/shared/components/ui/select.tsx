import { useActionPermission } from "@/features/auth/permission-context";
import { useTranslation } from "react-i18next";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "./input";

const SelectSearchContext = React.createContext("");
function optionText(value: React.ReactNode): string {
  return React.Children.toArray(value)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : React.isValidElement<{ children?: React.ReactNode }>(child)
          ? optionText(child.props.children)
          : "",
    )
    .join(" ");
}

import { cn } from "@/lib/utils";

function Select({
  permission,
  disabled,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  permission?: string;
}) {
  const allowed = useActionPermission(permission);
  return (
    <SelectPrimitive.Root
      {...props}
      disabled={disabled || !allowed}
      onValueChange={allowed ? onValueChange : undefined}
    />
  );
}

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

function countOptions(children: React.ReactNode): number {
  return React.Children.toArray(children).reduce<number>((count, child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child))
      return count;
    return (
      count +
      (child.type === SelectItem ? 1 : countOptions(child.props.children))
    );
  }, 0);
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchable?: boolean;
  }
>(({ className, children, position = "popper", searchable, ...props }, ref) => {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState("");
  const showSearch = searchable ?? countOptions(children) > 7;
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-[10001] flex max-h-[min(320px,var(--radix-select-content-available-height))] flex-col min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "w-(--radix-select-trigger-width) min-w-[min(14rem,var(--radix-select-content-available-width))] max-w-(--radix-select-content-available-width) data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
        onCloseAutoFocus={(event) => {
          setSearch("");
          props.onCloseAutoFocus?.(event);
        }}
      >
        {showSearch && (
          <div
            className="shrink-0 border-b p-2"
            onKeyDown={(event) => {
              if (event.key === "Escape" || event.key === "Tab") return;
              event.stopPropagation();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                event.currentTarget.parentElement
                  ?.querySelector<HTMLElement>(
                    '[role="option"]:not([data-disabled])',
                  )
                  ?.focus();
              }
            }}
          >
            <Input
              aria-label={t("common.searchOptions")}
              placeholder={t("common.searchOptions")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
            />
          </div>
        )}
        <SelectSearchContext.Provider value={showSearch ? search : ""}>
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "min-h-0 max-h-60 flex-1 p-1 [&:has([role=option])_.select-empty]:hidden",
              position === "popper" && "w-full min-w-0",
            )}
          >
            {children}
            <p
              role="status"
              className="select-empty px-3 py-4 text-center text-sm text-muted-foreground"
            >
              {t("common.noOptionsFound")}
            </p>
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectSearchContext.Provider>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const search = React.useContext(SelectSearchContext);
  if (
    search.trim() &&
    !(props.textValue ?? optionText(children))
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase())
  )
    return null;
  return (
    <SelectPrimitive.Item
      ref={ref}
      onPointerMove={(event) => {
        if (document.activeElement?.tagName === "INPUT") event.preventDefault();
        props.onPointerMove?.(event);
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute end-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="min-w-0 whitespace-normal break-words">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
