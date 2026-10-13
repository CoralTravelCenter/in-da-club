import {getMemberBlockPresentation, memberMedia} from './member-presentation';
import type {CardLevel, ContentBlockConfig, ContentBlockDefinition, CustomerContext, SegmentConfig, SegmentId} from './member.types';
import {content} from '@/content/content';

const INACTIVE_CLIENT_MEDIA = __INTRO_ASSETS_BASE__;
const CASHBACK: Record<CardLevel, number> = {Silver: 1, Gold: 2, Platinum: 3};
const BIRTHDAY_TOOLTIP = content.promotionTerms.cardholder.birthdayBonus;
const CLUB_LAUNCH_TOOLTIP = content.promotionTerms.cardholder.clubLaunchBonus;
const WELCOME_TOOLTIP = content.promotionTerms.cardholder.welcomeBonus;
const copy = content.member.blocks;

function cardBlock(level: CardLevel): ContentBlockDefinition {
    return {id: 'card-level', badge: level, description: copy.cardLevel};
}
function birthdayBlock(): ContentBlockDefinition {
    return {id: 'birthday-bonus', value: content.prospect.blocks.regularClientBonus, description: copy.birthdayBonus, tooltip: BIRTHDAY_TOOLTIP};
}
function clubLaunchBlock(description: string): ContentBlockDefinition {
    return {id: 'club-launch', value: content.prospect.blocks.regularClientBonus, description, tooltip: CLUB_LAUNCH_TOOLTIP};
}
function cashbackBlock(level: CardLevel, inactive = false): ContentBlockDefinition {
    return {id: 'cashback', value: `${inactive ? 3 : CASHBACK[level]}%`, valuePrefix: inactive ? copy.upTo : undefined, description: inactive ? copy.cashback : level === 'Platinum' ? copy.cashbackIncreased : copy.cashback};
}
const managerBlock: ContentBlockDefinition = {id: 'manager', title: copy.managerTitle, description: copy.managerDescription};
const privateSalesBlock: ContentBlockDefinition = {
    id: 'private-sales',
    title: copy.privateSalesTitle,
    description: copy.privateSalesDescription,
    action: {label: copy.privateSalesAction, href: content.member.links.offers},
};

function inactiveBlocks(customer: CustomerContext): ContentBlockDefinition[] {
    const hasDisplayName = customer.displayName !== content.common.fallbackDisplayName;

    return [
        {
            id: 'greeting',
            title: hasDisplayName ? copy.inactiveGreetingNamed : copy.inactiveGreetingFallback,
            titleAccent: hasDisplayName ? customer.displayName : undefined,
            description: copy.inactiveDescription,
            action: {label: copy.chooseTour, href: content.member.links.tours},
            media: {
                type: 'video',
                variant: 'diamond',
                src: `${INACTIVE_CLIENT_MEDIA}/club.webm`,
                safariSrc: `${INACTIVE_CLIENT_MEDIA}/club.mov`,
            },
        },
        {id: 'welcome-bonus', value: copy.welcomeBonusValue, description: copy.welcomeBonusDescription, tooltip: WELCOME_TOOLTIP},
        cardBlock(customer.cardLevel), managerBlock, cashbackBlock(customer.cardLevel, true), birthdayBlock(), privateSalesBlock,
    ];
}
function oneTripBlocks(customer: CustomerContext): ContentBlockDefinition[] {
    return [
        {...birthdayBlock(), description: copy.birthdayBonusWithBreak},
        {
            id: 'greeting',
            titleAccent: `${customer.displayName},`,
            title: copy.joinedClub,
            description: customer.cardLevel === 'Platinum'
                ? copy.allAvailablePrefix
                : copy.privilegesReady,
            descriptionAccent: customer.cardLevel === 'Platinum' ? copy.all : undefined,
            descriptionSuffix: customer.cardLevel === 'Platinum' ? copy.privilegesSuffix : undefined,
            media: {
                type: 'video',
                variant: 'shell',
                src: memberMedia('one-trip', 'shell.webm'),
                safariSrc: memberMedia('one-trip', 'shell.mov'),
            },
        },
        clubLaunchBlock(copy.clubLaunch),
        {...cashbackBlock(customer.cardLevel), description: copy.cashbackWithBreak},
        {...cardBlock(customer.cardLevel), description: copy.cardLevelWithBreak},
        {
            id: 'travel-more',
            title: customer.cardLevel === 'Platinum'
                ? copy.travelMore
                : copy.travelMoreLevel,
            description: '',
        },
    ];
}
function activeBlocks(customer: CustomerContext, isThreePlus: boolean): ContentBlockDefinition[] {
    if (!isThreePlus) {
        const cardLevel = customer.cardLevel === 'Silver' ? 'Gold' : customer.cardLevel;

        return [
            {id: 'balance', description: copy.balance},
            {
                id: 'greeting',
                title: copy.congratulations,
                titleAccent: `${customer.displayName}!`,
                titleAccentAfter: true,
                description: copy.reachedLevel,
                descriptionStrong: cardLevel,
                media: {
                    type: 'video',
                    variant: 'wave',
                    src: memberMedia('two-trips', 'wave.webm'),
                    safariSrc: memberMedia('two-trips', 'wave.mov'),
                },
            },
            {...cashbackBlock(cardLevel), description: copy.cashbackWithBreak},
            clubLaunchBlock(copy.clubLaunchAlternate),
            {...cardBlock(cardLevel), description: copy.cardLevelWithBreak},
            birthdayBlock(),
            {...managerBlock, title: copy.managerTitleWithBreak, description: copy.managerDescriptionWithBreak},
            {...privateSalesBlock, description: copy.privateSalesDescriptionWithBreak},
            cardLevel === 'Platinum' ? {
                id: 'travel-more',
                title: copy.travelOften,
                description: copy.keepLevel,
            } : {
                id: 'travel-more',
                title: copy.moreTravel,
                description: copy.openPrivileges,
            },
        ];
    }

    const cardLevel: CardLevel = 'Platinum';

    return [
        {id: 'balance', description: copy.availableToSpend},
        {
            id: 'greeting',
            titleAccent: `${customer.displayName},`,
            title: copy.exceptionalClient,
            description: copy.allPrivileges,
            action: {label: copy.accountAction, href: content.member.links.account, target: '_blank'},
            media: {
                type: 'video',
                variant: 'pearl-shell',
                src: memberMedia('three-plus', 'pearl-shell.webm'),
                safariSrc: memberMedia('three-plus', 'pearl-shell.mov'),
            },
        },
        cashbackBlock(cardLevel),
        clubLaunchBlock(copy.clubLaunchLowercase),
        {...cardBlock(cardLevel), description: copy.cardLevelWithBreak},
        birthdayBlock(),
        {...managerBlock, title: copy.managerTitleWithBreak, description: copy.managerDescriptionWithBreak},
        {...privateSalesBlock, description: copy.privateSalesDescriptionWithBreak},
        {id: 'travel-more', title: copy.individualApproach, description: copy.bookingsPriority},
    ];
}

export function getSegmentConfig(id: SegmentId, customer: CustomerContext): SegmentConfig {
    const definitions = id === 'inactive' ? inactiveBlocks(customer) : id === 'one-trip' ? oneTripBlocks(customer) : activeBlocks(customer, id === 'three-plus');
    const blocks = definitions.map((block): ContentBlockConfig => {
        const presentation = getMemberBlockPresentation(id, block.id, block.badge as CardLevel | undefined);
        if (!presentation) throw new Error(`Не задано представление карточки ${block.id} для сегмента ${id}`);
        return {
            ...block,
            presentation,
        };
    });
    return {id, ariaLabel: id === 'inactive' ? content.member.segmentLabels.inactive : content.member.segmentLabels.active, blocks};
}
