"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CAPS_LEN, DELIVERY_LEN, WHY_LEN, onGroupChange, scene, setGroupActive } from "@/lib/scene";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Fixed WebGL layer behind the page. Scroll triggers decide which act of the
 * scene is visible and feed it progress values; when an opaque section covers
 * the viewport the canvas stops rendering entirely.
 */
export function SceneCanvas() {
  const [group, setGroup] = useState(scene.group);

  useEffect(() => onGroupChange(setGroup), []);

  useGSAP(() => {
    const $ = (s: string) => document.querySelector<HTMLElement>(s);
    const hero = $("#top");
    const caps = $("#services");
    const delivery = $("#delivery");
    const why = $("#why");
    const cta = $("#next-steps");
    if (!hero || !caps || !delivery || !why || !cta) return;

    // Which act is on screen. Ranges are measured by ScrollTrigger (and kept
    // fresh on refresh); the active act is derived from the scroll position so
    // it is also correct at scroll 0 and after large jumps.
    const ranges = {
      A: ScrollTrigger.create({ trigger: hero, start: "top top", endTrigger: caps, end: "bottom top" }),
      B: ScrollTrigger.create({ trigger: delivery, start: "top bottom", endTrigger: why, end: "bottom top" }),
      C: ScrollTrigger.create({ trigger: cta, start: "top bottom", end: "bottom top" }),
    };
    const evaluate = () => {
      const y = window.scrollY;
      (Object.keys(ranges) as (keyof typeof ranges)[]).forEach((key) => {
        const r = ranges[key];
        setGroupActive(key, y >= r.start - 1 && y <= r.end + 1);
      });
    };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: evaluate, onRefresh: evaluate });
    evaluate();

    // Progress feeds
    const feed = (
      trigger: HTMLElement,
      start: string,
      end: string,
      write: (p: number) => void,
    ) =>
      ScrollTrigger.create({
        trigger,
        start,
        end,
        onUpdate: (s) => write(s.progress),
        onRefresh: (s) => write(s.progress),
      });

    feed(hero, "top top", "bottom top", (p) => (scene.a.hero = p));
    feed(caps, "top bottom", "bottom bottom", (p) => (scene.a.t = p * (CAPS_LEN + 1) - 1));
    feed(delivery, "top bottom", "bottom top", (p) => (scene.b.td = p * (DELIVERY_LEN + 2) - 1));
    feed(why, "top bottom", "bottom top", (p) => (scene.b.tw = p * (WHY_LEN + 2) - 1));
    feed(cta, "top bottom", "bottom top", (p) => (scene.c.p = p));
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ visibility: group ? "visible" : "hidden" }}
    >
      <WebGLBoundary
        fallback={<div className="absolute inset-0 bg-gradient-to-r from-ink via-brand to-light-grey" />}
      >
        <Scene active={group !== null} />
      </WebGLBoundary>
    </div>
  );
}
