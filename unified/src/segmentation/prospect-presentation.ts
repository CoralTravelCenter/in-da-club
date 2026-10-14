import type {BlockId} from './prospect.types';
import type {BlockPresentation} from './presentation.types';

const NO_CARD_BACKGROUNDS = `${__NO_CARD_ASSETS_BASE__}/backgrounds`;
const INTRO_BACKGROUNDS = `${__INTRO_ASSETS_BASE__}/backgrounds`;
const list = (
    column: string,
    row: string,
    background?: BlockPresentation['background'],
): BlockPresentation => ({placement: {mobile: 'list', desktop: {column, row}}, background});
const featured = (
    column: string,
    row: string,
    blockBackground?: BlockPresentation['background'],
): BlockPresentation => ({
    placement: {mobile: 'featured', desktop: {column, row}},
    background: blockBackground,
});
const background = (file: string): NonNullable<BlockPresentation['background']> => ({
    mobile: {src: `${NO_CARD_BACKGROUNDS}/mobile/${file}`},
    desktop: {src: `${NO_CARD_BACKGROUNDS}/desktop/${file}`},
});
const introBackground = (file: string): NonNullable<BlockPresentation['background']> => ({
    mobile: {src: `${INTRO_BACKGROUNDS}/mobile/${file}`},
    desktop: {src: `${INTRO_BACKGROUNDS}/desktop/${file}`},
});

export const PROSPECT_BLOCK_PRESENTATION = {
    club: featured('2', '1 / span 3', introBackground('greeting.png')),
    'welcome-bonus': list('1', '1 / span 2', background('coins.png')),
    manager: list('1', '3 / span 3', background('messenger.png')),
    'birthday-bonus': list('2', '4 / span 2', background('gift.png')),
    cashback: list('3', '1 / span 2', background('cashback.png')),
    'private-sales': list('3', '3 / span 3', background('offers.png')),
} satisfies Record<BlockId, BlockPresentation>;
