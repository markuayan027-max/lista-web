import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
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

  const stopAndRestart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
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
    <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-900">
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

      <div
        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/70 to-transparent pointer-events-none"
        aria-hidden
      />

      <div
        className="absolute bottom-3 right-3 flex items-center gap-2"
        role="toolbar"
        aria-label="Video controls"
      >
        <VideoControlButton
          onClick={togglePlay}
          label={isPlaying ? "Pause video" : "Play video"}
          pressed={isPlaying}
        >
          {isPlaying ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5 ml-0.5" aria-hidden />}
        </VideoControlButton>
        <VideoControlButton onClick={stopAndRestart} label="Stop and restart video">
          <RotateCcw className="h-5 w-5" aria-hidden />
        </VideoControlButton>
        <VideoControlButton
          onClick={toggleMute}
          label={isMuted ? "Turn sound on" : "Mute video"}
          pressed={!isMuted}
        >
          {isMuted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </VideoControlButton>
      </div>
    </div>
  );
}

function VideoControlButton({
  onClick,
  label,
  children,
  pressed,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full",
        "bg-slate-900/80 text-white border border-white/25 backdrop-blur-sm",
        "hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "transition-colors touch-target",
        pressed && "bg-blue-600/90 border-blue-400/40",
      )}
    >
      {children}
    </button>
  );
}
