import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function WhatsappIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a10 10 0 0 0-8.66 15L2 22l5.13-1.35A10 10 0 1 0 12 2Zm-3.9 5.4 1.5 2.3-1 1.1a8 8 0 0 0 4.5 4.1l1-1.2 2.5 1.2c-.3 1.5-1.3 2.2-2.7 1.8-3.9-1-7.3-4.2-7.5-7.2-.1-1 .5-1.8 1.7-2.1Z"
      />
    </svg>
  );
}

export function MessengerIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1C5.8 1 1 5.55 1 11.6c0 3.17 1.32 5.91 3.47 7.81.18.16.29.39.3.63l.06 1.96c.02.62.66 1.02 1.23.77l2.18-.96a.9.9 0 0 1 .59-.04c1.02.28 2.08.42 3.17.42 6.2 0 11-4.55 11-10.6S18.2 1 12 1Zm-6.6 13.7 3.23-5.12a1.65 1.65 0 0 1 2.38-.44l2.57 1.93c.24.18.57.18.81 0l3.47-2.63c.46-.35 1.07.2.76.69l-3.23 5.12a1.65 1.65 0 0 1-2.38.44l-2.57-1.93a.68.68 0 0 0-.81 0l-3.47 2.63c-.46.35-1.07-.2-.76-.69Z"
      />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  const note =
    "M15.5 2h-3.3v13.4a2.8 2.8 0 1 1-2.4-2.77V9.25a6.15 6.15 0 1 0 5.7 6.15V8.6a8.4 8.4 0 0 0 4.8 1.5V6.75A4.8 4.8 0 0 1 15.5 2Z";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d={note} fill="#25F4EE" transform="translate(-.7 -.4)" />
      <path d={note} fill="#FE2C55" transform="translate(.7 .4)" />
      <path d={note} fill="currentColor" />
    </svg>
  );
}
