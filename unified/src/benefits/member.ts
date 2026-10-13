import {getCachedCustomerContext, getCustomerContext} from '@/customer/customer-context';
import {content} from '@/content/content';
import {getSegmentConfig} from '@/segmentation/member-config';
import type {CardLevel, CustomerContext, SegmentConfig, SegmentId} from '@/segmentation/member.types';
import {renderSegment} from './member/render-segment';
export interface BootstrapOptions {
    container: HTMLElement;
    segmentId: SegmentId;
    cardLevelOverride?: CardLevel;
    customerContext?: CustomerContext;
    accumulatedBalance?: number | null;
}

const API_DEPENDENT_BLOCKS: Record<SegmentId, ReadonlySet<string>> = {
    inactive: new Set(['card-level', 'cashback']),
    'one-trip': new Set(['cashback', 'card-level']),
    'two-trips': new Set(['cashback', 'card-level']),
    'three-plus': new Set(['cashback', 'card-level']),
};

function withLoadingBlocks(config: SegmentConfig, shouldLoadDisplayName: boolean): SegmentConfig {
    const dependentBlocks = API_DEPENDENT_BLOCKS[config.id];
    return {
        ...config,
        blocks: config.blocks.map((block) => {
            if (dependentBlocks.has(block.id)) return {...block, isLoading: true};
            if (!shouldLoadDisplayName || block.id !== 'greeting') return block;

            return config.id === 'inactive'
                ? {...block, isLoading: true, title: content.member.blocks.inactiveGreetingNamed, titleAccent: ''}
                : {...block, isLoading: true};
        }),
    };
}

function withCardLevelOverride(customer: CustomerContext, cardLevelOverride?: CardLevel): CustomerContext {
    return cardLevelOverride ? {...customer, cardLevel: cardLevelOverride} : customer;
}

function withAccumulatedBalance(config: SegmentConfig, accumulatedBalance?: number | null): SegmentConfig {
    if (config.id !== 'two-trips' && config.id !== 'three-plus') return config;

    const balance = accumulatedBalance === undefined ? 3_000 : accumulatedBalance ?? 0;

    return {
        ...config,
        blocks: config.blocks.map((block) => block.id === 'balance'
            ? {...block, value: new Intl.NumberFormat('ru-RU').format(balance)}
            : block),
    };
}

export async function renderMemberBenefits({container, segmentId, cardLevelOverride, customerContext, accumulatedBalance}: BootstrapOptions): Promise<void> {
    if (customerContext) {
        container.replaceChildren(renderSegment(withAccumulatedBalance(
            getSegmentConfig(segmentId, customerContext),
            accumulatedBalance,
        )));
        return;
    }

    const cached = getCachedCustomerContext();
    const initialConfig = withAccumulatedBalance(
        getSegmentConfig(segmentId, withCardLevelOverride(cached.customer, cardLevelOverride)),
    );

    container.replaceChildren(renderSegment(
        cached.shouldRequestBonusProfile
            ? withLoadingBlocks(initialConfig, !cached.hasDisplayName)
            : initialConfig,
    ));

    if (!cached.shouldRequestBonusProfile) return;

    const customer = await getCustomerContext();
    container.replaceChildren(renderSegment(withAccumulatedBalance(
        getSegmentConfig(segmentId, withCardLevelOverride(customer, cardLevelOverride)),
    )));
}
