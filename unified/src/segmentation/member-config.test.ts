import {describe, expect, it} from 'vitest';
import {getSegmentConfig} from './member-config';

describe('getSegmentConfig', () => {
    it.each([['Silver', '1%'], ['Gold', '2%'], ['Platinum', '3%']] as const)(
        'использует кешбэк уровня %s',
        (cardLevel, cashback) => {
            const config = getSegmentConfig('one-trip', {displayName: 'Анна', cardLevel});

            expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe(cashback);
        },
    );

    it.each(['Silver', 'Gold', 'Platinum'] as const)(
        'назначает Platinum клиенту с тремя и более поездками независимо от исходного уровня %s',
        (cardLevel) => {
            const config = getSegmentConfig('three-plus', {displayName: 'Анна', cardLevel});

            expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('3%');
            expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Platinum');
        },
    );

    it('не подставляет статический баланс в конфигурацию клиента', () => {
        for (const segmentId of ['two-trips', 'three-plus'] as const) {
            const config = getSegmentConfig(segmentId, {displayName: 'Анна', cardLevel: 'Platinum'});

            expect(config.blocks.find(({id}) => id === 'balance')?.value).toBeUndefined();
        }
    });

    it('назначает Gold как минимальный уровень клиенту с двумя поездками', () => {
        const config = getSegmentConfig('two-trips', {displayName: 'Анна', cardLevel: 'Silver'});

        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('2%');
        expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Gold');
    });
});
