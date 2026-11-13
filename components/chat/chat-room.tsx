"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mic, Send, Square, Trash2, VolumeX, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { deleteChatMessage, pollChat, sendChatMessage, setChatMuted } from "@/app/chat/actions";
import type { ChatMessageDTO, ChatSnapshot } from "@/lib/chat";

const POLL_MS = 5000;
const MAX_VOICE_SECONDS = 180;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) =>
    MediaRecorder.isTypeSupported(t)
  );
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDur(s: number | null) {
  if (!s) return "";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function ChatRoom({
  courseId,
  meId,
  canModerate,
  initial,
}: {
  courseId: string;
  meId: string;
  canModerate: boolean;
  initial: ChatSnapshot;
}) {
  const [snap, setSnap] = useState<ChatSnapshot>(initial);
  const [text, setText] = useState("");
  const [sending, startSend] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const lastIdRef = useRef<string | null>(initial.messages.at(-1)?.id ?? null);

  // Voice note state
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const next = await pollChat(courseId);
      if (next) setSnap(next);
    } catch {
      /* offline or signed out: keep what we have, try again next tick */
    }
  }, [courseId]);

  // Opening the chat counts as reading it.
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  // Keep the view at the newest message unless the reader has scrolled up.
  useEffect(() => {
    const newest = snap.messages.at(-1)?.id ?? null;
    if (newest !== lastIdRef.current || lastIdRef.current === null) {
      lastIdRef.current = newest;
      if (stickRef.current) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [snap.messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  useEffect(() => {
    return () => {
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    };
  }, [voiceUrl]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function setVoiceBlob(b: Blob | null) {
    setVoiceUrl(b ? URL.createObjectURL(b) : null);
    setVoice(b);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("This browser can't record audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setVoiceBlob(new Blob(chunksRef.current, { type: rec.mimeType || mimeType || "audio/webm" }));
      };
      rec.start();
      recorderRef.current = rec;
      secondsRef.current = 0;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_VOICE_SECONDS) stopRecording();
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

  function send() {
    if (sending) return;
    const message = text.trim();
    if (!message && !voice) return;
    startSend(async () => {
      try {
        let attach: { url: string; durationSec: number | null } | undefined;
        if (voice) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          if (!cloudName || !preset) {
            toast.error("Voice upload isn't set up yet.");
            return;
          }
          const ext = voice.type.includes("mp4") ? "m4a" : voice.type.includes("ogg") ? "ogg" : "webm";
          const body = new FormData();
          body.append("file", voice, `chat-voice.${ext}`);
          body.append("upload_preset", preset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "Upload failed");
          attach = { url: data.secure_url, durationSec: secondsRef.current || Math.round(data.duration ?? 0) || null };
        }
        const result = await sendChatMessage(courseId, message, attach);
        if (!result.ok) {
          toast.error(result.error ?? "Could not send.");
          return;
        }
        setText("");
        setVoiceBlob(null);
        stickRef.current = true;
        await refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not send.");
      }
    });
  }

  async function remove(id: string) {
    const r = await deleteChatMessage(id);
    if (!r.ok) toast.error(r.error ?? "Could not delete.");
    else {
      setSnap((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) }));
    }
  }

  async function toggleMute(userId: string, mute: boolean) {
    const r = await setChatMuted(courseId, userId, mute);
    if (!r.ok) toast.error(r.error ?? "Could not update.");
    else {
      toast.success(mute ? "Muted. They can read but not post." : "They can post again.");
      refresh();
    }
  }

  const mutedSet = new Set(snap.mutedIds);
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {snap.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet. Say salaam and start the conversation.
          </p>
        )}
        {snap.messages.map((m: ChatMessageDTO) => {
          const mine = m.senderId === meId;
          const staff = m.senderRole !== "STUDENT";
          const canDelete = mine || canModerate;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%]",
                  mine ? "bg-brand text-brand-foreground" : "bg-muted"
                )}
              >
                <div className="mb-0.5 flex flex-wrap items-center gap-x-2 text-xs opacity-80">
                  <span className="font-semibold">{mine ? "You" : m.senderName}</span>
                  {staff && !mine && (
                    <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-medium text-gold">Staff</span>
                  )}
                  <span>{timeLabel(m.createdAt)}</span>
                </div>
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                {m.audioUrl && (
                  <div className="mt-1">
                    <audio controls preload="none" src={m.audioUrl} className="h-9 w-full min-w-[200px]" />
                    {m.durationSec ? <span className="text-[11px] opacity-70">{fmtDur(m.durationSec)}</span> : null}
                  </div>
                )}
                {(canDelete || (canModerate && !mine && !staff)) && (
                  <div className="mt-1 flex gap-3 text-[11px] opacity-70">
                    {canDelete && (
                      <button type="button" onClick={() => remove(m.id)} className="inline-flex items-center gap-1 hover:opacity-100">
                        <Trash2 size={11} /> Delete
                      </button>
                    )}
                    {canModerate && !mine && !staff && (
                      <button
                        type="button"
                        onClick={() => toggleMute(m.senderId, !mutedSet.has(m.senderId))}
                        className="inline-flex items-center gap-1 hover:opacity-100"
                      >
                        {mutedSet.has(m.senderId) ? <Volume2 size={11} /> : <VolumeX size={11} />}
                        {mutedSet.has(m.senderId) ? "Unmute" : "Mute"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-3">
        {snap.mutedMe ? (
          <p className="text-center text-sm text-muted-foreground">
            You can read this chat, but posting has been turned off for you by your teacher.
          </p>
        ) : (
          <div className="space-y-2">
            {voice && voiceUrl && (
              <div className="flex items-center gap-2">
                <audio controls src={voiceUrl} className="h-9 flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={() => setVoiceBlob(null)} disabled={sending} aria-label="Discard voice note">
                  <X size={14} />
                </Button>
              </div>
            )}
            <div className="flex items-end gap-2">
              {recording ? (
                <Button type="button" variant="destructive" onClick={stopRecording}>
                  <Square size={16} className="mr-1" /> {mm}:{ss}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={startRecording} disabled={sending || !!voice} aria-label="Record a voice note">
                  <Mic size={16} />
                </Button>
              )}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                maxLength={1000}
                rows={1}
                placeholder="Write a message…"
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="button" onClick={send} disabled={sending || recording || (!text.trim() && !voice)} aria-label="Send">
                <Send size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
