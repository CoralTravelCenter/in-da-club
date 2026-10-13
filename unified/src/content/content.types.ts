type TextGroup<Key extends string> = Record<Key, string>;

export interface PromotionTerms {
    title: string;
    content: string[];
}

export interface ContentConfig {
    common: TextGroup<'clubTitle' | 'fallbackDisplayName'> & {
        tooltip: TextGroup<'openLabel' | 'closeLabel'>;
        loading: TextGroup<'benefitsLabel'>;
        error: TextGroup<'title' | 'description' | 'retry'>;
    };
    prospect: TextGroup<'segmentTitle' | 'otherBenefitsLabel'> & {
        segments: TextGroup<'newClient' | 'regular1' | 'regular2' | 'regular3'>;
        blocks: TextGroup<
            | 'newClientBonus' | 'regularClientBonus' | 'welcomeBonus' | 'regularWelcomeBonus'
            | 'activateCard' | 'cashback' | 'clubTitle' | 'clubDescription' | 'upTo'
            | 'birthdayBonus' | 'privateSalesTitle' | 'privateSalesMembersOnly'
            | 'privateSalesEarlyAccess' | 'managerTitle' | 'managerDescription'
        >;
    };
    member: {
        segmentLabels: TextGroup<'inactive' | 'active'>;
        blocks: TextGroup<
            | 'cardLevel' | 'cardLevelWithBreak' | 'birthdayBonus' | 'birthdayBonusWithBreak'
            | 'clubLaunch' | 'clubLaunchAlternate' | 'clubLaunchLowercase' | 'cashback'
            | 'cashbackWithBreak' | 'cashbackIncreased' | 'upTo' | 'managerTitle'
            | 'managerTitleWithBreak' | 'managerDescription' | 'managerDescriptionWithBreak'
            | 'privateSalesTitle' | 'privateSalesDescription' | 'privateSalesDescriptionWithBreak'
            | 'privateSalesAction' | 'inactiveGreetingNamed' | 'inactiveGreetingFallback'
            | 'inactiveDescription' | 'chooseTour' | 'welcomeBonusValue' | 'welcomeBonusDescription'
            | 'joinedClub' | 'allAvailablePrefix' | 'privilegesReady' | 'all' | 'privilegesSuffix'
            | 'travelMore' | 'travelMoreLevel' | 'balance' | 'congratulations' | 'reachedLevel'
            | 'travelOften' | 'keepLevel' | 'moreTravel' | 'openPrivileges' | 'availableToSpend'
            | 'exceptionalClient' | 'allPrivileges' | 'accountAction' | 'individualApproach'
            | 'bookingsPriority'
        >;
        links: TextGroup<'offers' | 'tours' | 'account'>;
    };
    activation: {
        steps: TextGroup<'label' | 'of' | 'separator'>;
        dialog: TextGroup<'title' | 'close' | 'existingCard' | 'loadingCard' | 'activated' | 'verification' | 'refreshFailed'>;
        registration: TextGroup<
            | 'title' | 'surname' | 'name' | 'gender' | 'genderMale' | 'genderFemale'
            | 'birthdate' | 'birthdatePlaceholder' | 'city' | 'email' | 'phone'
            | 'personalConsent' | 'personalPolicy' | 'loyaltyConsentPrefix' | 'loyaltyRules'
            | 'offersConsent' | 'submit' | 'submitting'
        >;
        validation: TextGroup<
            | 'surnameRequired' | 'nameRequired' | 'genderRequired' | 'birthdateRequired'
            | 'cityRequired' | 'emailRequired' | 'phoneRequired' | 'personalConsentRequired'
            | 'loyaltyConsentRequired' | 'birthdateInvalid' | 'cityInvalid' | 'emailInvalid'
            | 'phoneInvalid' | 'codeInvalid'
        >;
        verification: TextGroup<
            | 'title' | 'sentTo' | 'codeLabel' | 'digitLabel' | 'activate' | 'activating'
            | 'resendCountdown' | 'resend' | 'resending'
        >;
        result: TextGroup<
            | 'successTitle' | 'levelPrefix' | 'cashback' | 'cashbackSuffix' | 'chooseTour'
            | 'failureTitle' | 'failureDescription' | 'existingCardTitle' | 'tripBalance'
            | 'promoBalance' | 'cardAlt'
        >;
        errors: TextGroup<
            | 'request' | 'register' | 'sendCode' | 'activate' | 'loadCard' | 'refreshCard'
            | 'openVerification' | 'resendCode' | 'activateCard' | 'loadConsents' | 'saveConsents'
        >;
        links: TextGroup<'personalConsent' | 'personalPolicy' | 'loyaltyRules' | 'offersConsent' | 'tours'>;
    };
    promotionTerms: {
        noCard: Record<'birthdayBonus' | 'welcomeBonus', PromotionTerms>;
        cardholder: Record<'birthdayBonus' | 'clubLaunchBonus' | 'welcomeBonus', PromotionTerms>;
    };
}
