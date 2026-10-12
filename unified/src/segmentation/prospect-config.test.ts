import {describe, expect, it} from 'vitest';
import {getSegmentConfig, SEGMENT_CONTENT} from './prospect-config';

describe('SEGMENT_CONTENT', () => {
    it('открывает форму только для новых клиентов', () => {
        expect(SEGMENT_CONTENT['new-client'].club.action).toMatchObject({
            type: 'activate-card',
        });
    });

    it('помечает закрытые акции как доступные только участникам клуба', () => {
        const block = getSegmentConfig('new-client').blocks.find(({id}) => id === 'private-sales');

        expect(block?.description).toBe('Только для\u00a0участников клуба');
    });

    it('использует сегментные условия акций из общего JSON', () => {
        const blocks = getSegmentConfig('new-client').blocks;

        expect(blocks.find(({id}) => id === 'birthday-bonus')?.tooltip?.content[0]).toContain(
            'Начисление: за 90 дней до Дня рождения',
        );
        expect(blocks.find(({id}) => id === 'welcome-bonus')?.tooltip?.content).toContain(
            'Условие списания: не больше 2% от стоимости тура',
        );
    });

    it.each([
        ['regular-1', 'BYWXFE5GG4A2YSHDWVY9RNP525TONI3ANLAB51Q2X4OC4W3DPIKW8S9QWSUCK9F'],
        ['regular-2', 'ME608I6I76IQCD7ZQ8941G6EPWVC31EOMLSXK46ZJPIXMST9AO4QOWPOWFBD06T'],
        ['regular-3', 'JN53CKMQHT7RU26B02EW9V7P3SK2LTPNAOT9UE5ZW2S5OXDEAOTSQSNA9WZ68E2'],
    ] as const)('использует реферальную ссылку для %s', (segmentId, promo) => {
        expect(SEGMENT_CONTENT[segmentId].club.action).toEqual({
            label: 'Оформить карту',
            type: 'referral-link',
            href: `https://coralbonus.ru/registration?promo=${promo}`,
        });
    });
});
