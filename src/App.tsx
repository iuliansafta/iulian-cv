import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType } from "react";
import { Switcher, VARIANTS, type VariantKey } from "./shared/Switcher";

// Globbed so a variant that is still being built doesn't break the others.
const modules = import.meta.glob<{ default: ComponentType }>([
  "./variants/terminal/Terminal.tsx",
  "./variants/orbital/Orbital.tsx",
  "./variants/signal/Signal.tsx",
  "./variants/console/Console.tsx",
]);

const PATHS: Record<VariantKey, string> = {
  terminal: "./variants/terminal/Terminal.tsx",
  orbital: "./variants/orbital/Orbital.tsx",
  signal: "./variants/signal/Signal.tsx",
  console: "./variants/console/Console.tsx",
};

// In-page anchors (#work, #vora, …) share the hash with variant routing, so
// only a hash that names a variant switches pages; anything else is left to
// the browser's normal anchor scrolling.
function variantFromHash(): VariantKey | null {
  const key = window.location.hash.replace(/^#\/?/, "");
  return VARIANTS.find((v) => v.key === key)?.key ?? null;
}

function readHash(): VariantKey {
  return variantFromHash() ?? "console";
}

function Missing() {
  return <div className="app-loading app-missing">This variant is still being built.</div>;
}

export default function App() {
  const [variant, setVariant] = useState<VariantKey>(readHash);

  useEffect(() => {
    const onHash = () => {
      const next = variantFromHash();
      if (!next) return;
      setVariant(next);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.variant = variant;
  }, [variant]);

  const Page = useMemo(() => {
    const load = modules[PATHS[variant]];
    return load ? lazy(load) : Missing;
  }, [variant]);

  return (
    <>
      <Suspense fallback={<div className="app-loading" />}>
        <Page />
      </Suspense>
      <Switcher current={variant} />
    </>
  );
}
