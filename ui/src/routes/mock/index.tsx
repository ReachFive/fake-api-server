import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { RefreshCwIcon } from 'lucide-react'
import { api } from '@/lib/api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/mock/')({
    component: MockIndexPage,
})

interface MockEndpoint {
    name: string
    count: number
    lastMethod: string
    lastDate: string
}

const methodVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    GET: 'outline',
    POST: 'default',
    PUT: 'secondary',
    PATCH: 'secondary',
    DELETE: 'destructive',
}

const columns: ColumnDef<MockEndpoint>[] = [
    {
        accessorKey: 'name',
        header: 'Endpoint',
        cell: ({ row }) => (
            <Link
                to="/mock/$name"
                params={{ name: row.original.name }}
                className="font-mono text-sm text-primary hover:underline"
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: 'count',
        header: 'Requests',
        cell: ({ row }) => (
            <Badge variant="secondary">{row.original.count}</Badge>
        ),
    },
    {
        accessorKey: 'lastMethod',
        header: 'Last Method',
        cell: ({ row }) => (
            <Badge variant={methodVariant[row.original.lastMethod] ?? 'outline'}>
                {row.original.lastMethod}
            </Badge>
        ),
    },
    {
        accessorKey: 'lastDate',
        header: 'Last Request',
        cell: ({ row }) => (
            <span className="whitespace-nowrap text-muted-foreground text-sm">
                {row.original.lastDate
                    ? new Date(row.original.lastDate).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                    })
                    : '—'}
            </span>
        ),
    },
]

function MockIndexPage() {
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['mock', 'all'],
        queryFn: api.mocks,
        staleTime: 10_000,
    })

    const endpoints: MockEndpoint[] = data
        ? Object.entries(data).map(([name, requests]) => ({
            name,
            count: requests.length,
            lastMethod: requests[0]?.method ?? '',
            lastDate: requests[0]?.server_date ?? '',
        }))
        : []

    const table = useReactTable({
        data: endpoints,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Mock Requests</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {endpoints.length
                            ? `${endpoints.length} endpoint${endpoints.length !== 1 ? 's' : ''} with captured requests`
                            : 'No captured requests yet'}
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
                    Failed to load mock requests. Is the server running?
                </p>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
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
                                        No requests captured yet. Configure mocks and call{' '}
                                        <code className="font-mono text-xs">/mock/:name/request</code>.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
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
        </div>
    )
}
