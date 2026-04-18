import { useState, useEffect } from 'react';

const HIGH_CONTRAST_KEY = 'score-tracker-high-contrast';

// Apply immediately on module load so the attribute is present before React renders,
// preventing a flash of unstyled content on reload.
if (localStorage.getItem(HIGH_CONTRAST_KEY) === 'true') {
  document.documentElement.setAttribute('data-hc', 'true');
}

export function useHighContrast() {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem(HIGH_CONTRAST_KEY) === 'true';
  });

  function setHighContrast(value: boolean) {
    setHighContrastState(value);
    localStorage.setItem(HIGH_CONTRAST_KEY, String(value));
  }

  function toggleHighContrast() {
    setHighContrast(!highContrast);
  }

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-hc', 'true');
    } else {
      document.documentElement.removeAttribute('data-hc');
    }
  }, [highContrast]);

  return { highContrast, setHighContrast, toggleHighContrast };
}
