export const SEGMENT_IDS = ['inactive', 'one-trip', 'two-trips', 'three-plus'] as const;
export type SegmentId = (typeof SEGMENT_IDS)[number];
export type CardLevel = 'Silver' | 'Gold' | 'Platinum';
export type BlockId = 'greeting' | 'card-level' | 'balance' | 'cashback' | 'club-launch' | 'birthday-bonus' | 'manager' | 'private-sales' | 'travel-more' | 'welcome-bonus';

export interface BlockPresentation {
    placement: {
        mobile: 'featured' | 'list';
        desktop: {column: string; row: string};
    };
    background?: {
        mobile: {src: string; size: string; position: string};
        desktop?: {src: string; size: string; position: string};
    };
}

export interface CustomerContext { displayName: string; cardLevel: CardLevel; }
export interface ContentBlockDefinition {
    id: BlockId;
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
export type ContentBlockConfig = ContentBlockDefinition & {presentation: BlockPresentation};
export interface SegmentConfig { id: SegmentId; ariaLabel: string; blocks: ContentBlockConfig[]; }
