import { useExperienceCopy } from '@/i18n/publicExperienceCopy';
import { usePublicMotionPreference } from '@/hooks/usePublicMotionPreference';
import { Children, type ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './public-spatial-catalog.css';

type Item = { title: string; image?: string };
export default function PublicSpatialCatalog({ children, items }: { children: ReactNode; items: Item[] }) {
  const cards = Children.toArray(children);
  const text = useExperienceCopy();
  const [index, setIndex] = useState(0);
  const [compact, setCompact] = useState(false);
  const { reduced } = usePublicMotionPreference();
  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const [direction, setDirection] = useState(1);
  const itemKey = JSON.stringify(items.map(item => item.title));
  useEffect(() => { setIndex(0); }, [itemKey]);
  const choose = (next: number) => { const clamped = Math.max(0, Math.min(cards.length - 1, next)); setDirection(clamped >= safeIndex ? 1 : -1); setIndex(clamped); };
  if (!cards.length) return <section className="spatial-catalog" aria-label={text.gallery} tabIndex={-1}><p className="spatial-help">{text.empty}</p></section>;
  return <section className="spatial-catalog" aria-label={text.gallery} tabIndex={-1} onKeyDown={event => {
    if ((event.target as HTMLElement).tagName === 'SELECT' || compact) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); choose(safeIndex + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); choose(safeIndex - 1); }
  }}>
    <div className="spatial-toolbar"><div><p>{text.projects}</p><span aria-live="polite">{cards.length ? `${String(safeIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}` : text.empty}</span></div>
      <button type="button" aria-pressed={compact} onClick={() => setCompact(value => !value)}>{compact ? text.spatial + ' ↗' : text.compact + ' ↗'}</button>
    </div>
    {compact ? <div className="spatial-compact">{cards}</div> : <>
      <div className="spatial-controls"><button type="button" disabled={safeIndex === 0} onClick={() => choose(safeIndex - 1)} aria-label={text.previous}>←</button>
        <label><span className="sr-only">{text.select}</span><select value={safeIndex} onChange={event => choose(Number(event.target.value))}>{items.map((item, i) => <option key={i} value={i}>{String(i + 1).padStart(2, '0')} · {item.title}</option>)}</select></label>
        <button type="button" disabled={safeIndex >= cards.length - 1} onClick={() => choose(safeIndex + 1)} aria-label={text.next}>→</button>
      </div>
      <div className="spatial-stage">
        <div className="spatial-grid-floor" aria-hidden="true" />
        {safeIndex > 0 && <button type="button" className="spatial-neighbor spatial-left" onClick={() => choose(safeIndex - 1)} aria-label={`${text.selectPrefix} ${items[safeIndex - 1]?.title}`}><img src={items[safeIndex - 1]?.image || undefined} alt="" loading="lazy" /><span>{items[safeIndex - 1]?.title}</span></button>}
        <div className="spatial-current"><AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div key={safeIndex} custom={direction} variants={{ enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 150, rotateY: reduced ? 0 : d * -20, scale: reduced ? 1 : .88 }), visible: { opacity: 1, x: 0, rotateY: 0, scale: 1 }, exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -150, rotateY: reduced ? 0 : d * 20, scale: reduced ? 1 : .88 }) }} initial="enter" animate="visible" exit="exit" transition={{ duration: reduced ? 0 : .38, ease: [.22, 1, .36, 1] }}>
            {cards[safeIndex]}
          </motion.div>
        </AnimatePresence></div>
        {safeIndex < cards.length - 1 && <button type="button" className="spatial-neighbor spatial-right" onClick={() => choose(safeIndex + 1)} aria-label={`${text.selectPrefix} ${items[safeIndex + 1]?.title}`}><img src={items[safeIndex + 1]?.image || undefined} alt="" loading="lazy" /><span>{items[safeIndex + 1]?.title}</span></button>}
      </div>
      <p className="spatial-help">{text.help}</p>
    </>}
  </section>;
}
