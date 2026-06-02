import { cn } from "@/lib/utils";

/** Minimal line-art robot mark for LISTA Guide. */
export default function ListaGuideBotIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("h-5 w-5", className)}
      {...props}
    >
      <path
        d="M12 3v1.5M8.5 4.5h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="7"
        width="14"
        height="13"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9.25" cy="12" r="1.1" fill="currentColor" />
      <circle cx="14.75" cy="12" r="1.1" fill="currentColor" />
      <path
        d="M9.5 15.25h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.5 11.5H5M19 11.5h1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
