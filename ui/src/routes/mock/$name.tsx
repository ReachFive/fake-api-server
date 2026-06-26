import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react'
import { api, type StoredRequest } from '@/lib/api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/mock/$name')({
    component: MockByNamePage,
})

const methodVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    GET: 'outline',
    POST: 'default',
    PUT: 'secondary',
    PATCH: 'secondary',
    DELETE: 'destructive',
}

const columns: ColumnDef<StoredRequest>[] = [
    {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => (
            <Badge variant={methodVariant[row.original.method] ?? 'outline'}>
                {row.original.method}
            </Badge>
        ),
    },
    {
        accessorKey: 'server_date',
        header: 'Date',
        cell: ({ row }) => (
            <span className="whitespace-nowrap text-sm">
                {new Date(row.original.server_date).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                })}
            </span>
        ),
    },
    {
        id: 'query',
        header: 'Query',
        cell: ({ row }) => {
            const keys = Object.keys(row.original.query ?? {})
            return keys.length > 0
                ? <span className="font-mono text-xs text-muted-foreground">{keys.join(', ')}</span>
                : <span className="text-muted-foreground">—</span>
        },
    },
    {
        id: 'body',
        header: 'Body',
        cell: ({ row }) => {
            const body = row.original.body
            if (!body || (typeof body === 'object' && Object.keys(body as object).length === 0)) {
                return <span className="text-muted-foreground">—</span>
            }
            const preview = JSON.stringify(body).slice(0, 60)
            return <span className="font-mono text-xs">{preview}…</span>
        },
    },
]

function MockByNamePage() {
    const { name } = Route.useParams()
    const [selected, setSelected] = useState<StoredRequest | null>(null)

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['mock', name],
        queryFn: () => api.mockByName(name),
        staleTime: 10_000,
    })

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <Link to="/mock">
                    <Button variant="ghost" size="icon-sm">
                        <ArrowLeftIcon />
                        <span className="sr-only">Back to mock list</span>
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="font-heading text-2xl font-semibold">
                            <code className="font-mono">{name}</code>
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {data
                            ? `${data.length} request${data.length !== 1 ? 's' : ''} captured (newest first)`
                            : 'Loading…'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCwIcon className={isFetching ? 'animate-spin' : ''} data-icon="inline-start" />
                    Refresh
                </Button>
            </div>

            {isError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Failed to load requests for <code className="font-mono">{name}</code>.
                </p>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(hg => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map(h => (
                                        <TableHead key={h.id}>
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No requests captured for this endpoint.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer"
                                        onClick={() => setSelected(row.original)}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            <Badge variant={methodVariant[selected?.method ?? ''] ?? 'outline'} className="mr-2">
                                {selected?.method}
                            </Badge>
                            Request detail
                        </SheetTitle>
                        <SheetDescription>
                            {selected && new Date(selected.server_date).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'long',
                            })}
                        </SheetDescription>
                    </SheetHeader>
                    {selected && (
                        <div className="flex flex-col gap-4 p-4">
                            <JsonSection label="Query Parameters" value={selected.query} />
                            <JsonSection label="Body" value={selected.body} />
                            <JsonSection label="Headers" value={selected.headers} />
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

function JsonSection({ label, value }: { label: string; value: unknown }) {
    const isEmpty = !value || (typeof value === 'object' && Object.keys(value as object).length === 0)
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            {isEmpty ? (
                <span className="text-sm text-muted-foreground italic">empty</span>
            ) : (
                <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 text-xs">
                    {JSON.stringify(value, null, 2)}
                </pre>
            )}
        </div>
    )
}
