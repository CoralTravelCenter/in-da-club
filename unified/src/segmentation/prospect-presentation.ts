import type {BlockId, BlockPresentation} from './prospect.types';

const list = (
    desktopColumn: BlockPresentation['desktopColumn'],
    background?: BlockPresentation['background'],
): BlockPresentation => ({mobilePlacement: 'list', desktopColumn, background});
const featured = (
    desktopColumn: BlockPresentation['desktopColumn'],
    blockBackground?: BlockPresentation['background'],
): BlockPresentation => ({
    mobilePlacement: 'featured',
    desktopColumn,
    background: blockBackground,
});
const background = (name: string): NonNullable<BlockPresentation['background']> => ({
    src: `${__V2_ASSETS_BASE__}/prospect-${name}-desktop.png`,
});
const introBackground = (): NonNullable<BlockPresentation['background']> => ({
    src: `${__V2_ASSETS_BASE__}/intro-greeting-desktop.png`,
});

export const PROSPECT_BLOCK_PRESENTATION = {
    club: featured('2', introBackground()),
    'welcome-bonus': list('1', background('coins')),
    manager: list('1', background('messenger')),
    'birthday-bonus': list('2', background('gift')),
    cashback: list('3', background('cashback')),
    'private-sales': list('3', background('offers')),
} satisfies Record<BlockId, BlockPresentation>;
