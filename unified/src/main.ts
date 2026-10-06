import {localStorage as reactiveLocalStorage} from 'reactive-localstorage';
import {bootstrap as bootstrapNewClient} from '../../bez-kart/src/app/bootstrap';
import {bootstrap as bootstrapCardholder} from '../../s-kartami/src/app/bootstrap';
import {requestBonusProfileStrict} from '../../s-kartami/src/segments/bonus-profile';
import {getCachedCustomerContext} from '../../s-kartami/src/segments/customer-context';
import {mountWhenAvailable} from '../../shared/runtime/mount-when-available';
import {createClientRouter} from './client-router';
import {requestReservationTripCount} from './reservation-api';
import {renderErrorState, renderLoadingState} from './render-state';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

mountWhenAvailable({
    selector: ROOT_SELECTOR,
    start: (container) => {
        const router = createClientRouter({
            storage: reactiveLocalStorage,
            getCachedCustomer: () => getCachedCustomerContext().customer,
            loadBonusProfile: requestBonusProfileStrict,
            loadReservationTripCount: requestReservationTripCount,
            logDisplayContext: (context) => {
                console.info('[in-da-club] display context', context);
            },
            renderLoading: () => {
                renderLoadingState(container, getCachedCustomerContext().customer);
            },
            renderError: (retry) => {
                renderErrorState(container, retry);
            },
            renderNoCard: (segmentId) => {
                bootstrapNewClient({container, segmentId});
            },
            renderCardholder: (segmentId, customerContext) => {
                void bootstrapCardholder({container, segmentId, customerContext});
            },
        });

        router.start();
    },
});
