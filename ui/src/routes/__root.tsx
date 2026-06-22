import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MessageSquareIcon, RadioIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const Route = createRootRoute({
    component: RootLayout,
})

const navLinks = [
    { to: '/twilio', label: 'Twilio', icon: MessageSquareIcon },
    { to: '/mock', label: 'Mock Requests', icon: RadioIcon },
] as const

function RootLayout() {
    const { data, isError } = useQuery({
        queryKey: ['version'],
        queryFn: api.version,
        staleTime: 60_000,
    })

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-sm">
                        <span className="inline-flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">F</span>
                        Fake API
                    </Link>
                    <nav className="flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                                    '[&.active]:bg-muted [&.active]:text-foreground',
                                )}
                                activeProps={{ className: 'active' }}
                            >
                                <Icon className="size-3.5" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto">
                        {isError && <Badge variant="destructive">Unreachable</Badge>}
                        {data && <Badge variant="outline">v{data.version}</Badge>}
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}
