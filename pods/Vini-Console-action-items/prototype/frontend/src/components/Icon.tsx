/**
 * Inline SVG icon library — Heroicons (outline 24px) tuned to the Vini design system.
 *
 * Why inline SVG instead of emoji: emoji renders inconsistently across platforms,
 * cannot be themed via design tokens, and breaks visual hierarchy in a data-dense
 * console. Inline SVG = vector-only, brand-tunable, screen-reader friendly.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function _svg(
  { size = 16, strokeWidth = 1.75, ...rest }: IconProps,
  children: React.ReactNode
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

// =========================================================================
// Channels
// =========================================================================

export const PhoneIcon = (p: IconProps) =>
  _svg(p, <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" />);

export const SmsIcon = (p: IconProps) =>
  _svg(p, <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></>);

export const ChatIcon = (p: IconProps) =>
  _svg(p, <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>);

export const EmailIcon = (p: IconProps) =>
  _svg(p, <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>);

export const HitlIcon = (p: IconProps) =>
  _svg(p, <><path d="M11 19l-7-7 3-3 4 4 9-9 3 3-12 12z" /></>);

// =========================================================================
// Status + Actions
// =========================================================================

export const ClockIcon = (p: IconProps) =>
  _svg(p, <><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></>);

export const CheckIcon = (p: IconProps) =>
  _svg(p, <polyline points="20,6 9,17 4,12" />);

export const ChevronDownIcon = (p: IconProps) =>
  _svg(p, <polyline points="6,9 12,15 18,9" />);

export const ChevronRightIcon = (p: IconProps) =>
  _svg(p, <polyline points="9,18 15,12 9,6" />);

export const ChevronLeftIcon = (p: IconProps) =>
  _svg(p, <polyline points="15,18 9,12 15,6" />);

export const SearchIcon = (p: IconProps) =>
  _svg(p, <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>);

export const FilterIcon = (p: IconProps) =>
  _svg(p, <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />);

export const CloseIcon = (p: IconProps) =>
  _svg(p, <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>);

export const PlayIcon = (p: IconProps) =>
  _svg(p, <polygon points="5,3 19,12 5,21" />);

export const AlertIcon = (p: IconProps) =>
  _svg(p, <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>);

export const BoltIcon = (p: IconProps) =>
  _svg(p, <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />);

export const RepeatIcon = (p: IconProps) =>
  _svg(p, <><polyline points="17,1 21,5 17,9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7,23 3,19 7,15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></>);

export const MailEnvelopeIcon = (p: IconProps) =>
  _svg(p, <><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></>);

export const DownloadIcon = (p: IconProps) =>
  _svg(p, <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></>);

export const SparkleIcon = (p: IconProps) =>
  _svg(p, <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />);

// =========================================================================
// Navigation (sidebar)
// =========================================================================

export const HomeIcon = (p: IconProps) =>
  _svg(p, <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6h-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></>);

export const FilmIcon = (p: IconProps) =>
  _svg(p, <><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>);

export const ChartIcon = (p: IconProps) =>
  _svg(p, <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>);

export const SettingsIcon = (p: IconProps) =>
  _svg(p, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>);

export const SparklesIcon = (p: IconProps) =>
  _svg(p, <><path d="M9 11l-4-2-1-4-1 4-4 1 4 2 1 4 1-4 4-2z" transform="translate(7 3)" /><path d="M19 14l-2-1-.5-2-.5 2-2 .5 2 1 .5 2 .5-2 2-.5z" /></>);

export const RobotIcon = (p: IconProps) =>
  _svg(p, <><rect x="4" y="6" width="16" height="14" rx="2" /><line x1="8" y1="6" x2="8" y2="2" /><line x1="16" y1="6" x2="16" y2="2" /><circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" /><line x1="9" y1="17" x2="15" y2="17" /></>);

export const InboxIcon = (p: IconProps) =>
  _svg(p, <><polyline points="22,12 16,12 14,15 10,15 8,12 2,12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></>);

export const ClipboardListIcon = (p: IconProps) =>
  _svg(p, <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" /></>);

export const CalendarIcon = (p: IconProps) =>
  _svg(p, <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>);

export const MegaphoneIcon = (p: IconProps) =>
  _svg(p, <><path d="M11 5L6 9H2v6h4l5 4z" /><path d="M19.07 4.93a10 10 0 010 14.14" /><path d="M15.54 8.46a5 5 0 010 7.07" /></>);

export const UsersIcon = (p: IconProps) =>
  _svg(p, <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>);

export const BarChartIcon = (p: IconProps) =>
  _svg(p, <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>);

export const MenuIcon = (p: IconProps) =>
  _svg(p, <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>);

export const GlobeIcon = (p: IconProps) =>
  _svg(p, <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>);

export const MoreHorizontalIcon = (p: IconProps) =>
  _svg(p, <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>);

export const ArrowLeftIcon = (p: IconProps) =>
  _svg(p, <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" /></>);

// =========================================================================
// Channel icon dispatcher — replaces channelGlyph()
// =========================================================================

import type { Channel } from "@test-data";

export function ChannelGlyph({
  channel,
  size = 14,
}: {
  channel: Channel;
  size?: number;
}) {
  const Cmp = (() => {
    switch (channel) {
      case "call":
        return PhoneIcon;
      case "sms":
        return SmsIcon;
      case "chat":
        return ChatIcon;
      case "email":
        return EmailIcon;
      case "hitl_takeover":
      case "hitl_warm_transfer":
        return HitlIcon;
    }
  })();
  return <Cmp size={size} />;
}
