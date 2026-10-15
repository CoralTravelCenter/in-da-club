import type {
    ContentBlockConfig,
    ContentBlockDefinition,
    SegmentConfig,
    SegmentContentConfig,
    SegmentId,
} from './prospect.types';
import {PROSPECT_BLOCK_PRESENTATION} from './prospect-presentation';
import {content} from '@/content/content';

const REGULAR_CLIENT_PROMOS = {
    'new-client': 'L7C9597QDX0ZTK3J1FARHS321SFLMWQ640RK1N3G4LA3UHP99MEWEOXFDIMNPH5',
    'regular-1': 'BYWXFE5GG4A2YSHDWVY9RNP525TONI3ANLAB51Q2X4OC4W3DPIKW8S9QWSUCK9F',
    'regular-2': 'ME608I6I76IQCD7ZQ8941G6EPWVC31EOMLSXK46ZJPIXMST9AO4QOWPOWFBD06T',
    'regular-3': 'JN53CKMQHT7RU26B02EW9V7P3SK2LTPNAOT9UE5ZW2S5OXDEAOTSQSNA9WZ68E2',
} as const;

function createSegmentContent(
    id: SegmentId,
    ariaLabel: string,
    bonusTitle: string,
    bonusDescription: string,
): SegmentContentConfig {
    return {
        ariaLabel,
        bonus: {title: bonusTitle, description: bonusDescription},
        club: {
            action: {
                label: content.prospect.blocks.activateCard,
                type: 'activate-card',
                promo: REGULAR_CLIENT_PROMOS[id],
            },
        },
        cashback: {
            percent: 3,
            description: content.prospect.blocks.cashback,
        },
    };
}

export const SEGMENT_CONTENT: Record<SegmentId, SegmentContentConfig> = {
    'new-client': createSegmentContent(
        'new-client',
        content.prospect.segments.newClient,
        content.prospect.blocks.newClientBonus,
        content.prospect.blocks.welcomeBonus,
    ),
    'regular-1': createSegmentContent(
        'regular-1',
        content.prospect.segments.regular1,
        content.prospect.blocks.regularClientBonus,
        content.prospect.blocks.regularWelcomeBonus,
    ),
    'regular-2': createSegmentContent(
        'regular-2',
        content.prospect.segments.regular2,
        content.prospect.blocks.regularClientBonus,
        content.prospect.blocks.regularWelcomeBonus,
    ),
    'regular-3': createSegmentContent(
        'regular-3',
        content.prospect.segments.regular3,
        content.prospect.blocks.regularClientBonus,
        content.prospect.blocks.regularWelcomeBonus,
    ),
};

export function getSegmentConfig(id: SegmentId): SegmentConfig {
    const segmentContent = SEGMENT_CONTENT[id];
    const cashbackValue = `${segmentContent.cashback.percent}%`;
    const definitions: ContentBlockDefinition[] = [
        {
            id: 'club',
            title: content.prospect.blocks.clubTitle,
            description: content.prospect.blocks.clubDescription,
            action: segmentContent.club.action,
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
            presentation: PROSPECT_BLOCK_PRESENTATION[block.id],
        })),
    };
}
