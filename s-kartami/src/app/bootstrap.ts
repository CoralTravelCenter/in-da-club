import {renderSegment} from '@/blocks/render-segment';
import {getCachedCustomerContext, getCustomerContext} from '@/segments/customer-context';
import {getSegmentConfig} from '@/segments/segment.config';
import type {SegmentConfig, SegmentId} from '@/segments/segment.types';
export interface BootstrapOptions { container: HTMLElement; segmentId: SegmentId; }

const API_DEPENDENT_BLOCKS: Record<SegmentId, ReadonlySet<string>> = {
    inactive: new Set(['card-level', 'cashback']),
    'one-trip': new Set(['cashback', 'card-level', 'travel-more']),
    'two-trips': new Set(['cashback', 'card-level']),
    'three-plus': new Set(['cashback', 'card-level']),
};

function withLoadingBlocks(config: SegmentConfig, shouldLoadDisplayName: boolean): SegmentConfig {
    const dependentBlocks = API_DEPENDENT_BLOCKS[config.id];
    return {
        ...config,
        blocks: config.blocks.map((block) => dependentBlocks.has(block.id) || (shouldLoadDisplayName && block.id === 'greeting')
            ? {...block, isLoading: true}
            : block),
    };
}

export async function bootstrap({container, segmentId}: BootstrapOptions): Promise<void> {
    const cached = getCachedCustomerContext();
    const initialConfig = getSegmentConfig(segmentId, cached.customer);

    container.replaceChildren(renderSegment(
        cached.shouldRequestBonusProfile
            ? withLoadingBlocks(initialConfig, !cached.hasDisplayName)
            : initialConfig,
    ));

    if (!cached.shouldRequestBonusProfile) return;

    const customer = await getCustomerContext();
    container.replaceChildren(renderSegment(getSegmentConfig(segmentId, customer)));
}
