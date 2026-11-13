"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mic, Square, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRecitationTask, reviewRecitation } from "@/app/actions/recitations";

export function ReviewForm({
  submissionId,
  initialRating,
  initialFeedback,
  initialAudioUrl = null,
}: {
  submissionId: string;
  initialRating: number | null;
  initialFeedback: string | null;
  initialAudioUrl?: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, startTransition] = useTransition();

  // Spoken feedback: record in the browser, upload on send.
  const [existingAudio, setExistingAudio] = useState<string | null>(initialAudioUrl);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    },
    []
  );
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  function setAudio(b: Blob | null) {
    setPreviewUrl(b ? URL.createObjectURL(b) : null);
    setBlob(b);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("This browser can't record audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) =>
        MediaRecorder.isTypeSupported(t)
      );
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudio(new Blob(chunksRef.current, { type: rec.mimeType || mimeType || "audio/webm" }));
      };
      rec.start();
      recorderRef.current = rec;
      secondsRef.current = 0;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= 300) stopRecording();
      }, 1000);
    } catch {
      toast.error("Allow microphone access for this site, then try again.");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
  }

  function save() {
    startTransition(async () => {
      try {
        let audio: { url: string; durationSec: number | null } | null | undefined;
        if (blob) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          if (!cloudName || !preset) {
            toast.error("Audio upload isn't set up yet.");
            return;
          }
          const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
          const body = new FormData();
          body.append("file", blob, `feedback.${ext}`);
          body.append("upload_preset", preset);
          const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body });
          const data = await up.json();
          if (!up.ok) throw new Error(data.error?.message || "Upload failed");
          audio = { url: data.secure_url, durationSec: secondsRef.current || Math.round(data.duration ?? 0) || null };
        } else if (!existingAudio && initialAudioUrl) {
          audio = null; // teacher removed the earlier voice note
        }
        const res = await reviewRecitation(submissionId, rating, feedback, audio);
        if (res.ok) {
          if (audio) setExistingAudio(audio.url);
          setAudio(null);
        }
        if (res.ok) toast.success("Feedback sent to the student.");
        else toast.error(res.error ?? "Could not save the feedback.");
      } catch {
        toast.error("Could not save the feedback.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} out of 5`}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              size={22}
              className={n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Feedback for the student (what was good, what to practise)"
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="space-y-2">
        {existingAudio && !blob && (
          <div className="flex items-center gap-2">
            <audio controls preload="none" src={existingAudio} className="h-9 flex-1" />
            <Button type="button" size="sm" variant="outline" onClick={() => setExistingAudio(null)} aria-label="Remove voice feedback">
              <X size={14} />
            </Button>
          </div>
        )}
        {blob && previewUrl && (
          <div className="flex items-center gap-2">
            <audio controls src={previewUrl} className="h-9 flex-1" />
            <Button type="button" size="sm" variant="outline" onClick={() => setAudio(null)} disabled={pending} aria-label="Discard voice note">
              <X size={14} />
            </Button>
          </div>
        )}
        {!blob &&
          (recording ? (
            <Button type="button" size="sm" variant="destructive" onClick={stopRecording}>
              <Square size={14} className="mr-1" /> Stop ({Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")})
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={startRecording}>
              <Mic size={14} className="mr-1" /> {existingAudio ? "Record a new voice reply" : "Reply with a voice note"}
            </Button>
          ))}
      </div>
      <Button size="sm" onClick={save} disabled={pending || recording || rating === 0}>
        {pending ? "Sending..." : initialRating ? "Update feedback" : "Send feedback"}
      </Button>
    </div>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this task and all recordings sent for it?")) return;
        startTransition(async () => {
          try {
            const res = await deleteRecitationTask(taskId);
            if (res.ok) toast.success("Task deleted.");
            else toast.error(res.error ?? "Could not delete the task.");
          } catch {
            toast.error("Could not delete the task.");
          }
        });
      }}
    >
      Delete task
    </Button>
  );
}
