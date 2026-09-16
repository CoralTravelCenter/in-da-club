import { renderSegment } from '../blocks/render-segment';
import { getSegmentConfig } from '../segments/segment.config';
import type { SegmentId } from '../segments/segment.types';

export interface BootstrapOptions {
  container: HTMLElement;
  segmentId: SegmentId;
}

export function bootstrap({ container, segmentId }: BootstrapOptions): void {
  container.replaceChildren(renderSegment(getSegmentConfig(segmentId)));
}
