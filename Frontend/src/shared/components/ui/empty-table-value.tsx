import * as React from "react";
import { CircleSlash } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyTableValue() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center align-middle text-muted-foreground">
      <CircleSlash className="size-4" aria-hidden="true" />
      <span className="sr-only">{t("table.emptyValue")}</span>
    </span>
  );
}

const textContainers = new Set([
  "span",
  "div",
  "p",
  "bdi",
  "b",
  "strong",
  "small",
  "em",
  "i",
]);

export function formatTableValue(value: React.ReactNode): React.ReactNode {
  if (
    value == null ||
    typeof value === "boolean" ||
    (typeof value === "string" && !value.trim())
  ) {
    return <EmptyTableValue />;
  }
  if (typeof value === "string" && ["-", "–", "—"].includes(value.trim())) {
    return <EmptyTableValue />;
  }
  if (Array.isArray(value)) {
    const content = React.Children.toArray(value);
    if (
      !content.length ||
      content.every((child) => typeof child === "string" && !child.trim())
    )
      return <EmptyTableValue />;
    return React.Children.map(value, (child) =>
      child == null ||
      typeof child === "boolean" ||
      (typeof child === "string" && !child.trim())
        ? child
        : formatTableValue(child),
    );
  }
  if (
    React.isValidElement<{
      children?: React.ReactNode;
      dangerouslySetInnerHTML?: unknown;
    }>(value) &&
    (value.type === React.Fragment ||
      (typeof value.type === "string" && textContainers.has(value.type))) &&
    Object.hasOwn(value.props, "children") &&
    !value.props.dangerouslySetInnerHTML
  ) {
    return React.cloneElement(
      value,
      {},
      formatTableValue(value.props.children),
    );
  }
  return value;
}
