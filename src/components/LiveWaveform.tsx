import React, { useEffect, useRef, useState } from 'react';
import { Activity, Radio, Volume2 } from 'lucide-react';

interface LiveWaveformProps {
  isRecording: boolean;
  stream?: MediaStream | null;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({ isRecording, stream }) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(
    () => Array.from({ length: 24 }, () => 15)
  );
  const [decibels, setDecibels] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      // Idle state: gentle resting wave
      setAudioLevels(Array.from({ length: 24 }, (_, i) => Math.sin(i * 0.4) * 8 + 12));
      setDecibels(0);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // ignore
        }
        audioContextRef.current = null;
      }
      return;
    }

    let isAudioConnected = false;

    // Try to connect to real MediaStream if available
    if (stream && window.AudioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        isAudioConnected = true;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateRealAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 24 frequency bins
          const newLevels: number[] = [];
          let sum = 0;
          const count = 24;
          for (let i = 0; i < count; i++) {
            const index = Math.floor((i / count) * dataArray.length);
            const val = dataArray[index] || 0;
            // Map 0-255 to 10-85 height percentage
            const height = Math.max(12, Math.min(95, (val / 255) * 85 + 10));
            newLevels.push(height);
            sum += val;
          }

          const avg = sum / count;
          setDecibels(Math.round((avg / 255) * 100));
          setAudioLevels(newLevels);

          animationFrameRef.current = requestAnimationFrame(updateRealAudio);
        };

        animationFrameRef.current = requestAnimationFrame(updateRealAudio);
      } catch (err) {
        console.warn('Real AudioContext setup error, falling back to simulated live wave:', err);
      }
    }

    // Fallback if real stream is not passed (e.g. Web Speech API mode)
    if (!isAudioConnected) {
      let phase = 0;
      const simulateWave = () => {
        phase += 0.15;
        const newLevels = Array.from({ length: 24 }, (_, i) => {
          // Combination of primary sine wave, secondary harmonic, and dynamic speech jitter
          const primary = Math.sin(phase + i * 0.35) * 25 + 40;
          const secondary = Math.cos(phase * 1.5 + i * 0.5) * 15;
          const jitter = (Math.random() - 0.5) * 18;
          return Math.max(15, Math.min(92, primary + secondary + jitter));
        });

        const activeAvg = Math.round(
          newLevels.reduce((acc, curr) => acc + curr, 0) / newLevels.length
        );
        setDecibels(activeAvg);
        setAudioLevels(newLevels);

        animationFrameRef.current = requestAnimationFrame(simulateWave);
      };

      animationFrameRef.current = requestAnimationFrame(simulateWave);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // ignore
        }
        audioContextRef.current = null;
      }
    };
  }, [isRecording, stream]);

  return (
    <div className="w-full max-w-sm mx-auto my-2 p-3 rounded-2xl bg-gradient-to-b from-[#131b2c] to-[#0c101a] border border-amber-500/30 shadow-lg shadow-amber-500/5 relative overflow-hidden">
      {/* Background ambient glow when active */}
      {isRecording && (
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Header with Status Indicator */}
      <div className="flex items-center justify-between text-xs mb-2.5 relative z-10">
        <div className="flex items-center gap-1.5 font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording
                ? 'bg-rose-500 animate-ping'
                : 'bg-zinc-600'
            }`}
          />
          <span
            className={`${
              isRecording ? 'text-amber-300 font-extrabold' : 'text-zinc-400'
            } flex items-center gap-1 font-['Syne'] text-[11px] uppercase tracking-wider`}
          >
            <Activity className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
            Jonli To'lqin
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {isRecording ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1 animate-pulse">
              <Radio className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>AI Mikrofon Faol</span>
              {decibels > 0 && <span className="text-zinc-400">({decibels}%)</span>}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
              Kutilmoqda
            </span>
          )}
        </div>
      </div>

      {/* The Live Waveform Bars Visualizer */}
      <div className="h-14 flex items-center justify-between gap-1 px-1 bg-black/40 rounded-xl border border-white/5 relative z-10">
        {audioLevels.map((level, idx) => {
          // Dynamic color based on position and height
          const isHigh = level > 65;
          const isMid = level > 40;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-center h-full py-1"
            >
              <div
                className={`w-full max-w-[6px] rounded-full transition-all duration-75 ease-out shadow-sm ${
                  !isRecording
                    ? 'bg-zinc-700'
                    : isHigh
                    ? 'bg-gradient-to-t from-orange-500 via-amber-400 to-rose-400 shadow-rose-500/30'
                    : isMid
                    ? 'bg-gradient-to-t from-amber-600 to-amber-300 shadow-amber-500/20'
                    : 'bg-gradient-to-t from-zinc-600 to-amber-500/60'
                }`}
                style={{
                  height: `${isRecording ? level : 15}%`,
                  opacity: isRecording ? 0.9 + (level / 100) * 0.1 : 0.4,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Footer live hint */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 px-0.5">
        <span className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-amber-400/80" />
          <span>Ovozingiz real vaqtda tahlil qilinmoqda</span>
        </span>
        <span className="font-mono text-zinc-500">24 ch • 48 kHz</span>
      </div>
    </div>
  );
};
