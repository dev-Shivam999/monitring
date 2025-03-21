interface AttackConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    numRequests: number;
    data?: any;
    headers?: Record<string, string>;
}

export async function makeMultipleRequests(config: AttackConfig): Promise<void> {
    const { url, method, numRequests, data, headers } = config;

    console.log(`Starting ${numRequests} simultaneous requests to ${url}`);

    const requests = Array(numRequests).fill(null).map((_, index) =>
        fetch(url, {
            method,
            headers: headers ? new Headers(headers) : undefined,
            body: data ? JSON.stringify(data) : undefined
        })
            .then(response => {
                console.log(`Request ${index + 1}/${numRequests} - Status: ${response.status}`);
            })
            .catch((error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error(`Request ${index + 1}/${numRequests} failed:`, errorMessage);
            })
    );

    await Promise.all(requests);
    console.log('All requests completed');
}



