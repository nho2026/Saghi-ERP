export const debtPrintStyles = `
  @page { size: A4 portrait; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #20343e; font: 9.5pt Arial, sans-serif; line-height: 1.5; }
  header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8mm; border-bottom: 1px solid #bdcdcf; padding-bottom: 6mm; margin-bottom: 6mm; }
  .brand { display: inline-block; font-size: 8pt; font-weight: 700; letter-spacing: .12em; color: #1C9B49; margin-bottom: 2mm; }
  h1 { margin: 0; font-size: 26pt; font-weight: 700; line-height: 1.2; letter-spacing: -.035em; color: #153b42; }
  .report-meta { text-align: end; max-width: 65mm; border-inline-start: 3px solid #1C9B49; padding-inline-start: 4mm; }
  .report-meta strong { display: block; font-size: 11pt; overflow-wrap: anywhere; }
  h2 { display: flex; align-items: center; gap: 3mm; font-size: 10.5pt; margin: 7mm 0 3mm; break-after: avoid; }
  h2::after { content: ''; height: 1px; background: #dce5e7; flex: 1; }
  p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  .muted { color: #63757e; font-size: 8pt; }
  .overview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3mm; margin: 3mm 0 6mm; break-inside: avoid; }
  .metric { border: 1px solid #d6e1e3; border-top: 3px solid #adc1c5; border-radius: 2mm; padding: 4mm; background: #f8fafb; }
  .metric span { display: block; color: #526b75; font-size: 8pt; font-weight: 700; }
  .metric strong { display: block; margin-top: 3mm; font-size: 19pt; letter-spacing: -.03em; line-height: 1.2; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .metric:nth-child(2) { border-top-color: #438e7d; }
  .metric.balance { border-color: #1C9B49; background: #e9f5f2; }
  .metric.balance span, .metric.balance strong { color: #075f58; }
  .details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4mm 6mm; padding: 4mm; border: 1px solid #d6e1e3; border-radius: 2mm; margin-bottom: 6mm; break-inside: avoid; }
  .details p { margin: 0; }
  .details strong { display: inline-block; margin-top: 1mm; font-size: 9pt; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8.5pt; border-bottom: 1px solid #bdcdcf; }
  thead { display: table-header-group; }
  th, td { padding: 3mm 2mm; text-align: start; border-bottom: 1px solid #e0e7e9; overflow-wrap: anywhere; vertical-align: middle; }
  th { background: #e5efef; color: #21474e; border-top: 1px solid #bdcdcf; border-bottom: 1px solid #bdcdcf; font-size: 7.5pt; line-height: 1.4; font-weight: 700; }
  tbody tr:nth-child(even) { background: #f6f9fa; }
  tbody td:first-child { font-weight: 600; }
  tr { break-inside: avoid; }
  .number { text-align: end; font-variant-numeric: tabular-nums; }
  .status { display: inline-block; padding: .8mm 1.5mm; border: 1px solid currentColor; border-radius: 1mm; font-size: 7pt; font-weight: 700; line-height: 1.35; }
  .paid { color: #17664d; background: #eef8f1; }
  .partial { color: #795600; background: #fff8e7; }
  .unpaid { color: #963b42; background: #fff2f2; }
  .total-row td { border-top: 2px solid #749a99; padding-top: 3.5mm; padding-bottom: 3.5mm; font-weight: 700; background: #edf5f3; color: #153f3c; }
  .note { border-inline-start: 3px solid #adc1c5; padding: 3mm 4mm; background: #f8fafb; }
  footer { display: flex; justify-content: space-between; gap: 5mm; border-top: 1px solid #bdcdcf; margin-top: 8mm; padding-top: 3mm; color: #63757e; font-size: 7.5pt; }
  footer strong { color: #31565c; }
  @media screen { html { background: #e8eef0; } body { width: 210mm; min-height: 297mm; margin: 8mm auto; padding: 14mm 12mm; background: white; box-shadow: 0 2mm 8mm #20343e1a; } }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
`;
