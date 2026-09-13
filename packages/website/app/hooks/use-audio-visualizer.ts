import { useEffect, useRef, useState } from "react";

export type AudioBarHeights = [number, number, number];

type AudioVisualizerState = "idle" | "starting" | "recording" | "paused";

interface UseAudioVisualizerOptions {
  idleBarHeights: AudioBarHeights;
  activeMinBarHeights: AudioBarHeights;
  activeMaxBarHeights: AudioBarHeights;
}

const FREQUENCY_BANDS = [
  [1, 5],
  [5, 12],
  [12, 28],
] as const;

export const useAudioVisualizer = ({
  idleBarHeights,
  activeMinBarHeights,
  activeMaxBarHeights,
}: UseAudioVisualizerOptions) => {
  const [barHeights, setBarHeights] = useState(idleBarHeights);
  const [state, setState] = useState<AudioVisualizerState>("idle");
  const [error, setError] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const smoothedBarHeightsRef = useRef<AudioBarHeights>([
    ...activeMinBarHeights,
  ]);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const stopVisualizer = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setBarHeights(idleBarHeights);
  };

  const updateVisualizer = () => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

    const frequencies = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencies);

    const nextBarHeights = FREQUENCY_BANDS.map(([start, end], index) => {
      let bandTotal = 0;

      for (let frequencyIndex = start; frequencyIndex < end; frequencyIndex++) {
        bandTotal += frequencies[frequencyIndex];
      }

      const average = bandTotal / (end - start) / 255;
      const volume = Math.min(1, Math.max(0, (average - 0.06) * 2.4));
      const minimumHeight = activeMinBarHeights[index];
      const targetHeight =
        minimumHeight + volume * (activeMaxBarHeights[index] - minimumHeight);
      const previousHeight = smoothedBarHeightsRef.current[index];
      const smoothing = targetHeight > previousHeight ? 0.45 : 0.18;

      return previousHeight + (targetHeight - previousHeight) * smoothing;
    }) as AudioBarHeights;

    smoothedBarHeightsRef.current = nextBarHeights;
    setBarHeights(nextBarHeights.map(Math.round) as AudioBarHeights);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    setError(null);

    if (state === "paused") {
      await audioContextRef.current?.resume();
      smoothedBarHeightsRef.current = [...activeMinBarHeights];
      setBarHeights(activeMinBarHeights);
      setState("recording");
      updateVisualizer();
      return;
    }

    setState("starting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;
      streamRef.current = stream;
      smoothedBarHeightsRef.current = [...activeMinBarHeights];
      setBarHeights(activeMinBarHeights);
      setState("recording");
      updateVisualizer();
    } catch (audioError) {
      setState("idle");
      setError(
        audioError instanceof Error
          ? audioError.message
          : "Unable to access the microphone."
      );
    }
  };

  const pauseRecording = () => {
    audioContextRef.current?.suspend();
    setState("paused");
    stopVisualizer();
  };

  const toggleRecording = () => {
    if (state === "recording") {
      pauseRecording();
      return;
    }

    startRecording();
  };

  useEffect(function releaseAudioResourcesOnUnmount() {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      audioContextRef.current?.close();
    };
  }, []);

  return { barHeights, error, startRecording, state, toggleRecording };
};
