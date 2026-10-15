import type {BlockId, BlockPresentation, SegmentId} from './member.types';

const placement = (
    mobilePlacement: BlockPresentation['mobilePlacement'],
    background?: BlockPresentation['background'],
): BlockPresentation => ({mobilePlacement, background});
const background = (mobileSrc: string, desktopSrc: string): NonNullable<BlockPresentation['background']> => ({
    mobile: {src: mobileSrc},
    desktop: {src: desktopSrc},
});
const segmentBackground = (folder: string, name: string): NonNullable<BlockPresentation['background']> => background(
    `${__V2_ASSETS_BASE__}/member-${folder}-${name}-mobile.png`,
    `${__V2_ASSETS_BASE__}/member-${folder}-${name}-desktop.png`,
);
const introGreetingBackground = (): NonNullable<BlockPresentation['background']> => background(
    `${__V2_ASSETS_BASE__}/intro-greeting-mobile.png`,
    `${__V2_ASSETS_BASE__}/intro-greeting-desktop.png`,
);
const PRESENTATION: Record<SegmentId, Partial<Record<BlockId, BlockPresentation>>> = {
    inactive: {
        greeting: placement('featured', introGreetingBackground()),
        'welcome-bonus': placement('list', segmentBackground('inactive', 'coins')),
        'card-level': placement('featured'),
        manager: placement('list', segmentBackground('inactive', 'messenger')),
        cashback: placement('list', segmentBackground('inactive', 'cashback')),
        'birthday-bonus': placement('list', segmentBackground('inactive', 'gift')),
        'private-sales': placement('list', segmentBackground('inactive', 'offers')),
    },
    'one-trip': {
        'birthday-bonus': placement('list', segmentBackground('one-trip', 'gift')),
        greeting: placement('featured', segmentBackground('one-trip', 'greeting')),
        'club-launch': placement('list', segmentBackground('one-trip', 'launch')),
        cashback: placement('list', segmentBackground('one-trip', 'cashback')),
        'card-level': placement('featured'),
        'travel-more': placement('list', segmentBackground('one-trip', 'stars')),
    },
    'two-trips': {},
    'three-plus': {},
};

for (const [id, folder] of [['two-trips', 'two-trips'], ['three-plus', 'three-plus']] as const) {
    PRESENTATION[id] = {
        balance: placement('list', segmentBackground(folder, 'coins')),
        greeting: placement('featured', segmentBackground(folder, 'greeting')),
        cashback: placement('list', segmentBackground(folder, 'cashback')),
        'club-launch': placement('list', segmentBackground(folder, 'launch')),
        'card-level': placement('featured'),
        'birthday-bonus': placement('list', segmentBackground(folder, 'gift')),
        manager: placement('list', segmentBackground(folder, 'messenger')),
        'private-sales': placement('list', segmentBackground(folder, 'offers')),
        'travel-more': placement('list', segmentBackground(folder, 'stars')),
    };
}

export function getMemberBlockPresentation(
    segmentId: SegmentId,
    blockId: BlockId,
): BlockPresentation | undefined {
    return PRESENTATION[segmentId][blockId];
}
