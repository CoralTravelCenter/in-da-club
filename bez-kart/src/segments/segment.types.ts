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
  placement: {
    mobile: 'featured' | 'list';
    desktop: { column: string; row: string };
  };
  background?: {
    mobile: { src: string; size: string; position: string };
    desktop?: { src: string; size: string; position: string };
  };
}

interface ContentBlockBaseConfig {
  id: BlockId;
  description: string;
  tooltip?: {
    title: string;
    content: string[];
  };
  href?: string;
  badge?: string;
  action?:
    | {
        label: string;
        type: 'activate-card';
      }
      | {
        label: string;
        type: 'referral-link';
        href: string;
      };
  media?: {
    type: 'video';
    src: string;
    safariSrc?: string;
    poster?: string;
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
    level: string;
    action: NonNullable<ContentBlockConfig['action']>;
    media: {
      type: 'video';
      src: string;
      safariSrc?: string;
      poster?: string;
    };
  };
  cashback: {
    percent: number;
    description: string;
  };
}
