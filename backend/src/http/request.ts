class HttpRequest {
    private request: Request;
    private url: URL;
    private params: Record<string, string> = {};

    constructor(request: Request) {
        this.request = request;
        this.url = new URL(request.url);
    }

    public get method(): string {
        return this.request.method.toUpperCase();
    }

    public get path(): string {
        return this.url.pathname;
    }

    public get query(): URLSearchParams {
        return this.url.searchParams;
    }

    public get urlParams(): Record<string, string> {
        return { ...this.params };
    }

    public setParams(params: Record<string, string>): void {
        this.params = { ...params };
    }

    public get headers(): Headers {
        return this.request.headers;
    }

    public async json<T = unknown>(): Promise<T> {
        try {
            const data = await this.request.json();
            return data as T;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error('Invalid JSON payload');
        }
    }
}

export default HttpRequest;
export type { HttpRequest };