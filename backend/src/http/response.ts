class HttpResponse {

    public static success(data: any, code: number = 200) {
        return new Response(JSON.stringify(data), {
            status: code,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        })
    }

    public static error(message: string, code: number = 400) {
        return new Response(JSON.stringify({ error: message }), {
            status: code,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        })
    }

}

export default HttpResponse;
export type { HttpResponse };