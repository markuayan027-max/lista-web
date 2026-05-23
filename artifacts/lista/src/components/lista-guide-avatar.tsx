import { cn } from "@/lib/utils";
import { withBase } from "@/lib/with-base";

const CHATBOT_LOGO_SRC = withBase("/chatbot-logo.png");

const SIZE_CLASS = {
  sm: "h-10 w-10",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const;

type ListaGuideAvatarProps = {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  alt?: string;
};

/** Chatbot portrait — natural aspect ratio inside round frame (no over-crop). */
export default function ListaGuideAvatar({
  size = "md",
  className,
  alt = "",
}: ListaGuideAvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-white",
        SIZE_CLASS[size],
        className,
      )}
    >
      <img
        src={CHATBOT_LOGO_SRC}
        alt={alt}
        aria-hidden={!alt}
        width={112}
        height={112}
        decoding="async"
        className="h-full w-full object-contain object-center"
      />
    </div>
  );
}
