import {localStorage as reactiveLocalStorage} from 'reactive-localstorage';
import {renderProspectBenefits} from '@/benefits/prospect';
import {renderMemberBenefits} from '@/benefits/member';
import {createMainBlockShowTracker} from '@/analytics/main-block-show';
import {requestBonusProfileStrict} from '@/customer/bonus-profile';
import {getCachedCustomerContext} from '@/customer/customer-context';
import {requestReservationTripCount} from '@/customer/reservation-api';
import {mountWhenAvailable} from '@/shared/runtime/mount-when-available';
import {createClientRouter} from './client-router';
import {getDevPreview} from './dev-preview';
import {renderErrorState, renderLoadingState, renderUnifiedShell} from './render-state';
import '@/styles/app.scss';

const ROOT_SELECTOR = import.meta.env.DEV
    ? '#monkey-app'
    : '[data-bez-kart-root]';

mountWhenAvailable({
    selector: ROOT_SELECTOR,
    start: (container) => {
        const content = renderUnifiedShell(container);
        const mainBlockShowTracker = createMainBlockShowTracker(container);
        if (import.meta.env.DEV) {
            const preview = getDevPreview(window.location.search);

            if (preview?.scenario === 'prospect') {
                renderProspectBenefits({container: content, segmentId: preview.segmentId, showTitle: false});
                return;
            }

            if (preview?.scenario === 'member') {
                void renderMemberBenefits({
                    container: content,
                    segmentId: preview.segmentId,
                    customerContext: getCachedCustomerContext().customer,
                    accumulatedBalance: null,
                });
                return;
            }
        }

        const router = createClientRouter({
            storage: reactiveLocalStorage,
            getCachedCustomer: () => getCachedCustomerContext().customer,
            loadBonusProfile: requestBonusProfileStrict,
            loadReservationTripCount: requestReservationTripCount,
            logDisplayContext: (context) => {
                console.info('[in-da-club] display context', context);
            },
            onDisplay: mainBlockShowTracker.track,
            renderLoading: () => {
                renderLoadingState(content, getCachedCustomerContext().customer);
            },
            renderError: (retry) => {
                renderErrorState(content, retry);
            },
            renderNoCard: (segmentId) => {
                renderProspectBenefits({container: content, segmentId, showTitle: false});
            },
            renderCardholder: (segmentId, customerContext, accumulatedBalance) => {
                void renderMemberBenefits({
                    container: content,
                    segmentId,
                    customerContext,
                    accumulatedBalance,
                });
            },
        });

        router.start();
    },
});
