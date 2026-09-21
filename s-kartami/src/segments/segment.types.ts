export const SEGMENT_IDS = ['inactive', 'one-trip', 'two-trips', 'three-plus'] as const;
export type SegmentId = (typeof SEGMENT_IDS)[number];
export type CardLevel = 'Silver' | 'Gold' | 'Platinum';

export interface CustomerContext { displayName: string; cardLevel: CardLevel; }
export interface ContentBlockConfig {
    id: string;
    isLoading?: boolean;
    title?: string;
    titleAccent?: string;
    titleAccentAfter?: boolean;
    value?: string;
    valuePrefix?: string;
    description: string;
    badge?: string;
    image?: { src: string; alt: string };
    media?: {type: 'video'; src: string; safariSrc?: string; poster?: string};
    action?: {label: string; href: string};
    tooltip?: { title: string; content: string[] };
}
export interface SegmentConfig { id: SegmentId; ariaLabel: string; blocks: ContentBlockConfig[]; }
