import { useState, useEffect } from 'react';

// Derive high-contrast mode from the OS/browser "prefers-contrast: more" media query.
// No manual toggle – the setting follows the system preference automatically.

const mq = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-contrast: more)')
  : null;

// Apply immediately on module load so the attribute is present before React renders,
// preventing a flash of unstyled content on reload.
if (mq?.matches) {
  document.documentElement.setAttribute('data-hc', 'true');
}

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState<boolean>(() => mq?.matches ?? false);

  useEffect(() => {
    if (!mq) return;
    function handleChange(e: MediaQueryListEvent) {
      setHighContrast(e.matches);
    }
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-hc', 'true');
    } else {
      document.documentElement.removeAttribute('data-hc');
    }
  }, [highContrast]);

  return { highContrast };
}
