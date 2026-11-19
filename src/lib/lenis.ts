import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/**
 * Some anchors live inside long scroll-driven (sticky) sections, so they have
 * no element to scroll to. Sections register a resolver that returns the
 * scroll position for those ids instead.
 */
type Resolver = () => number | null;
const resolvers = new Map<string, Resolver>();

export function registerAnchor(id: string, resolver: Resolver) {
  resolvers.set(id, resolver);
  return () => {
    if (resolvers.get(id) === resolver) resolvers.delete(id);
  };
}

export function scrollToHash(hash: string, opts: { immediate?: boolean } = {}) {
  if (!hash || hash === "#") return false;
  const custom = resolvers.get(hash)?.();
  const lenis = getLenis();
  let target: number | null = null;

  if (typeof custom === "number") {
    target = custom;
  } else {
    let el: Element | null = null;
    try {
      el = document.querySelector(hash);
    } catch {
      el = null;
    }
    if (!el) return false;
    target = el.getBoundingClientRect().top + window.scrollY;
  }

  window.dispatchEvent(new CustomEvent("moogle:navigate", { detail: hash }));

  if (lenis) {
    const distance = Math.abs(target - window.scrollY);
    lenis.scrollTo(target, {
      immediate: opts.immediate,
      duration: Math.min(2.6, 1 + distance / 9000),
      force: true,
    });
  } else {
    window.scrollTo({ top: target, behavior: opts.immediate ? "auto" : "smooth" });
  }
  return true;
}
