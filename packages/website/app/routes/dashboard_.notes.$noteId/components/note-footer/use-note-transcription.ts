import { useEffect, useEffectEvent, useRef, useState } from "react";

import type {
  PendingTranscriptChunk,
  TranscriptChunk,
} from "~/api/notes";
import { useApi } from "~/context/api-context";
import {
  type AudioBarHeights,
  useAudioVisualizer,
} from "~/hooks/use-audio-visualizer";
import { DeepgramLiveTranscriptionClient } from "~/libs/transcription/deepgram-live-transcription";
import type {
  LiveTranscriptionSession,
  TranscriptionResult,
} from "~/libs/transcription/live-transcription";
import { PcmAudioCapture } from "~/libs/transcription/pcm-audio-capture";

const IDLE_BAR_HEIGHTS: AudioBarHeights = [10, 22, 16];
const ACTIVE_MIN_BAR_HEIGHTS: AudioBarHeights = [4, 7, 5];
const ACTIVE_MAX_BAR_HEIGHTS: AudioBarHeights = [21, 28, 24];
const TRANSCRIPT_SAVE_INTERVAL_MS = 5_000;

type UseNoteTranscriptionOptions = {
  initialTranscript: TranscriptChunk[];
  noteId: string;
};

export function useNoteTranscription({
  initialTranscript,
  noteId,
}: UseNoteTranscriptionOptions) {
  const api = useApi();
  const [transcript, setTranscript] = useState(initialTranscript);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const [isTabAudioShared, setIsTabAudioShared] = useState(false);
  const clientRef = useRef(new DeepgramLiveTranscriptionClient());
  const audioCaptureRef = useRef<PcmAudioCapture | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const pendingChunksRef = useRef<PendingTranscriptChunk[]>([]);
  const sessionRef = useRef<LiveTranscriptionSession | null>(null);
  const isSavingRef = useRef(false);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    if (!result.final) {
      setInterimTranscript(result.text);
      return;
    }

    const chunk = {
      id: crypto.randomUUID(),
      text: result.text,
      createdAt: new Date().toISOString(),
    };
    pendingChunksRef.current.push(chunk);
    setTranscript((currentTranscript) => [...currentTranscript, chunk]);
    setInterimTranscript("");
  };

  const handleTranscriptionError = (message: string) => {
    setTranscriptionError(message);
  };

  const flushTranscript = async () => {
    if (isSavingRef.current || pendingChunksRef.current.length === 0) {
      return;
    }

    const chunks = pendingChunksRef.current;
    pendingChunksRef.current = [];
    isSavingRef.current = true;

    try {
      await api.notes.appendTranscript(noteId, chunks);
    } catch {
      pendingChunksRef.current = [...chunks, ...pendingChunksRef.current];
      setTranscriptionError("The transcript could not be saved.");
    } finally {
      isSavingRef.current = false;
    }
  };

  const flushTranscriptFromEffect = useEffectEvent(async () => {
    await flushTranscript();
  });

  const startTranscription = async (stream: MediaStream) => {
    setTranscriptionError(null);
    const { accessToken } = await api.notes.createTranscriptionToken(noteId);
    const session = await clientRef.current.connect(accessToken, {
      onError: handleTranscriptionError,
      onResult: handleTranscriptionResult,
    });

    try {
      const audioCapture = await PcmAudioCapture.start(stream, (audio) => {
        session.sendAudio(audio);
      });

      sessionRef.current = session;
      audioCaptureRef.current = audioCapture;
    } catch (error) {
      await session.close();
      throw error;
    }
  };

  const stopTabAudio = () => {
    displayStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    displayStreamRef.current = null;
    setIsTabAudioShared(false);
  };

  const shareTabAudio = async () => {
    const audioCapture = audioCaptureRef.current;

    if (!audioCapture) {
      setTranscriptionError("Start recording before sharing tab audio.");
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });

      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach((track) => {
          track.stop();
        });
        throw new Error(
          "Select a browser tab and enable its Share tab audio option."
        );
      }

      stopTabAudio();
      audioCapture.addStream(displayStream);
      displayStreamRef.current = displayStream;
      setIsTabAudioShared(true);
      displayStream.getAudioTracks()[0].addEventListener(
        "ended",
        () => stopTabAudio(),
        { once: true }
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        return;
      }

      setTranscriptionError(
        error instanceof Error
          ? error.message
          : "Unable to share audio from this tab."
      );
    }
  };

  const pauseTranscription = async () => {
    const audioCapture = audioCaptureRef.current;
    const session = sessionRef.current;

    audioCaptureRef.current = null;
    sessionRef.current = null;

    stopTabAudio();
    await audioCapture?.close();
    await session?.close();
    await flushTranscript();
  };

  const audioVisualizer = useAudioVisualizer({
    idleBarHeights: IDLE_BAR_HEIGHTS,
    activeMinBarHeights: ACTIVE_MIN_BAR_HEIGHTS,
    activeMaxBarHeights: ACTIVE_MAX_BAR_HEIGHTS,
    onRecordingPause: pauseTranscription,
    onRecordingStart: startTranscription,
  });

  useEffect(
    function saveTranscriptPeriodically() {
      const intervalId = window.setInterval(
        () => void flushTranscriptFromEffect(),
        TRANSCRIPT_SAVE_INTERVAL_MS
      );

      return () => window.clearInterval(intervalId);
    },
    []
  );

  useEffect(function closeTranscriptionOnUnmount() {
    return () => {
      stopTabAudio();
      void audioCaptureRef.current?.close();
      void sessionRef.current?.close();
      void flushTranscriptFromEffect();
    };
  }, []);

  return {
    ...audioVisualizer,
    error: transcriptionError ?? audioVisualizer.error,
    interimTranscript,
    isTabAudioShared,
    shareTabAudio,
    transcript,
  };
}