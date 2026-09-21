import {describe, expect, it} from 'vitest';
import {getSegmentConfig} from './segment.config';

describe('getSegmentConfig', () => {
    it('показывает имя без скобок и убирает fallback из приветствия', () => {
        const namedGreeting = getSegmentConfig('inactive', {displayName: 'Анна Иванова', cardLevel: 'Silver'}).blocks[0];
        const fallbackGreeting = getSegmentConfig('inactive', {displayName: 'Имя, фамилия', cardLevel: 'Silver'}).blocks[0];

        expect(namedGreeting).toMatchObject({titleAccent: 'Анна Иванова', title: ', скучаем по\u00a0вам!'});
        expect(fallbackGreeting).toMatchObject({titleAccent: undefined, title: 'Скучаем по\u00a0вам'});
    });

    it('содержит полные условия акций', () => {
        const blocks = getSegmentConfig('inactive', {displayName: 'Анна', cardLevel: 'Silver'}).blocks;

        expect(blocks.find(({id}) => id === 'birthday-bonus')?.tooltip?.content).toHaveLength(7);
        expect(blocks.find(({id}) => id === 'welcome-bonus')?.tooltip?.content).toHaveLength(6);
    });

    it.each([['Silver', '1%'], ['Gold', '2%'], ['Platinum', '3%']] as const)('uses cashback for %s', (cardLevel, cashback) => {
        const config = getSegmentConfig('one-trip', {displayName: 'Анна', cardLevel});
        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe(cashback);
    });

    it('uses the three-plus copy for loyal clients', () => {
        const config = getSegmentConfig('three-plus', {displayName: 'Анна', cardLevel: 'Platinum'});
        expect(config.blocks.find(({id}) => id === 'greeting')?.title).toContain('исключительный<br>клиент');
    });

    it('always uses Platinum for clients with three or more trips', () => {
        const config = getSegmentConfig('three-plus', {displayName: 'Анна', cardLevel: 'Silver'});

        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('3%');
        expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Platinum');
        expect(config.blocks.find(({id}) => id === 'card-level')?.image?.src).toContain('card-pt-comp.webp');
    });

    it('uses Gold as the minimum card level for clients with two trips', () => {
        const config = getSegmentConfig('two-trips', {displayName: 'Анна', cardLevel: 'Silver'});

        expect(config.blocks.find(({id}) => id === 'greeting')?.description).toContain('Gold');
        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('2%');
        expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Gold');
        expect(config.blocks.find(({id}) => id === 'card-level')?.image?.src).toContain('card-au-comp.webp');
    });
});
