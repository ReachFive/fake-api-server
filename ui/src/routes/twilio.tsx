import { useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { RefreshCwIcon } from 'lucide-react'
import { api, type TwilioMessage } from '@/lib/api'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/twilio')({
    component: TwilioPage,
})

function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'medium',
    })
}

const columns: ColumnDef<TwilioMessage>[] = [
    { accessorKey: 'sid', header: 'SID', cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sid}</span>
    )},
    { accessorKey: 'from', header: 'From' },
    { accessorKey: 'to', header: 'To' },
    { accessorKey: 'body', header: 'Body', cell: ({ row }) => (
        <span className="max-w-xs truncate block">{row.original.body}</span>
    )},
    { accessorKey: 'date_created', header: 'Date', cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDate(row.original.date_created)}</span>
    )},
]

function TwilioPage() {
    const [selected, setSelected] = useState<TwilioMessage | null>(null)
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['twilio', 'messages'],
        queryFn: api.twilioMessages,
        staleTime: 10_000,
    })

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Twilio Messages</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {data ? `${data.length} message${data.length !== 1 ? 's' : ''} captured` : 'Loading…'}
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
                    Failed to load messages. Is the server running?
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
                                        No messages captured yet.
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
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Message {selected?.sid}</SheetTitle>
                        <SheetDescription>Full Twilio message details</SheetDescription>
                    </SheetHeader>
                    {selected && (
                        <div className="flex flex-col gap-4 p-4">
                            <DetailRow label="SID" value={<code className="font-mono text-sm">{selected.sid}</code>} />
                            <DetailRow label="From" value={selected.from} />
                            <DetailRow label="To" value={selected.to} />
                            <DetailRow label="Date" value={formatDate(selected.date_created)} />
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Body</span>
                                <p className="rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap break-words">
                                    {selected.body}
                                </p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className="text-sm">{value}</span>
        </div>
    )
}
