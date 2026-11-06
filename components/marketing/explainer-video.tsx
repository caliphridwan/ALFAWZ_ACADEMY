"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const VIDEO_SRC = "/videos/how-it-works.mp4";
const POSTER_SRC = "/videos/how-it-works-poster.jpg";

/**
 * "How AlFawz Academy works" explainer. Shows a poster with a play button and only
 * loads the video file when someone presses play, so it never slows the page down
 * for visitors on slow mobile data. No autoplay, and no sound until the visitor starts it.
 */
export function ExplainerVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="container py-16 sm:py-20">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How it works</span>
        <h2 className="mt-3 text-2xl font-bold sm:text-4xl">See how AlFawz Academy works</h2>
        <p className="mt-3 text-muted-foreground">
          From choosing a course to your certificate, in under two minutes.
        </p>
      </div>

      <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border bg-black shadow-xl">
        {playing ? (
          <video
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="h-full w-full"
          >
            Your browser cannot play this video.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play the AlFawz Academy explainer video"
            className="group absolute inset-0 h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSTER_SRC} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition group-hover:scale-105">
              <Play className="ml-1 h-9 w-9" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
