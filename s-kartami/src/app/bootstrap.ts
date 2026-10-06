import {renderSegment} from '../blocks/render-segment';
import {getCachedCustomerContext, getCustomerContext} from '../segments/customer-context';
import {getSegmentConfig} from '../segments/segment.config';
import type {CardLevel, CustomerContext, SegmentConfig, SegmentId} from '../segments/segment.types';
export interface BootstrapOptions {
    container: HTMLElement;
    segmentId: SegmentId;
    cardLevelOverride?: CardLevel;
    customerContext?: CustomerContext;
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
                ? {...block, isLoading: true, title: ',<br>скучаем по вам!', titleAccent: ''}
                : {...block, isLoading: true};
        }),
    };
}

function withCardLevelOverride(customer: CustomerContext, cardLevelOverride?: CardLevel): CustomerContext {
    return cardLevelOverride ? {...customer, cardLevel: cardLevelOverride} : customer;
}

export async function bootstrap({container, segmentId, cardLevelOverride, customerContext}: BootstrapOptions): Promise<void> {
    if (customerContext) {
        container.replaceChildren(renderSegment(getSegmentConfig(segmentId, customerContext)));
        return;
    }

    const cached = getCachedCustomerContext();
    const initialConfig = getSegmentConfig(segmentId, withCardLevelOverride(cached.customer, cardLevelOverride));

    container.replaceChildren(renderSegment(
        cached.shouldRequestBonusProfile
            ? withLoadingBlocks(initialConfig, !cached.hasDisplayName)
            : initialConfig,
    ));

    if (!cached.shouldRequestBonusProfile) return;

    const customer = await getCustomerContext();
    container.replaceChildren(renderSegment(getSegmentConfig(segmentId, withCardLevelOverride(customer, cardLevelOverride))));
}
