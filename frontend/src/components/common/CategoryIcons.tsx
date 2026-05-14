interface IconProps {
  size?: number;
  className?: string;
}

export function TagIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M1.5 1.5h4.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 0 1.414l-3.586 3.586a1 1 0 0 1-1.414 0L1.793 6.793A1 1 0 0 1 1.5 6.086V1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="4.5" cy="4.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FolderIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M1.5 4a1 1 0 0 1 1-1H5l1.5 1.5H11.5a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M7 1.5l1.545 3.13 3.455.503-2.5 2.437.59 3.44L7 9.385l-3.09 1.625.59-3.44L2 5.133l3.455-.503L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M7 11.5S1.5 8 1.5 4.5a2.5 2.5 0 0 1 5-0C6.5 3 7 2.5 7 2.5S7.5 3 8.5 4.5a2.5 2.5 0 0 1 5 0C13.5 8 7 11.5 7 11.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8 1.5L3 7.5h4l-1 5 6-7H8l1-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1H12v10H3.5A1.5 1.5 0 0 0 2 12.5v-10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2 12.5A1.5 1.5 0 0 0 3.5 14H12v-3H3.5A1.5 1.5 0 0 0 2 12.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M1.5 6.5L7 1.5l5.5 5v6h-3.5V9.5h-4V12.5H1.5v-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BriefcaseIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="1.5" y="4.5" width="11" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1.5 8h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function CartIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M1 1.5h2l1.5 7h6l1.5-5H4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function MusicIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M5.5 10.5V3l7-1.5v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="3.5" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function CodeIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4.5 4L1.5 7l3 3M9.5 4l3 3-3 3M8 2.5l-2 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DumbbellIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M1.5 7h11M3 5v4M11 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="1" y="5.5" width="2" height="3" rx="0.5" fill="currentColor" />
      <rect x="11" y="5.5" width="2" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export const CATEGORY_ICONS: { id: string; label: string; component: React.ComponentType<IconProps> }[] = [
  { id: 'folder',    label: '폴더',     component: FolderIcon },
  { id: 'star',      label: '별',       component: StarIcon },
  { id: 'heart',     label: '하트',     component: HeartIcon },
  { id: 'bolt',      label: '번개',     component: BoltIcon },
  { id: 'book',      label: '책',       component: BookIcon },
  { id: 'home',      label: '집',       component: HomeIcon },
  { id: 'briefcase', label: '업무',     component: BriefcaseIcon },
  { id: 'cart',      label: '쇼핑',     component: CartIcon },
  { id: 'music',     label: '음악',     component: MusicIcon },
  { id: 'code',      label: '코드',     component: CodeIcon },
  { id: 'dumbbell',  label: '운동',     component: DumbbellIcon },
  { id: 'tag',       label: '태그',     component: TagIcon },
];

export function getCategoryIconComponent(iconId: string): React.ComponentType<IconProps> {
  return CATEGORY_ICONS.find((i) => i.id === iconId)?.component ?? FolderIcon;
}
