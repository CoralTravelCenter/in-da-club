export const SEGMENT_IDS = [
  'new-client',
  'regular-1',
  'regular-2',
  'regular-3',
] as const;

export type SegmentId = (typeof SEGMENT_IDS)[number];

interface ContentBlockBaseConfig {
  id: string;
  description: string;
  tooltip?: {
    title: string;
    content: string[];
  };
  href?: string;
  badge?: string;
  action?: {
    label: string;
    type: 'activate-card';
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

export type ContentBlockConfig = ContentBlockBaseConfig & ContentBlockTextConfig;

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
    action: {
      label: string;
      type: 'activate-card';
    };
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
