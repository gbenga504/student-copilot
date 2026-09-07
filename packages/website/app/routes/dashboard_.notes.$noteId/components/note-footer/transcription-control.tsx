import classNames from "classnames";
import { ChevronUp, Minus, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/button/button";

// Idle keeps the Granola-like silhouette; active minimums make silence visibly quiet.
const IDLE_BAR_HEIGHTS = [10, 22, 16];
const ACTIVE_MIN_BAR_HEIGHTS = [4, 7, 5];
const ACTIVE_MAX_BAR_HEIGHTS = [21, 28, 24];
// Each bar listens to a different part of the speech-frequency range.
const FREQUENCY_BANDS = [
  [1, 5],
  [5, 12],
  [12, 28],
] as const;

interface TranscriptionButtonProps {
  open: boolean;
  onToggle: () => void;
}

export const TranscriptionControl = ({
  open,
  onToggle,
}: TranscriptionButtonProps) => {
  const [barHeights, setBarHeights] = useState(IDLE_BAR_HEIGHTS);
  const [recordingState, setRecordingState] = useState<
    "idle" | "starting" | "recording" | "paused"
  >("idle");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const smoothedBarHeightsRef = useRef([...ACTIVE_MIN_BAR_HEIGHTS]);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const stopVisualizer = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setBarHeights(IDLE_BAR_HEIGHTS);
  };

  const updateVisualizer = () => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

    const frequencies = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencies);

    // Independent frequency averages stop all three bars from moving in unison.
    const nextBarHeights = FREQUENCY_BANDS.map(([start, end], index) => {
      let bandTotal = 0;

      for (let frequencyIndex = start; frequencyIndex < end; frequencyIndex++) {
        bandTotal += frequencies[frequencyIndex];
      }

      const average = bandTotal / (end - start) / 255;
      const volume = Math.min(1, Math.max(0, (average - 0.06) * 2.4));
      const minimumHeight = ACTIVE_MIN_BAR_HEIGHTS[index];
      const targetHeight =
        minimumHeight +
        volume * (ACTIVE_MAX_BAR_HEIGHTS[index] - minimumHeight);
      const previousHeight = smoothedBarHeightsRef.current[index];
      // Rise quickly on speech, then fall slowly for fluid motion instead of jitter.
      const smoothing = targetHeight > previousHeight ? 0.45 : 0.18;

      return previousHeight + (targetHeight - previousHeight) * smoothing;
    });

    smoothedBarHeightsRef.current = nextBarHeights;
    setBarHeights(nextBarHeights.map(Math.round));
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    setRecordingError(null);

    if (recordingState === "paused") {
      mediaRecorderRef.current?.resume();
      await audioContextRef.current?.resume();
      smoothedBarHeightsRef.current = [...ACTIVE_MIN_BAR_HEIGHTS];
      setBarHeights(ACTIVE_MIN_BAR_HEIGHTS);
      setRecordingState("recording");
      updateVisualizer();
      return;
    }

    setRecordingState("starting");

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
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
      const mediaRecorder = new MediaRecorder(stream);

      // MediaRecorder captures audio; the analyser reads it without playing it back.
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      mediaRecorder.start(1_000);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      smoothedBarHeightsRef.current = [...ACTIVE_MIN_BAR_HEIGHTS];
      setBarHeights(ACTIVE_MIN_BAR_HEIGHTS);
      setRecordingState("recording");
      updateVisualizer();
    } catch (error) {
      setRecordingState("idle");
      setRecordingError(
        error instanceof Error
          ? error.message
          : "Unable to access the microphone.",
      );
    }
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    void audioContextRef.current?.suspend();
    setRecordingState("paused");
    stopVisualizer();
  };

  const handleRecordingToggle = () => {
    if (recordingState === "recording") {
      pauseRecording();
      return;
    }

    void startRecording();
  };

  useEffect(function releaseMicrophoneOnUnmount() {
    mountedRef.current = true;

    return () => {
      // Releasing every browser audio resource also turns off the microphone indicator.
      mountedRef.current = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      void audioContextRef.current?.close();
    };
  }, []);

  const renderAudioBars = () => {
    return (
      <span
        className="flex h-7 w-4 items-center justify-between"
        aria-hidden="true"
      >
        {barHeights.map((height, index) => (
          <span
            className="w-[3px] rounded-full bg-current transition-[height] duration-75"
            key={index}
            style={{ height }}
          />
        ))}
      </span>
    );
  };

  const renderHeader = () => {
    return (
      <div className="p-1 flex justify-end">
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          shape="circle"
          aria-label="Minimize transcription control"
          className="hover:bg-app-gray-150"
          onClick={onToggle}
        >
          <Minus size={16} />
        </Button>
      </div>
    );
  };

  const renderTranscribedMessagesPanel = () => {
    return (
      <div className="p-2 max-h-120 min-h-15 border-y border-y-app-gray-150">
        <p className="text-xs text-center">
          Always get consent when transcribing others.
        </p>
      </div>
    );
  };

  return (
    <div
      className={classNames(
        "flex flex-col border border-app-gray-150 bg-app-gray-200 h-full p-1",
        {
          "w-full rounded-4xl": open,
          "rounded-full": !open,
        },
      )}
    >
      {open && renderHeader()}
      {open && renderTranscribedMessagesPanel()}

      <div
        className={classNames("flex items-center h-full min-h-15", {
          "pt-1": open,
        })}
      >
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          size="small"
          className="gap-1 hover:bg-app-gray-150 rounded-l-full h-full"
          onClick={onToggle}
        >
          {renderAudioBars()}
          <ChevronUp
            size={16}
            className={classNames("transition-transform duration-300", {
              "-rotate-180": open,
            })}
          />
        </Button>

        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="primary"
          size="small"
          className="hover:bg-app-gray-150 rounded-r-full h-full font-medium"
          loading={recordingState === "starting"}
          loadingText="Starting"
          aria-label={
            recordingState === "recording" ? "Pause recording" : undefined
          }
          aria-pressed={recordingState === "recording"}
          onClick={handleRecordingToggle}
        >
          {recordingState === "recording" ? (
            <Square size={12} fill="currentColor" aria-hidden="true" />
          ) : (
            "Resume"
          )}
        </Button>
        {recordingError && (
          <span className="sr-only" role="status">
            {recordingError}
          </span>
        )}
      </div>
    </div>
  );
};
