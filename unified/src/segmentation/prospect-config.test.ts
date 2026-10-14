import {describe, expect, it} from 'vitest';
import {getSegmentConfig, SEGMENT_CONTENT} from './prospect-config';

describe('prospect segmentation', () => {
    it('открывает оформление карты для всех сегментов', () => {
        for (const content of Object.values(SEGMENT_CONTENT)) {
            expect(content.club.action.type).toBe('activate-card');
        }
    });

    it('ограничивает закрытые акции участниками клуба', () => {
        const block = getSegmentConfig('new-client').blocks.find(({id}) => id === 'private-sales');

        expect(block?.description).toBe('Только для\u00a0участников клуба');
    });

    it.each([
        ['new-client', 'L7C9597QDX0ZTK3J1FARHS321SFLMWQ640RK1N3G4LA3UHP99MEWEOXFDIMNPH5'],
        ['regular-1', 'BYWXFE5GG4A2YSHDWVY9RNP525TONI3ANLAB51Q2X4OC4W3DPIKW8S9QWSUCK9F'],
        ['regular-2', 'ME608I6I76IQCD7ZQ8941G6EPWVC31EOMLSXK46ZJPIXMST9AO4QOWPOWFBD06T'],
        ['regular-3', 'JN53CKMQHT7RU26B02EW9V7P3SK2LTPNAOT9UE5ZW2S5OXDEAOTSQSNA9WZ68E2'],
    ] as const)('передаёт промокод сегмента %s', (segmentId, promo) => {
        expect(SEGMENT_CONTENT[segmentId].club.action).toEqual({
            label: 'Оформить карту',
            type: 'activate-card',
            promo,
        });
    });
});
