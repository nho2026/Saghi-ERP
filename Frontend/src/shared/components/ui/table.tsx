import { formatTableValue } from "./empty-table-value";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "./button";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-xl bg-card">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-card shadow-[inset_0_-1px_0_var(--border)] [&_tr]:border-b [&_tr]:border-border",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    pageSize?: number;
    autoPaginate?: boolean;
    emptyMessage?: React.ReactNode;
    pagination?: {
      page: number;
      totalPages: number;
      total: number;
      onPageChange: (page: number) => void;
      disabled?: boolean;
    };
  }
>(
  (
    {
      className,
      children,
      pageSize = 10,
      autoPaginate = true,
      emptyMessage,
      pagination,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [page, setPage] = React.useState(1);
    const childList = React.Children.toArray(children);
    const dataRows = childList.filter(
      (child) =>
        React.isValidElement(child) &&
        typeof child.type !== "string" &&
        (child.type as { displayName?: string }).displayName === "TableRow",
    );
    const totalPages =
      pagination?.totalPages ??
      Math.max(1, Math.ceil(dataRows.length / pageSize));
    React.useEffect(() => {
      setPage((value) => Math.min(value, totalPages));
    }, [totalPages]);
    const activePage = pagination?.page ?? page;
    const first = (activePage - 1) * pageSize;
    let rowIndex = 0;
    const visibleChildren = childList.filter((child) => {
      const isRow =
        React.isValidElement(child) &&
        typeof child.type !== "string" &&
        (child.type as { displayName?: string }).displayName === "TableRow";
      if (!isRow || !autoPaginate || pagination) return true;
      const visible = rowIndex >= first && rowIndex < first + pageSize;
      rowIndex += 1;
      return visible;
    });
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      >
        {visibleChildren}
        {childList.length === 0 && (
          <tr className="border-0 bg-card hover:bg-card">
            <td
              colSpan={100}
              className="h-10 px-4 text-center text-sm text-muted-foreground"
            >
              {emptyMessage ?? t("resourceState.notFound")}
            </td>
          </tr>
        )}
        {(pagination || (dataRows.length > 0 && autoPaginate)) && (
          <tr className="border-t bg-card hover:bg-card print:hidden">
            <td colSpan={100} className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {t("pagination.summary", {
                    page: activePage,
                    totalPages,
                    total: pagination?.total ?? dataRows.length,
                  })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="h-8 rounded-md border bg-background px-3 text-xs font-medium disabled:opacity-50"
                    disabled={pagination?.disabled || activePage <= 1}
                    onClick={() =>
                      pagination
                        ? pagination.onPageChange(activePage - 1)
                        : setPage((value) => Math.max(1, value - 1))
                    }
                  >
                    {t("pagination.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="h-8 rounded-md border bg-background px-3 text-xs font-medium disabled:opacity-50"
                    disabled={pagination?.disabled || activePage >= totalPages}
                    onClick={() =>
                      pagination
                        ? pagination.onPageChange(activePage + 1)
                        : setPage((value) => Math.min(totalPages, value + 1))
                    }
                  >
                    {t("pagination.next")}
                  </Button>
                </div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    );
  },
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border/80 bg-card transition-colors hover:bg-muted/45 data-[state=selected]:bg-primary/8",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation();
  const headerKeys: Record<string, string> = {
    User: "user",
    Device: "device",
    Credentials: "credentials",
    Employee: "employee",
    Event: "event",
    Verification: "verification",
    "Date & time": "dateTime",
    Role: "role",
    Department: "department",
    Status: "status",
    Permission: "permission",
    Permissions: "permissions",
  };
  const content =
    typeof children === "string" && headerKeys[children]
      ? t(`table.headers.${headerKeys[children]}`)
      : children || t("table.actions");
  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-2 text-start align-middle font-semibold text-primary/85 [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        !children && "text-end",
        className,
      )}
      {...props}
    >
      {content}
    </th>
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 text-start align-middle [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  >
    {formatTableValue(children)}
  </td>
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
