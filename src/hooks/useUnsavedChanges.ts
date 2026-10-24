import { useEffect, useRef } from 'react';
import { registerUnsavedEdit } from '@/lib/unsavedChanges';

/** Registers only eligible, currently mounted editors. Cleanup never discards a persisted draft. */
export function useUnsavedChanges(dirty: boolean) {
  const id = useRef(Symbol('editor'));
  useEffect(() => { const key = id.current; registerUnsavedEdit(key, dirty); return () => registerUnsavedEdit(key, false); }, [dirty]);
}
