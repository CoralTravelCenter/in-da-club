import type {TooltipContentItem} from '@/content/content.types';

export const SEGMENT_IDS = ['inactive', 'one-trip', 'two-trips', 'three-plus'] as const;
export type SegmentId = (typeof SEGMENT_IDS)[number];
export type CardLevel = 'Silver' | 'Gold' | 'Platinum';
export type BlockId = 'greeting' | 'card-level' | 'balance' | 'cashback' | 'club-launch' | 'birthday-bonus' | 'manager' | 'private-sales' | 'travel-more' | 'welcome-bonus';

export interface CustomerContext { displayName: string; cardLevel: CardLevel; }
export interface BlockPresentation {
    mobilePlacement: 'featured' | 'list';
    background?: {src: string};
}
export interface ContentBlockDefinition {
    id: BlockId;
    isLoading?: boolean | 'card';
    title?: string;
    titleAccent?: string;
    titleAccentAfter?: boolean;
    value?: string;
    valuePrefix?: string;
    description: string;
    descriptionAccent?: string;
    descriptionStrong?: string;
    descriptionSuffix?: string;
    badge?: string;
    image?: {src: string; desktopSrc?: string; alt: string};
    action?: {label: string; href: string; target?: '_blank'};
    tooltip?: {title: string; content: TooltipContentItem[]};
}
export type ContentBlockConfig = ContentBlockDefinition & {presentation: BlockPresentation};
export interface SegmentConfig { id: SegmentId; ariaLabel: string; blocks: ContentBlockConfig[]; }
