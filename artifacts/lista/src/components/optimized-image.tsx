import {
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { withBase } from "@/lib/with-base";
import { cn } from "@/lib/utils";
import {
  buildSrcSet,
  defaultSizesForEntry,
  getManifestEntry,
  toOptimizedPath,
} from "@/lib/image-assets";
import { Skeleton } from "@/components/ui/skeleton";

export type OptimizedImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes" | "width" | "height"
> & {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: CSSProperties["objectFit"];
  imgClassName?: string;
};

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
  imgClassName,
  aspectRatio,
  objectFit = "cover",
  width: widthProp,
  height: heightProp,
  style,
  onError: onErrorProp,
  onLoad: onLoadProp,
  ...rest
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    onLoadProp?.(e);
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
    onErrorProp?.(e);
  };
  const entry = getManifestEntry(src);
  const isRemote = /^https?:\/\//i.test(src);
  const imgClasses = imgClassName ?? className;

  const intrinsicW = widthProp ?? entry?.width;
  const intrinsicH = heightProp ?? entry?.height;
  const resolvedSizes = sizes ?? (entry ? defaultSizesForEntry(entry) : undefined);

  const wrapperStyle: CSSProperties | undefined =
    aspectRatio || (intrinsicW && intrinsicH)
      ? {
          aspectRatio: aspectRatio ?? `${intrinsicW} / ${intrinsicH}`,
        }
      : undefined;

  const wrap = (node: ReactNode) =>
    wrapperStyle || className ? (
      <MotionSafeWrapper className={className} style={wrapperStyle}>
        {node}
      </MotionSafeWrapper>
    ) : (
      node
    );

  if (failed || !src) {
    return wrap(<Skeleton className={cn("bg-slate-100", imgClasses)} aria-hidden={!alt} />);
  }

  const sharedImgProps = {
    alt,
    className: imgClasses || undefined,
    style: { objectFit, ...style } as CSSProperties,
    width: intrinsicW,
    height: intrinsicH,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    decoding: (priority ? "sync" : "async") as "sync" | "async",
    fetchPriority: (priority ? "high" : "auto") as "high" | "auto",
  };

  if (isRemote || !entry) {
    const href = isRemote ? src : withBase(toOptimizedPath(src));
    return wrap(
      <div className="relative w-full h-full">
        {!loaded && !priority ? (
          <Skeleton className={cn("absolute inset-0", imgClasses)} aria-hidden />
        ) : null}
        <img
          src={href}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            imgClasses,
            !loaded && !priority && "opacity-0",
            loaded && "opacity-100 content-fade-in",
          )}
          style={{ objectFit, ...style } as CSSProperties}
          width={intrinsicW}
          height={intrinsicH}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "async" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          alt={alt}
          {...rest}
        />
      </div>,
    );
  }

  const fallbackSrc = withBase(entry.fallbackSrc);
  const defaultWebp = withBase(entry.defaultSrc);

  return wrap(
    <div className="relative w-full h-full">
      {!loaded && !priority ? (
        <Skeleton
          className={cn("absolute inset-0 rounded-none", imgClasses)}
          aria-hidden
        />
      ) : null}
      <picture className={cn(!loaded && !priority && "opacity-0", loaded && "opacity-100 content-fade-in")}>
        <source
          type="image/webp"
          srcSet={buildSrcSet(entry.variants, "webp")}
          sizes={resolvedSizes}
        />
        <img
          src={fallbackSrc}
          sizes={resolvedSizes}
          onLoad={handleLoad}
          onError={(e) => {
            const img = e.currentTarget;
            const triedWebp = img.dataset.fallbackWebp === "1";
            if (!triedWebp) {
              img.dataset.fallbackWebp = "1";
              img.removeAttribute("srcset");
              img.src = defaultWebp;
              return;
            }
            setFailed(true);
            onErrorProp?.(e);
          }}
          {...sharedImgProps}
          width={intrinsicW ?? entry.width}
          height={intrinsicH ?? entry.height}
          {...rest}
        />
      </picture>
    </div>,
  );
}

function MotionSafeWrapper({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`.trim()} style={style}>
      {children}
    </div>
  );
}
