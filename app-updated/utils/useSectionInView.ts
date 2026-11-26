import { useEffect, useState, type RefObject } from "react";

export function useSectionInView(
  ref: RefObject<Element | null>,
  options?: { rootMargin?: string; once?: boolean }
) {
  const [inView, setInView] = useState(false);
  const { rootMargin = "280px 0px", once = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, once, inView]);

  return inView;
}
