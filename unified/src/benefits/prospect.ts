import {requestCardActivation} from '@/card-activation/card-activation';
import {getSegmentConfig} from '@/segmentation/prospect-config';
import type {SegmentId} from '@/segmentation/prospect.types';
import {renderSegment} from './prospect/render-segment';

export interface BootstrapOptions {
  container: HTMLElement;
  segmentId: SegmentId;
  showTitle?: boolean;
}

export function renderProspectBenefits({ container, segmentId, showTitle = true }: BootstrapOptions): void {
  container.replaceChildren(renderSegment(getSegmentConfig(segmentId), requestCardActivation, showTitle));
}
