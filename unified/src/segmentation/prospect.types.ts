import type {TooltipContentItem} from '@/content/content.types';

export const SEGMENT_IDS = [
  'new-client',
  'regular-1',
  'regular-2',
  'regular-3',
] as const;

export type SegmentId = (typeof SEGMENT_IDS)[number];

export type BlockId =
  | 'club'
  | 'cashback'
  | 'birthday-bonus'
  | 'welcome-bonus'
  | 'private-sales'
  | 'manager';

export interface BlockPresentation {
  mobilePlacement: 'featured' | 'list';
  desktopColumn: '1' | '2' | '3';
  background?: {
    mobile: {src: string};
    desktop?: {src: string};
  };
}

interface ContentBlockBaseConfig {
  id: BlockId;
  description: string;
  tooltip?: {
    title: string;
    content: TooltipContentItem[];
  };
  href?: string;
  badge?: string;
  action?: {
    label: string;
    type: 'activate-card';
    promo?: string;
  };
}

type ContentBlockTextConfig =
  | {
      title: string;
      value?: never;
    }
  | {
      title?: never;
      value: string;
      valuePrefix?: string;
    };

export type ContentBlockDefinition = ContentBlockBaseConfig & ContentBlockTextConfig;
export type ContentBlockConfig = ContentBlockDefinition & { presentation: BlockPresentation };

export interface SegmentConfig {
  id: SegmentId;
  ariaLabel: string;
  blocks: ContentBlockConfig[];
}

export interface SegmentContentConfig {
  ariaLabel: string;
  bonus: {
    title: string;
    description: string;
  };
  club: {
    action: NonNullable<ContentBlockConfig['action']>;
  };
  cashback: {
    percent: number;
    description: string;
  };
}
