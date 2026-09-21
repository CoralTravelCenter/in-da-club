const REQUEST_TIMEOUT_MS = 10_000;

function withTimeout(signal?: AbortSignal): AbortSignal {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

export async function request(
    url: string,
    init: RequestInit,
    errorMessage: string,
): Promise<Response> {
    try {
        const response = await fetch(url, {
            ...init,
            signal: withTimeout(init.signal ?? undefined),
        });

        if (!response.ok) throw new Error(errorMessage);
        return response;
    } catch (error) {
        if (error instanceof Error && error.message === errorMessage) throw error;
        throw new Error(errorMessage, {cause: error});
    }
}

export async function requestJson(
    url: string,
    init: RequestInit,
    errorMessage: string,
): Promise<unknown> {
    const response = await request(url, init, errorMessage);

    try {
        return await response.json() as unknown;
    } catch (error) {
        throw new Error(errorMessage, {cause: error});
    }
}
