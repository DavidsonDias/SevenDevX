import { useEffect, useState } from 'react';

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;
const readPreference = () => {
  if (typeof window === 'undefined') return { reduced: true, compact: true };
  const network = connection();
  const compact = matchMedia('(max-width: 767px)').matches;
  const shortViewport = matchMedia('(max-height: 600px)').matches || (compact && matchMedia('(max-height: 700px)').matches);
  return {
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches || shortViewport || !!network?.saveData || ['slow-2g', '2g'].includes(network?.effectiveType || ''),
    compact,
  };
};

/** Honour accessibility and data-saving preferences before allocating the gallery mosaic. */
export function usePublicMotionPreference() {
  const [preference, setPreference] = useState(readPreference);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const width = matchMedia('(max-width: 767px)');
    const shortHeight = matchMedia('(max-height: 600px)');
    const mobileHeight = matchMedia('(max-height: 700px)');
    const network = connection();
    const update = () => setPreference(previous => {
      const next = readPreference();
      return previous.reduced === next.reduced && previous.compact === next.compact ? previous : next;
    });
    motion.addEventListener('change', update); width.addEventListener('change', update); shortHeight.addEventListener('change', update); mobileHeight.addEventListener('change', update); network?.addEventListener('change', update); update();
    return () => { motion.removeEventListener('change', update); width.removeEventListener('change', update); shortHeight.removeEventListener('change', update); mobileHeight.removeEventListener('change', update); network?.removeEventListener('change', update); };
  }, []);
  return preference;
}
