import type {SegmentId as MemberSegmentId} from '@/segmentation/member.types';
import type {SegmentId as ProspectSegmentId} from '@/segmentation/prospect.types';

const PROSPECT_SEGMENTS: Record<string, ProspectSegmentId> = {
    '0': 'new-client',
    '1': 'regular-1',
    '2': 'regular-2',
    '3': 'regular-3',
};

const MEMBER_SEGMENTS: Record<string, MemberSegmentId> = {
    '0': 'inactive',
    '1': 'one-trip',
    '2': 'two-trips',
    '3': 'three-plus',
};

export type DevPreview = {
    scenario: 'prospect';
    segmentId: ProspectSegmentId;
} | {
    scenario: 'member';
    segmentId: MemberSegmentId;
};

export function getDevPreview(search: string): DevPreview | null {
    const params = new URLSearchParams(search);
    const memberSegment = MEMBER_SEGMENTS[params.get('ride') ?? ''];
    if (memberSegment) return {scenario: 'member', segmentId: memberSegment};

    const prospectSegment = PROSPECT_SEGMENTS[params.get('cb_client') ?? ''];
    if (prospectSegment) return {scenario: 'prospect', segmentId: prospectSegment};

    return null;
}
