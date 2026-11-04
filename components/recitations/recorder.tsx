"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mic, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitRecitation } from "@/app/dashboard/recitations/actions";

const MAX_SECONDS = 5 * 60;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) =>
    MediaRecorder.isTypeSupported(t)
  );
}

/** Record in the browser (or pick a file), upload straight to Cloudinary, then send it for review. */
export function Recorder({ taskId, resubmit }: { taskId: string; resubmit: boolean }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setAudio(b: Blob | null) {
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return b ? URL.createObjectURL(b) : null;
    });
    setBlob(b);
  }

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser can't record audio. Choose a recording from your phone instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudio(new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" }));
      };
      recorder.start();
      recorderRef.current = recorder;
      secondsRef.current = 0;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_SECONDS) stop();
      }, 1000);
    } catch {
      setError("We couldn't use your microphone. Allow microphone access for this site, then try again.");
    }
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is too large (20 MB maximum).");
      return;
    }
    setError(null);
    secondsRef.current = 0;
    setSeconds(0);
    setAudio(file);
  }

  function send() {
    if (!blob) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      setError("Audio upload isn't set up yet. Please tell your teacher.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const body = new FormData();
        const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
        body.append("file", blob, `recitation.${ext}`);
        body.append("upload_preset", preset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");

        const result = await submitRecitation(taskId, data.secure_url, secondsRef.current || data.duration || null, note);
        if (!result.ok) {
          setError(result.error ?? "Could not send your recitation.");
          return;
        }
        toast.success("Recitation sent to your teacher.");
        setAudio(null);
        setNote("");
        setSeconds(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      }
    });
  }

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!blob && (
        <div className="flex flex-wrap items-center gap-2">
          {recording ? (
            <Button type="button" variant="destructive" onClick={stop}>
              <Square size={16} className="mr-1" />
              Stop ({mm}:{ss})
            </Button>
          ) : (
            <Button type="button" onClick={start}>
              <Mic size={16} className="mr-1" />
              {resubmit ? "Record again" : "Record"}
            </Button>
          )}
          {!recording && (
            <>
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload size={16} className="mr-1" />
                Choose a recording
              </Button>
              <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={onFile} />
            </>
          )}
        </div>
      )}

      {blob && previewUrl && (
        <div className="space-y-3">
          <audio controls src={previewUrl} className="w-full" />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="A note for your teacher (optional)"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={send} disabled={pending}>
              {pending ? "Sending..." : "Send to my teacher"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setAudio(null)} disabled={pending}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
