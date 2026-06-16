import { useEffect, useId, useRef, useState } from 'react';
import styles from './MultiSelect.module.css';

type Option = { id: number; name: string };

type Props = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ label, options, value, onChange, placeholder = 'Todos' }: Props) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  const selected = options.filter((o) => value.includes(String(o.id)));

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value.length ? styles.triggerLabel : styles.placeholder}>
          {value.length ? `${label} (${value.length})` : placeholder}
        </span>
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className={styles.panel} id={listboxId} role="listbox" aria-multiselectable="true">
          {options.length === 0 ? (
            <li className={styles.empty}>Sin opciones</li>
          ) : (
            options.map((o) => {
              const id = String(o.id);
              return (
                <li key={o.id}>
                  <label className={styles.option}>
                    <input
                      type="checkbox"
                      checked={value.includes(id)}
                      onChange={() => toggle(id)}
                    />
                    {o.name}
                  </label>
                </li>
              );
            })
          )}
        </ul>
      )}

      {selected.length > 0 && (
        <div className={styles.chips}>
          {selected.map((o) => (
            <span key={o.id} className={styles.chip}>
              {o.name}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Quitar ${o.name}`}
                onClick={() => toggle(String(o.id))}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
