import type { CSSProperties } from "react";

/**
 * Material Symbols Outlined wrapper.
 *
 * Per Spyne Intelligent Console design system (console-revamp/iconography.md):
 *   - Use Material Symbols Outlined, weight 400, fill 0 by default
 *   - Switch to fill 1 only for selected / active nav items
 *   - Allowed sizes per tokens.md: 16 (inline) | 20 (card header) |
 *     22 (nav rail) | 24 (section lead). This component clamps to
 *     14 | 16 | 20 | 24.
 *
 * Glyphs are font ligatures, so `name` is the ligature string ("call",
 * "schedule", "warning", etc.). The span carries `aria-hidden` so screen
 * readers don't read out the icon name as text — the parent component
 * is responsible for its own aria-label.
 */
type AllowedSize = 14 | 16 | 20 | 24;

type Props = {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
};

function clampSize(size: number): AllowedSize {
  if (size <= 15) return 14;
  if (size <= 18) return 16;
  if (size <= 22) return 20;
  return 24;
}

export function MaterialSymbol({
  name,
  size = 16,
  filled = false,
  className,
  style,
}: Props) {
  const px = clampSize(size);
  return (
    <span
      className={`material-symbols-outlined select-none ${className ?? ""}`}
      style={{
        fontSize: `${px}px`,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${px}`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
