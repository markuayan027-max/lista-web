import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/lista-academy-hero.mp4";
const POSTER_SRC = "/hero.png";

export default function HeroAcademyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadError) return;
    video.muted = true;
    setIsMuted(true);
    void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [loadError]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  }, []);

  if (loadError) {
    return (
      <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-100">
        <img src={POSTER_SRC} alt="LISTA Academy" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="group w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] bg-slate-900">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_SRC}
        aria-label="LISTA Academy campus and training preview"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setLoadError(true)}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
          "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full",
          "bg-white/95 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.18)]",
          "border border-white/80 backdrop-blur-[2px]",
          "transition-all duration-300 ease-out",
          "hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
          isPlaying && "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
        )}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} aria-hidden />
        ) : (
          <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" strokeWidth={2} aria-hidden />
        )}
      </button>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Turn sound on" : "Mute video"}
        className={cn(
          "absolute bottom-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full",
          "bg-slate-900/35 text-white/90 backdrop-blur-md",
          "border border-white/15",
          "opacity-70 group-hover:opacity-100 transition-opacity duration-300",
          "hover:bg-slate-900/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        )}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" strokeWidth={2} aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
