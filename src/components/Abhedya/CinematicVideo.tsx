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
    <div className="film-grain" aria-hidden="true"/>
    <div className="film-caption"><span>0{chapter + 1} / MISSION PROLOGUE</span><strong key={chapter}>{chapters[chapter]}</strong><small>{['Beyond the ordinary. Into the unforgiving.', 'Every route carries a responsibility.', 'Readiness begins before the call.'][chapter]}</small></div>
    <div className="film-controls">
      <span className="film-time">00:{String(Math.floor(elapsed)).padStart(2, '0')}</span>
      <progress className="film-progress" value={elapsed} max={duration} aria-label="Opening film playback progress"/>
      <Button variant="ghost" size="icon" className="film-control" aria-label={playing ? 'Pause opening video' : 'Play opening video'} title={playing ? 'Pause opening video' : 'Play opening video'} disabled={unavailable} onClick={() => { if (playing) video.current?.pause(); else video.current?.play().catch(() => setPlaying(false)); }}>{playing ? <Pause/> : <Play/>}</Button>
      <Button variant="ghost" size="icon" className="film-control" aria-label={immersive ? 'Exit film view' : 'Enter film view'} title={immersive ? 'Exit film view' : 'Enter film view'} onClick={toggleFilm}>{immersive ? <Minimize2/> : <Maximize2/>}</Button>
    </div>
    {unavailable && <span className="film-error" role="status">Opening film unavailable. Showing the mountain poster.</span>}
  </>;
}