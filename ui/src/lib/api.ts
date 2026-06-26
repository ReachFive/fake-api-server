// API client — root-absolute paths work in dev (Vite proxy) and prod (same origin).
// Trailing slash on /version/ and /mock/ avoids serve-static 301 redirects.

export interface TwilioMessage {
    sid: string
    to: string
    from: string
    body: string
    date_created: string
}

export interface StoredRequest {
    query: Record<string, string>
    body: unknown
    headers: Record<string, string>
    server_date: string
    endpoint_name: string
    method: string
}

export type MockStore = Record<string, StoredRequest[]>

async function get<T>(path: string): Promise<T> {
    const res = await fetch(path, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
    return res.json() as Promise<T>
}

export const api = {
    version: () => get<{ version: string }>('/version/'),
    twilioMessages: () => get<TwilioMessage[]>('/twilio/messages'),
    mocks: () => get<MockStore>('/mock/'),
    mockByName: (name: string) => get<StoredRequest[]>(`/mock/${encodeURIComponent(name)}`),
}
