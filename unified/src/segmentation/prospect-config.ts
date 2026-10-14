import type {
    ContentBlockConfig,
    ContentBlockDefinition,
    SegmentConfig,
    SegmentContentConfig,
    SegmentId,
} from './prospect.types';
import {PROSPECT_BLOCK_PRESENTATION} from './prospect-presentation';
import {content} from '@/content/content';

const CLUB_VIDEO_URL = `${__INTRO_ASSETS_BASE__}/club.webm`;
const CLUB_VIDEO_SAFARI_URL = `${__INTRO_ASSETS_BASE__}/club.mov`;
const REGULAR_CLIENT_PROMOS = {
    "new-client": 'L7C9597QDX0ZTK3J1FARHS321SFLMWQ640RK1N3G4LA3UHP99MEWEOXFDIMNPH5',
    'regular-1': 'BYWXFE5GG4A2YSHDWVY9RNP525TONI3ANLAB51Q2X4OC4W3DPIKW8S9QWSUCK9F',
    'regular-2': 'ME608I6I76IQCD7ZQ8941G6EPWVC31EOMLSXK46ZJPIXMST9AO4QOWPOWFBD06T',
    'regular-3': 'JN53CKMQHT7RU26B02EW9V7P3SK2LTPNAOT9UE5ZW2S5OXDEAOTSQSNA9WZ68E2',
} as const;

export const SEGMENT_CONTENT = {
    'new-client': {
        ariaLabel: content.prospect.segments.newClient,
        bonus: {
            title: content.prospect.blocks.newClientBonus,
            description: content.prospect.blocks.welcomeBonus,
        },
        club: {
            level: 'Silver',
            action: {
                label: content.prospect.blocks.activateCard,
                type: 'activate-card',
                promo: REGULAR_CLIENT_PROMOS['new-client'],
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
                safariSrc: CLUB_VIDEO_SAFARI_URL,
            },
        },
        cashback: {
            percent: 3,
            description: content.prospect.blocks.cashback,
        },
    },
    'regular-1': {
        ariaLabel: content.prospect.segments.regular1,
        bonus: {
            title: content.prospect.blocks.regularClientBonus,
            description: content.prospect.blocks.regularWelcomeBonus,
        },
        club: {
            level: 'Silver',
            action: {
                label: content.prospect.blocks.activateCard,
                type: 'activate-card',
                promo: REGULAR_CLIENT_PROMOS['regular-1'],
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
                safariSrc: CLUB_VIDEO_SAFARI_URL,
            },
        },
        cashback: {
            percent: 3,
            description: content.prospect.blocks.cashback,
        },
    },
    'regular-2': {
        ariaLabel: content.prospect.segments.regular2,
        bonus: {
            title: content.prospect.blocks.regularClientBonus,
            description: content.prospect.blocks.regularWelcomeBonus,
        },
        club: {
            level: 'Silver',
            action: {
                label: content.prospect.blocks.activateCard,
                type: 'activate-card',
                promo: REGULAR_CLIENT_PROMOS['regular-2'],
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
                safariSrc: CLUB_VIDEO_SAFARI_URL,
            },
        },
        cashback: {
            percent: 3,
            description: content.prospect.blocks.cashback,
        },
    },
    'regular-3': {
        ariaLabel: content.prospect.segments.regular3,
        bonus: {
            title: content.prospect.blocks.regularClientBonus,
            description: content.prospect.blocks.regularWelcomeBonus,
        },
        club: {
            level: 'Silver',
            action: {
                label: content.prospect.blocks.activateCard,
                type: 'activate-card',
                promo: REGULAR_CLIENT_PROMOS['regular-3'],
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
                safariSrc: CLUB_VIDEO_SAFARI_URL,
            },
        },
        cashback: {
            percent: 3,
            description: content.prospect.blocks.cashback,
        },
    },
} satisfies Record<SegmentId, SegmentContentConfig>;

export function getSegmentConfig(id: SegmentId): SegmentConfig {
    const segmentContent = SEGMENT_CONTENT[id];
    const cashbackValue = `${segmentContent.cashback.percent}%`;
    const definitions: ContentBlockDefinition[] = [
        {
            id: 'club',
            title: content.prospect.blocks.clubTitle,
            description: content.prospect.blocks.clubDescription,
            action: segmentContent.club.action,
            media: segmentContent.club.media,
        },
        {
            id: 'cashback',
            value: cashbackValue,
            valuePrefix: content.prospect.blocks.upTo,
            description: segmentContent.cashback.description,
        },
        {
            id: 'birthday-bonus',
            value: content.prospect.blocks.regularClientBonus,
            description: content.prospect.blocks.birthdayBonus,
            tooltip: content.promotionTerms.noCard.birthdayBonus,
        },
        {
            id: 'welcome-bonus',
            value: segmentContent.bonus.title,
            description: segmentContent.bonus.description,
            tooltip: content.promotionTerms.noCard.welcomeBonus,
        },
        {
            id: 'private-sales',
            title: content.prospect.blocks.privateSalesTitle,
            description: id === 'new-client'
                ? content.prospect.blocks.privateSalesMembersOnly
                : content.prospect.blocks.privateSalesEarlyAccess,
        },
        {
            id: 'manager',
            title: content.prospect.blocks.managerTitle,
            description: content.prospect.blocks.managerDescription,
        },
    ];

    return {
        id,
        ariaLabel: segmentContent.ariaLabel,
        blocks: definitions.map((block): ContentBlockConfig => ({
            ...block,
            presentation: PROSPECT_BLOCK_PRESENTATION[block.id]
        })),
    };
}
