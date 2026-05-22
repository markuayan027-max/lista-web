import { useCallback, useRef, useState, type ReactNode } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/lista-academy-hero.mp4";

export default function HeroAcademyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-900 group">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        aria-label="LISTA Academy campus and training preview"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div
        className="absolute bottom-3 right-3 flex items-center gap-2 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity"
        role="group"
        aria-label="Video controls"
      >
        <VideoControlButton
          onClick={togglePlay}
          label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5 ml-0.5" aria-hidden />}
        </VideoControlButton>
        <VideoControlButton
          onClick={toggleMute}
          label={isMuted ? "Turn sound on" : "Mute video"}
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
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full",
        "bg-slate-900/75 text-white border border-white/20 backdrop-blur-sm",
        "hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "transition-colors touch-target",
      )}
    >
      {children}
    </button>
  );
}
