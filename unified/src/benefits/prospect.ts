import {requestCardActivation} from '@/card-activation/card-activation';
import {getSegmentConfig} from '@/segmentation/prospect-config';
import type {SegmentId} from '@/segmentation/prospect.types';
import {renderSegment} from './prospect/render-segment';
import {replaceChildrenWithCleanup} from '@/shared/runtime/dom-lifecycle';

export interface BootstrapOptions {
  container: HTMLElement;
  segmentId: SegmentId;
  showTitle?: boolean;
}

export function renderProspectBenefits({ container, segmentId, showTitle = true }: BootstrapOptions): void {
  replaceChildrenWithCleanup(container, renderSegment(getSegmentConfig(segmentId), requestCardActivation, showTitle));
}
