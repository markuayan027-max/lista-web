import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/lista-academy-hero.mp4";
const POSTER_SRC = "/hero.png";
/** Pause when less than this fraction of the player is visible (user scrolled away). */
const VISIBILITY_THRESHOLD = 0.2;

export default function HeroAcademyVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const userMutedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const applyMute = useCallback((muted: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    setIsMuted(muted);
  }, []);

  /** Try sound first; if the browser blocks unmuted autoplay, fall back to muted. */
  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || hasCompletedRef.current || userPausedRef.current) return;

    const wantSound = !userMutedRef.current;

    if (wantSound) {
      applyMute(false);
      try {
        await video.play();
        setIsPlaying(true);
        return;
      } catch {
        /* autoplay with sound blocked — retry muted */
      }
    }

    applyMute(true);
    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [applyMute]);

  const pausePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;
    video.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || loadError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD;
        if (!visible) {
          pausePlayback();
          return;
        }

        if (hasCompletedRef.current) {
          return;
        }

        if (!userPausedRef.current) {
          void startPlayback();
        }
      },
      { threshold: [0, VISIBILITY_THRESHOLD, 0.5, 1] },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [loadError, pausePlayback, startPlayback]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) video.pause();
    hasCompletedRef.current = true;
    userPausedRef.current = true;
    setHasEnded(true);
    setIsPlaying(false);
  }, []);

  const replay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    hasCompletedRef.current = false;
    userPausedRef.current = false;
    setHasEnded(false);
    video.currentTime = 0;

    const wantSound = !userMutedRef.current;
    applyMute(!wantSound);

    void video
      .play()
      .then(() => {
        setIsPlaying(true);
        if (wantSound && video.muted) {
          applyMute(false);
          void video.play().catch(() => applyMute(true));
        }
      })
      .catch(() => setIsPlaying(false));
  }, [applyMute]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hasEnded || hasCompletedRef.current || video.ended) {
      replay();
      return;
    }

    if (video.paused) {
      userPausedRef.current = false;
      applyMute(userMutedRef.current);
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    userPausedRef.current = true;
    video.pause();
    setIsPlaying(false);
  }, [applyMute, hasEnded, replay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    userMutedRef.current = next;
    applyMute(next);
  }, [applyMute]);

  if (loadError) {
    return (
      <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-100">
        <img src={POSTER_SRC} alt="LISTA Academy" className="w-full h-full object-cover" />
      </div>
    );
  }

  const showReplay = hasEnded;
  const hidePlayPauseWhilePlaying = isPlaying && !showReplay;

  return (
    <div
      ref={containerRef}
      className="group w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] bg-slate-900"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        poster={POSTER_SRC}
        aria-label="LISTA Academy campus and training preview"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={() => setLoadError(true)}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {showReplay ? (
        <button
          type="button"
          onClick={replay}
          aria-label="Replay video"
          className={cn(
            "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
            "flex flex-col items-center gap-2 rounded-2xl bg-white/95 px-6 py-4 sm:px-8 sm:py-5",
            "text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.2)] border border-white/80",
            "transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
            <RotateCcw className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm font-bold tracking-wide">Replay</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className={cn(
            "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
            "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full",
            "bg-white/95 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.18)]",
            "border border-white/80 backdrop-blur-[2px]",
            "transition-all duration-300 ease-out",
            "hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
            hidePlayPauseWhilePlaying &&
              "pointer-events-none opacity-0 scale-95 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100",
          )}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} aria-hidden />
          ) : (
            <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" strokeWidth={2} aria-hidden />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Turn sound on" : "Mute video"}
        className={cn(
          "absolute bottom-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full",
          "bg-slate-900/35 text-white/90 backdrop-blur-md border border-white/15",
          "opacity-80 hover:opacity-100 transition-opacity",
          "hover:bg-slate-900/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          isMuted && !showReplay && "ring-2 ring-white/30 animate-pulse",
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
