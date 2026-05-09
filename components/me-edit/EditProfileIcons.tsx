import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconBase({
  children,
  className,
  viewBox = "0 0 24 24",
}: IconProps & {
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M14.5 6L8.5 12L14.5 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconBase>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M7.5 8.5L9 6.8C9.3 6.47 9.72 6.28 10.16 6.28H13.84C14.28 6.28 14.7 6.47 15 6.8L16.5 8.5H18C19.1 8.5 20 9.4 20 10.5V16.5C20 17.6 19.1 18.5 18 18.5H6C4.9 18.5 4 17.6 4 16.5V10.5C4 9.4 4.9 8.5 6 8.5H7.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M12 12C13.66 12 15 10.66 15 9C15 7.34 13.66 6 12 6C10.34 6 9 7.34 9 9C9 10.66 10.34 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.75 18C6.75 15.93 9.1 14.25 12 14.25C14.9 14.25 17.25 15.93 17.25 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </IconBase>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M8.2 5.8C8.58 5.42 9.16 5.29 9.66 5.47L11.68 6.21C12.22 6.41 12.6 6.9 12.64 7.47L12.74 9.13C12.77 9.53 12.62 9.92 12.33 10.2L11.22 11.31C12.01 12.74 13.26 13.99 14.69 14.78L15.8 13.67C16.08 13.38 16.47 13.23 16.87 13.26L18.53 13.36C19.1 13.4 19.59 13.78 19.79 14.32L20.53 16.34C20.71 16.84 20.58 17.42 20.2 17.8L18.97 19.03C18.15 19.85 16.95 20.18 15.82 19.9C9.86 18.42 5.58 14.14 4.1 8.18C3.82 7.05 4.15 5.85 4.97 5.03L6.2 3.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </IconBase>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="6.5" y="11" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 11V8.75C9 7.23 10.23 6 11.75 6H12.25C13.77 6 15 7.23 15 8.75V11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </IconBase>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M9.5 6L15.5 12L9.5 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconBase>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M8 8L16 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M16 8L8 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </IconBase>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M7 12.5L10.2 15.7L17 8.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </IconBase>
  );
}
