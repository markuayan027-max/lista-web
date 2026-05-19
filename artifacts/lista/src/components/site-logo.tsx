import OptimizedImage from "@/components/optimized-image";

type SiteLogoProps = {
  className?: string;
  alt?: string;
  priority?: boolean;
};

/** LISTA brand mark — WebP with responsive variants from image manifest. */
export default function SiteLogo({
  className = "h-12 w-auto object-contain",
  alt = "LISTA Logo",
  priority = false,
}: SiteLogoProps) {
  return (
    <OptimizedImage
      src="/logo.webp"
      alt={alt}
      priority={priority}
      imgClassName={className}
      objectFit="contain"
    />
  );
}
