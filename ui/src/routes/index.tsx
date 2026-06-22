import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/')({
    component: IndexPage,
})

type Variant = 'default' | 'secondary' | 'outline' | 'destructive'

const METHOD_VARIANT: Record<string, Variant> = {
    GET: 'outline',
    POST: 'default',
    ANY: 'secondary',
}

function MethodBadge({ method }: { method: string }) {
    return (
        <Badge variant={METHOD_VARIANT[method] ?? 'outline'} className="shrink-0 font-mono">
            {method}
        </Badge>
    )
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">
            <code>{children}</code>
        </pre>
    )
}

function EndpointRow({ method, path, description }: { method: string; path: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <MethodBadge method={method} />
            <div className="flex flex-col gap-0.5 min-w-0">
                <code className="text-xs">{path}</code>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}

function IndexPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Inspect captured Twilio messages and mock HTTP requests.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold">Quick Start</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Common patterns for integration tests. All data is in-memory and resets on server restart.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Mock Record &amp; Replay</CardTitle>
                        <CardDescription>
                            Pre-configure responses, point your app at the mock, then inspect what it sent.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <EndpointRow
                                method="POST"
                                path="/mock/:name/response"
                                description="Configure the canned response to return"
                            />
                            <EndpointRow
                                method="ANY"
                                path="/mock/:name/request"
                                description="Call from your app — records the request, returns the response"
                            />
                            <EndpointRow
                                method="GET"
                                path="/mock/:name"
                                description="Inspect captured requests (newest-first)"
                            />
                        </div>
                        <Separator />
                        <CodeBlock>{`# 1. Configure the response
curl -X POST http://localhost:1090/mock/my-api/response \\
  -H 'Content-Type: application/json' \\
  -d '{"status":200,"payload":{"id":"abc123"}}'

# 2. Your app calls the mock (any HTTP method)
curl http://localhost:1090/mock/my-api/request

# 3. Assert what your app sent
curl http://localhost:1090/mock/my-api`}</CodeBlock>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Twilio Messages</CardTitle>
                        <CardDescription>
                            Simulate inbound SMS messages and assert on outbound sends in tests.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <EndpointRow
                                method="POST"
                                path="/twilio/messages"
                                description="Store a fake inbound SMS (form-encoded: To, From, Body)"
                            />
                            <EndpointRow
                                method="GET"
                                path="/twilio/messages"
                                description="List messages — filter with ?to=, ?from=, ?since=, ?until="
                            />
                        </div>
                        <Separator />
                        <CodeBlock>{`# Simulate an inbound SMS
curl -X POST http://localhost:1090/twilio/messages \\
  -d 'To=%2B15550001&From=%2B15550002&Body=Hello!'

# Assert your app received it
curl 'http://localhost:1090/twilio/messages?to=%2B15550001'`}</CodeBlock>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
