import type {BlockId, SegmentId} from './member.types';
import type {BlockPresentation} from './presentation.types';

const segmentMedia = (folder: string, file: string): string => `${__CARDHOLDER_ASSETS_BASE__}/clients/${folder}/${file}`;
const placement = (
    mobile: 'featured' | 'list',
    column: string,
    row: string,
    background?: BlockPresentation['background'],
): BlockPresentation => ({placement: {mobile, desktop: {column, row}}, background});
const background = (mobileSrc: string, desktopSrc: string): NonNullable<BlockPresentation['background']> => ({
    mobile: {src: mobileSrc},
    desktop: {src: desktopSrc},
});
const segmentBackground = (
    folder: string,
    file: string,
    desktopFile = file,
): NonNullable<BlockPresentation['background']> => background(
    segmentMedia(folder, `backgrounds/mobile/${file}`),
    segmentMedia(folder, `backgrounds/desktop/${desktopFile}`),
);
const introGreetingBackground = (): NonNullable<BlockPresentation['background']> => background(
    `${__INTRO_ASSETS_BASE__}/backgrounds/mobile/greeting.png`,
    `${__INTRO_ASSETS_BASE__}/backgrounds/desktop/greeting.png`,
);
const PRESENTATION: Record<SegmentId, Partial<Record<BlockId, BlockPresentation>>> = {
    inactive: {
        greeting: placement('featured', '1', '1 / span 2', introGreetingBackground()),
        'welcome-bonus': placement('list', '2', '1', segmentBackground('inactive', 'coins.png', 'coins_small.png')),
        'card-level': placement('featured', '3', '1'),
        manager: placement('list', '2', '2', segmentBackground('inactive', 'messenger.png', 'messenger_small.png')),
        cashback: placement('list', '1', '3', segmentBackground('inactive', 'cashback.png')),
        'birthday-bonus': placement('list', '2', '3', segmentBackground('inactive', 'gift.png')),
        'private-sales': placement('list', '3', '2 / span 2', segmentBackground('inactive', 'offers.png')),
    },
    'one-trip': {
        'birthday-bonus': placement('list', '1', '1', segmentBackground('one-trip', 'gift.png')),
        greeting: placement('featured', '2', '1 / span 2', segmentBackground('one-trip', 'greeting.png')),
        'club-launch': placement('list', '3', '1', segmentBackground('one-trip', 'launch.png')),
        cashback: placement('list', '1', '2 / span 2', segmentBackground('one-trip', 'cashback.png')),
        'card-level': placement('featured', '2', '3'),
        'travel-more': placement('list', '3', '2 / span 2', segmentBackground('one-trip', 'stars.png')),
    },
    'two-trips': {},
    'three-plus': {},
};

for (const [id, folder] of [['two-trips', 'two-trips'], ['three-plus', 'three-plus']] as const) {
    PRESENTATION[id] = {
        balance: placement('list', '1', '1 / span 2', segmentBackground(folder, 'coins.png')),
        greeting: placement('featured', '2', '1 / span 2', segmentBackground(folder, 'greeting.png')),
        cashback: placement('list', '3', '1', segmentBackground(folder, 'cashback.png')),
        'club-launch': placement('list', '1', '3', segmentBackground(folder, 'launch.png')),
        'card-level': placement('featured', '2', '3'),
        'birthday-bonus': placement('list', '3', '2 / span 2', segmentBackground(folder, 'gift.png')),
        manager: placement('list', '1', '4', segmentBackground(folder, 'messenger.png')),
        'private-sales': placement('list', '2', '4', segmentBackground(folder, 'offers.png')),
        'travel-more': placement('list', '3', '4', segmentBackground(folder, 'stars.png')),
    };
}

export function memberMedia(folder: string, file: string): string {
    return segmentMedia(folder, file);
}

export function getMemberBlockPresentation(
    segmentId: SegmentId,
    blockId: BlockId,
): BlockPresentation | undefined {
    return PRESENTATION[segmentId][blockId];
}
