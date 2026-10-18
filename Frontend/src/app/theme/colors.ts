/** color tokens. CSS equivalents live in index.css. */
export const brandColors = {
  green: "#1C9B49",
  greenBright: "#29AD49",
  // Compatibility aliases for existing consumers.
  blue: "#1C9B49",
  blueDark: "#17823D",
  blueLight: "#E8F5ED",
  teal: "#29AD49",
  tealDark: "#1C9B49",
  tealLight: "#E8F5ED",
} as const;

export const windowControlColors = {
  minimize: "#FBBF24",
  maximize: "#22C55E",
  close: "#DC2626",
} as const;

export const colors = {
  brand: brandColors,
  windowControls: windowControlColors,
  light: {
    primary: brandColors.green,
    primaryHover: "#17823D",
    primaryPressed: "#126A31",
    primarySubtle: brandColors.blueLight,
    onPrimary: "#071b0e",
    secondary: brandColors.teal,
    secondaryHover: "#1C9B49",
    secondaryPressed: brandColors.tealDark,
    secondarySubtle: brandColors.tealLight,
    onSecondary: "#071B0E",
    background: "#F2F9F4",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    surfaceMuted: "#EDF7F0",
    text: {
      primary: "#173322",
      secondary: "#405E4B",
      muted: "#607567",
      inverse: "#FFFFFF",
      link: brandColors.blue,
    },
    border: "#CCE5D4",
    borderStrong: "#B8DAC4",
    focus: brandColors.blue,
    success: "#15803D",
    warning: "#B45309",
    error: "#DC2626",
    info: "#0284C7",
  },
  dark: {
    primary: brandColors.green,
    primaryHover: "#27AD56",
    primaryPressed: "#17823D",
    primarySubtle: "#0B120E",
    onPrimary: "#071b0e",
    secondary: brandColors.greenBright,
    secondaryHover: "#74D394",
    secondaryPressed: "#A8E4BC",
    secondarySubtle: "#15251B",
    onSecondary: "#FFFFFF",
    background: "#0B120E",
    surface: "#111D15",
    surfaceRaised: "#16251B",
    surfaceMuted: "#19271F",
    text: {
      primary: "#FFFFFF",
      secondary: "#D4D4D4",
      muted: "#A3B8AA",
      inverse: "#070707",
      link: brandColors.blue,
    },
    border: "#2B4433",
    borderStrong: "#36533F",
    focus: brandColors.blue,
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#e00d2c",
    info: "#38BDF8",
  },
} as const;

export type ThemeMode = "light" | "dark";
export type ThemeColors = (typeof colors)[ThemeMode];
