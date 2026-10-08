import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import opening from '@/assets/nexus-opening.mp4.asset.json';
import compatibleOpening from '@/assets/nexus-opening.webm.asset.json';
import mountain from '@/assets/nexus-landscape.jpg';

export function CinematicVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
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
  return <>
    <video ref={video} className="hero-image hero-video" poster={mountain} muted loop playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-label="Cinematic mountain supply corridor opening"><source src={compatibleOpening.url} type="video/webm"/><source src={opening.url} type="video/mp4"/></video>
    <Button variant="outline" size="icon" className="video-control" aria-label={playing ? 'Pause opening video' : 'Play opening video'} title={playing ? 'Pause opening video' : 'Play opening video'} onClick={() => { if (playing) video.current?.pause(); else video.current?.play().catch(() => setPlaying(false)); }}>{playing ? <Pause/> : <Play/>}</Button>
  </>;
}