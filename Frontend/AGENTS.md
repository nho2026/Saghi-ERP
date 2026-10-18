# Frontend UI requirements

Use the shared shadcn/ui components in `src/shared/components/ui` for all Inventory UI and all new modules. Use Button, Input, Label, Textarea, Select or a shared shadcn combobox, Checkbox, FormDatePicker, Table, Card, Badge, and Dialog/AlertDialog where applicable. Do not recreate these controls with native elements and ad hoc classes in feature pages.

Compose missing controls from existing shadcn primitives in the shared UI directory. Preserve keyboard access, accessible labels, validation, disabled states, RTL, and dark mode. Native semantic/layout elements and standalone printable HTML are permitted; they are not replacements for interactive application components.

The shared TableBody enables automatic pagination by default. Set `autoPaginate={false}` when the page owns server pagination or when displaying a complete invoice/summary. Each list must have only one pagination control.
