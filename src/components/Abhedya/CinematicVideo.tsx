import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import opening from '@/assets/Abhedya-opening.mp4.asset.json';
import compatibleOpening from '@/assets/Abhedya-opening.webm.asset.json';
import mountain from '@/assets/Abhedya-landscape.jpg';

export function CinematicVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(12);
  const [unavailable, setUnavailable] = useState(false);
  const chapters = ['THE TERRAIN', 'THE SUPPLY LINE', 'THE MISSION'];
  const chapter = Math.min(2, Math.floor((elapsed / duration) * 3));
  const toggleFilm = () => {
    const next = !immersive;
    video.current?.closest('.hero')?.classList.toggle('film-view', next);
    setImmersive(next);
  };
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (media.matches) video.current?.pause();
      else video.current?.play().catch(() => setPlaying(false));
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        video.current?.closest('.hero')?.classList.remove('film-view');
        setImmersive(false);
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return <>
    <video ref={video} className="hero-image hero-video" poster={mountain} muted loop playsInline preload="metadata" onLoadedMetadata={() => { if (video.current?.duration) setDuration(video.current.duration); }} onTimeUpdate={() => setElapsed(video.current?.currentTime ?? 0)} onError={() => setUnavailable(true)} onPlay={() => { setPlaying(true); setUnavailable(false); }} onPause={() => setPlaying(false)} aria-label="Cinematic mountain supply corridor opening"><source src={compatibleOpening.url} type="video/webm"/><source src={opening.url} type="video/mp4"/></video>
    
   </>;
}