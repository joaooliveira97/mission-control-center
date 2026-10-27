import { DestroyRef, ElementRef, Signal, afterNextRender, inject, signal } from '@angular/core';

export interface Size {
  width: number;
  height: number;
}

/**
 * Tracks the rendered size of the current component's host element.
 * Must be called in an injection context.
 */
export function hostSize(): Signal<Size | null> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef);
  return elementSize(() => host.nativeElement);
}

/**
 * Tracks the layout size of an element of the current component, read after the first render.
 * Must be called in an injection context.
 */
export function elementSize(element: () => HTMLElement): Signal<Size | null> {
  const destroyRef = inject(DestroyRef);
  const size = signal<Size | null>(null);

  afterNextRender(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      size.set({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(element());
    destroyRef.onDestroy(() => observer.disconnect());
  });

  return size.asReadonly();
}
