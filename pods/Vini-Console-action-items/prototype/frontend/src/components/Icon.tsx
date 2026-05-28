/**
 * Icon library — Material Symbols Rounded via the MaterialSymbol wrapper.
 *
 * Per Spyne DESIGN_SYSTEM v1 + the intelligent-console-design skill:
 *   - All structural icons are Material Symbols Rounded
 *   - Each icon is a thin alias around <MaterialSymbol name="…" /> so
 *     existing imports (`import { PhoneIcon } from "./Icon"`) keep
 *     working — the visual swap is centralised here.
 *
 * The full mapping below is the source-of-truth for "what glyph belongs
 * to what concept" in this product. Pick from this list; do not invent.
 */
import type { SVGProps } from "react";
import { MaterialSymbol } from "./MaterialSymbol";

// Same prop surface as before — size + className stay the contract.
type IconProps = Pick<SVGProps<SVGSVGElement>, "className"> & {
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
};

function ms(name: string) {
  return ({ size, className, filled }: IconProps) => (
    <MaterialSymbol name={name} size={size} className={className} filled={filled} />
  );
}

// =========================================================================
// Channels  (used by row + filter strip + conversation snippet)
// =========================================================================
export const PhoneIcon = ms("call");
export const SmsIcon = ms("sms");
export const ChatIcon = ms("chat_bubble");
export const EmailIcon = ms("mail");
export const HitlIcon = ms("swap_horiz"); // human handoff / takeover

// =========================================================================
// Status + Actions
// =========================================================================
export const ClockIcon = ms("schedule");
export const CheckIcon = ms("check");
export const ChevronDownIcon = ms("expand_more");
export const ChevronRightIcon = ms("chevron_right");
export const ChevronLeftIcon = ms("chevron_left");
export const SearchIcon = ms("search");
export const FilterIcon = ms("filter_list");
export const CloseIcon = ms("close");
export const PlayIcon = ms("play_arrow");
export const AlertIcon = ms("warning"); // amber/red severity flag
export const BoltIcon = ms("bolt"); // escalation / urgent
export const RepeatIcon = ms("autorenew"); // repeat-caller cycle
export const MailEnvelopeIcon = ms("mail");
export const DownloadIcon = ms("download");
export const SparkleIcon = ms("auto_awesome"); // AI accent

// =========================================================================
// Navigation (sidebar + sub-nav)
// =========================================================================
export const HomeIcon = ms("home");
export const FilmIcon = ms("movie");
export const ChartIcon = ms("monitoring");
export const SettingsIcon = ms("settings");
export const SparklesIcon = ms("auto_awesome"); // Vini AI brand
export const RobotIcon = ms("smart_toy");
export const InboxIcon = ms("inbox");
export const ClipboardListIcon = ms("checklist");
export const CalendarIcon = ms("calendar_today");
export const MegaphoneIcon = ms("campaign");
export const UsersIcon = ms("group");
export const BarChartIcon = ms("bar_chart");
export const MenuIcon = ms("menu");
export const GlobeIcon = ms("public");
export const MoreHorizontalIcon = ms("more_horiz");
export const ArrowLeftIcon = ms("arrow_back");

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
