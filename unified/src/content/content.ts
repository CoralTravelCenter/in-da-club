import {typographed} from '@/shared/runtime/typography';
import type {ContentConfig, TooltipContentItem} from './content.types';

export const content = {
    common: {
        clubTitle: typographed`Клуб «Море возможностей»`,
        fallbackDisplayName: typographed`Имя, фамилия`,
        links: {
            club: '/coralbonus/club/',
        },
        tooltip: {
            openLabel: typographed`Показать дополнительную информацию`,
            closeLabel: typographed`Закрыть подсказку`,
        },
        loading: {
            benefitsLabel: typographed`Загрузка преимуществ клуба`,
        },
        error: {
            title: 'Не удалось загрузить данные клуба',
            description: 'Попробуйте ещё раз.<br> Если ошибка повторится, обновите страницу позже.',
            retry: 'Повторить',
        },
    },
    prospect: {
        segmentTitle: typographed`Клуб «Море возможностей»`,
        otherBenefitsLabel: typographed`Другие преимущества клуба`,
        segments: {
            newClient: typographed`Преимущества нового клиента`,
            regular1: typographed`Преимущества постоянного клиента, уровень 1`,
            regular2: typographed`Преимущества постоянного клиента, уровень 2`,
            regular3: typographed`Преимущества постоянного клиента, уровень 3`,
        },
        blocks: {
            newClientBonus: typographed`5 000`,
            regularClientBonus: typographed`10 000`,
            welcomeBonus: typographed`Приветственных бонусов`,
            regularWelcomeBonus: typographed`Приветственные бонусы<br> для новых держателей карты`,
            activateCard: typographed`Оформить карту`,
            cashback: typographed`Кешбэк бонусами<br> за каждое бронирование`,
            clubTitle: typographed`Вступайте в клуб «Море возможностей»`,
            clubDescription: typographed`Получайте больше привилегий<br> на отдых`,
            upTo: typographed`до`,
            birthdayBonus: typographed`Бонусов<br> на День рождения`,
            privateSalesTitle: typographed`Закрытые акции`,
            privateSalesMembersOnly: typographed`Только для участников клуба`,
            privateSalesEarlyAccess: typographed`Досрочный доступ<br> к предложениям`,
            managerTitle: typographed`Персональный менеджер`,
            managerDescription: typographed`Всегда на связи с вами`,
        },
    },
    member: {
        segmentLabels: {
            inactive: typographed`Преимущества клуба для неактивного клиента`,
            active: typographed`Преимущества клуба для держателя карты`,
        },
        blocks: {
            cardLevel: typographed`Уровень карты CoralBonus`,
            cardLevelWithBreak: typographed`Уровень карты<br>CoralBonus`,
            birthdayBonus: typographed`Бонусов на День рождения`,
            birthdayBonusWithBreak: typographed`Бонусов<br>на День рождения`,
            clubLaunch: typographed`Бонусов<br>в честь запуска клуба`,
            clubLaunchAlternate: typographed`Бонусов в честь<br>запуска Клуба`,
            clubLaunchLowercase: typographed`Бонусов в честь<br>запуска клуба`,
            cashback: typographed`Кешбэк бонусами за каждое бронирование`,
            cashbackWithBreak: typographed`Кешбэк бонусами<br>за каждое бронирование`,
            cashbackIncreased: typographed`Повышенный кешбэк бонусами`,
            upTo: typographed`до`,
            managerTitle: typographed`Персональный менеджер`,
            managerTitleWithBreak: typographed`Персональный<br>менеджер`,
            managerDescription: typographed`Всегда на связи с вами`,
            managerDescriptionWithBreak: typographed`Всегда на связи<br>с вами`,
            privateSalesTitle: typographed`Закрытые акции`,
            privateSalesDescription: typographed`Досрочный доступ к предложениям`,
            privateSalesDescriptionWithBreak: typographed`Досрочный доступ<br>к предложениям`,
            privateSalesAction: typographed`Смотреть`,
            inactiveGreetingNamed: typographed`,<br>скучаем по вам!`,
            inactiveGreetingFallback: typographed`Скучаем по вам`,
            inactiveDescription: typographed`Как насчёт отправиться<br>в путешествие?`,
            chooseTour: typographed`Выбрать тур`,
            welcomeBonusValue: typographed`5 000`,
            welcomeBonusDescription: typographed`Приветственных бонусов`,
            joinedClub: typographed`<br>теперь вы в клубе<br>«Море возможностей»!`,
            allAvailablePrefix: typographed`Вам доступны<br>`,
            privilegesReady: typographed`Ваши привилегии готовы<br>к использованию`,
            all: typographed`все`,
            privilegesSuffix: '\u00a0привилегии',
            travelMore: typographed`Путешествуйте больше`,
            travelMoreLevel: typographed`Путешествуйте больше —<br>повышайте уровень карты`,
            balance: typographed`Бонусов на карте`,
            congratulations: typographed`Поздравляем,<br>`,
            reachedLevel: typographed`Вы достигли уровня карты`,
            travelOften: typographed`Путешествуйте чаще —`,
            keepLevel: typographed`сохраняйте уровень карты<br>и привилегии`,
            moreTravel: typographed`Больше путешествий —`,
            openPrivileges: typographed`выше уровень карты. Откройте<br>расширенные привилегии клуба<br>«Море возможностей»`,
            availableToSpend: typographed`Доступно к списанию`,
            exceptionalClient: typographed`<br>вы — исключительный<br>клиент для нас!`,
            allPrivileges: typographed`Вам доступны все привилегии<br>клуба «Море возможностей»`,
            accountAction: typographed`Войти в личный кабинет`,
            individualApproach: typographed`Индивидуальный подход`,
            bookingsPriority: typographed`Ваши бронирования —<br>в приоритете для нас`,
        },
        links: {
            offers: '/poleznaya-informatsiya/offers/more-vozmozhnostej/',
            tours: '/',
            account: '/account/',
        },
    },
    activation: {
        steps: {
            label: typographed`Шаг`,
            of: typographed`из`,
            separator: '\u00a0',
        },
        dialog: {
            title: typographed`Оформление карты`,
            close: typographed`Закрыть`,
            existingCard: typographed`У вас уже есть карта CoralBonus`,
            loadingCard: typographed`Загружаем данные карты…`,
            activated: typographed`Карта активирована`,
            verification: typographed`Введите код из SMS`,
            refreshFailed: typographed`Не удалось обновить данные карты`,
        },
        registration: {
            title: typographed`Оформление карты`,
            surname: typographed`Фамилия`,
            name: typographed`Имя`,
            gender: typographed`Пол`,
            genderMale: typographed`М`,
            genderFemale: typographed`Ж`,
            birthdate: typographed`Дата рождения`,
            birthdatePlaceholder: typographed`ДД / ММ / ГГГГ`,
            city: typographed`Город`,
            email: typographed`Электронная почта`,
            phone: typographed`Телефон`,
            personalConsent: typographed`Даю согласие на обработку персональных данных.`,
            personalPolicy: typographed`Политика обработки персональных данных`,
            loyaltyConsentPrefix: typographed`Ознакомлен и согласен с`,
            loyaltyRules: typographed`Правилами Программы лояльности`,
            offersConsent: typographed`Даю согласие на получение новостей, акций, специальных предложений, в том числе по турам.`,
            submit: typographed`Получить код по SMS`,
            submitting: typographed`Отправляем код…`,
        },
        validation: {
            surnameRequired: typographed`Укажите фамилию`,
            nameRequired: typographed`Укажите имя`,
            genderRequired: typographed`Выберите пол`,
            birthdateRequired: typographed`Укажите дату рождения`,
            cityRequired: typographed`Укажите город`,
            emailRequired: typographed`Укажите электронную почту`,
            phoneRequired: typographed`Укажите телефон`,
            personalConsentRequired: typographed`Подтвердите согласие на обработку персональных данных`,
            loyaltyConsentRequired: typographed`Подтвердите согласие с правилами программы`,
            birthdateInvalid: typographed`Укажите корректную дату рождения`,
            cityInvalid: typographed`Укажите город из списка`,
            emailInvalid: typographed`Укажите корректную электронную почту`,
            phoneInvalid: typographed`Укажите корректный номер телефона`,
            codeInvalid: typographed`Введите код из 6 цифр`,
        },
        verification: {
            title: typographed`Введите код из SMS`,
            sentTo: typographed`Отправили код активации на номер`,
            codeLabel: typographed`Код из SMS`,
            digitLabel: typographed`Цифра`,
            activate: typographed`Активировать`,
            activating: typographed`Активируем карту…`,
            resendCountdown: typographed`Отправить код повторно через`,
            resend: typographed`Отправить код повторно`,
            resending: typographed`Отправляем код…`,
        },
        result: {
            successTitle: typographed`Карта активирована!`,
            levelPrefix: typographed`Ваш уровень —`,
            cashback: typographed`кешбэк`,
            cashbackSuffix: typographed`с каждой покупки`,
            chooseTour: typographed`Подобрать тур`,
            failureTitle: typographed`Что-то пошло не так…`,
            failureDescription: typographed`Пожалуйста, попробуйте обновить страницу`,
            existingCardTitle: typographed`У вас уже есть карта CoralBonus`,
            tripBalance: typographed`Бонусы за поездки:`,
            promoBalance: typographed`Акционные бонусы:`,
            cardAlt: typographed`Карта CoralBonus`,
        },
        errors: {
            request: typographed`Не удалось выполнить запрос. Попробуйте ещё раз`,
            register: typographed`Не удалось оформить карту`,
            sendCode: typographed`Не удалось отправить код. Проверьте подключение к интернету и попробуйте ещё раз`,
            activate: typographed`Неверный код или срок его действия истёк. Попробуйте ещё раз`,
            loadCard: typographed`Не удалось загрузить данные карты`,
            refreshCard: typographed`Не удалось обновить данные карты`,
            openVerification: typographed`Не удалось открыть шаг подтверждения`,
            resendCode: typographed`Не удалось отправить код повторно`,
            activateCard: typographed`Не удалось активировать карту`,
            loadConsents: typographed`Не удалось загрузить документы согласий`,
            saveConsents: typographed`Не удалось сохранить согласия`,
        },
        links: {
            personalConsent: 'https://b2ccdn.coral.ru/content/doc/cb/soglasie_na_obrabotku_personalynyh_dannyh_coralbonus.pdf',
            personalPolicy: 'https://b2ccdn.coral.ru/content/doc/cb/politika-obrabotki-persdannyh-coralbonus-24-09-25.pdf',
            loyaltyRules: 'https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf',
            offersConsent: 'https://b2ccdn.coral.ru/content/doc/cb/soglasie-na-rassylku-coralbonus-24-09-2025.pdf',
            tours: '/',
        },
    },
    promotionTerms: {
        noCard: {
            birthdayBonus: {
                title: typographed`Условия акции «Бонусы на день рождения»:`,
                content: [
                    {
                        label: typographed`Начисление бонусов:`,
                        text: typographed`за 90 дней до дня рождения. Новым участникам — после выпуска карты, но не ранее чем за 90 дней до дня рождения.`,
                    },
                    {
                        label: typographed`Действуют:`,
                        text: typographed`с момента начисления и ещё 14 дней после дня рождения.`
                    },
                    {label: typographed`Забронировать тур:`, text: typographed`до 31.12.2026.`},
                    {label: typographed`Дата начала тура:`, text: typographed`без ограничений.`},
                    {label: typographed`Минимальная стоимость тура:`, text: typographed`200 000 ₽.`},
                    {
                        label: typographed`Направления:`,
                        text: typographed`все страны, кроме России, стран СНГ, Абхазии и Грузии.`
                    },
                    {
                        label: typographed`До начала тура:`,
                        text: typographed`бронирование необходимо оформить не менее чем за 3 дня.`
                    },
                ] as TooltipContentItem[],
            },
            welcomeBonus: {
                title: typographed`Условия акции «Приветственные бонусы»:`,
                content: [
                    {label: typographed`Забронировать тур:`, text: typographed`до 31.12.2026.`},
                    {label: typographed`Дата начала тура:`, text: typographed`без ограничений.`},
                    {
                        label: typographed`Направления:`,
                        text: typographed`все страны, кроме России, стран СНГ, Абхазии и Грузии.`
                    },
                    {label: typographed`Бонусы действуют:`, text: typographed`90 дней.`},
                    {
                        label: typographed`До начала тура:`,
                        text: typographed`бронирование необходимо оформить не менее чем за 3 дня.`
                    },
                    {label: typographed`Оплата бонусами:`, text: typographed`до 2% стоимости тура.`},
                ] as TooltipContentItem[],
            },
        },
        cardholder: {
            birthdayBonus: {
                title: typographed`Условия акции «Бонусы на день рождения»:`,
                content: [
                    {
                        label: typographed`Начисление бонусов:`,
                        text: typographed`за 90 дней до дня рождения. Новым участникам — после выпуска карты, но не ранее чем за 90 дней до дня рождения.`,
                    },
                    {
                        label: typographed`Действуют:`,
                        text: typographed`с момента начисления и ещё 14 дней после дня рождения.`
                    },
                    {label: typographed`Забронировать тур:`, text: typographed`до 31.12.2026.`},
                    {label: typographed`Дата начала тура:`, text: typographed`без ограничений.`},
                    {label: typographed`Минимальная стоимость тура:`, text: typographed`200 000 ₽.`},
                    {
                        label: typographed`Направления:`,
                        text: typographed`все страны, кроме России, стран СНГ, Абхазии и Грузии.`
                    },
                    {
                        label: typographed`До начала тура:`,
                        text: typographed`бронирование необходимо оформить не менее чем за 3 дня.`
                    },
                ] as TooltipContentItem[],
            },
            clubLaunchBonus: {
                title: typographed`Условия акции «Бонусы в честь запуска клуба»:`,
                content: [
                    {label: typographed`Активировать карту:`, text: typographed`до 31.12.2026.`},
                    {label: typographed`Забронировать тур:`, text: typographed`до 31.12.2026.`},
                    {label: typographed`Дата начала тура:`, text: typographed`без ограничений.`},
                    {
                        label: typographed`Направления:`,
                        text: typographed`все страны, кроме России, стран СНГ, Абхазии и Грузии.`
                    },
                    {label: typographed`Бонусы действуют:`, text: typographed`180 дней.`},
                    {
                        label: typographed`До начала тура:`,
                        text: typographed`бронирование необходимо оформить не менее чем за 3 дня.`
                    },
                    {label: typographed`Оплата бонусами:`, text: typographed`до 2% стоимости тура.`},
                ] as TooltipContentItem[],
            },
            welcomeBonus: {
                title: typographed`Условия акции «Приветственные бонусы»:`,
                content: [
                    {label: typographed`Активировать карту:`, text: typographed`с 01.07.2026 по 31.12.2026.`},
                    {label: typographed`Забронировать тур:`, text: typographed`с 01.07.2026 по 31.12.2026.`},
                    {label: typographed`Дата начала тура:`, text: typographed`с 03.07.2026, далее без ограничений.`},
                    {
                        label: typographed`Направления:`,
                        text: typographed`все страны, кроме России, стран СНГ, Абхазии и Грузии.`
                    },
                    {label: typographed`Бонусы действуют:`, text: typographed`90 дней.`},
                    {
                        label: typographed`До начала тура:`,
                        text: typographed`бронирование необходимо оформить не менее чем за 3 дня.`
                    },
                ] as TooltipContentItem[],
            },
        },
    },
} as const satisfies ContentConfig;
