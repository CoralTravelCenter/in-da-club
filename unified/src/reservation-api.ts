const TRANSACTIONS_URL = '/endpoints/Reservation/GetTransactions';
const TRANSACTIONS_TIMEOUT_MS = 5_000;

const REQUEST_BODY = {
    requestType: 1,
    paging: {
        pageNumber: 1,
        pageSize: 3,
    },
} as const;

function asTripCount(value: unknown): number | null {
    const count = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== ''
            ? Number(value)
            : Number.NaN;

    return Number.isFinite(count) && count >= 0 ? Math.trunc(count) : null;
}

export async function requestReservationTripCount(signal?: AbortSignal): Promise<number> {
    const timeoutSignal = AbortSignal.timeout(TRANSACTIONS_TIMEOUT_MS);
    const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
    const response = await fetch(TRANSACTIONS_URL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(REQUEST_BODY),
        signal: requestSignal,
    });

    if (!response.ok) {
        throw Object.assign(new Error('GetTransactions request failed'), {status: response.status});
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('GetTransactions response is invalid');
    }

    const result = (payload as {result?: unknown}).result;
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        throw new Error('GetTransactions result is invalid');
    }

    const customerStats = (result as {customerStats?: unknown}).customerStats;
    if (!customerStats || typeof customerStats !== 'object' || Array.isArray(customerStats)) {
        throw new Error('GetTransactions customerStats is invalid');
    }

    const myTrips = (customerStats as {myTrips?: unknown}).myTrips;
    if (!myTrips || typeof myTrips !== 'object' || Array.isArray(myTrips)) {
        throw new Error('GetTransactions myTrips is invalid');
    }

    const count = asTripCount((myTrips as {count?: unknown}).count);
    if (count === null) throw new Error('GetTransactions trip count is invalid');
    return count;
}
