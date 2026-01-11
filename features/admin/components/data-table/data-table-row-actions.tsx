import type { Row } from '@tanstack/react-table'
import { Ellipsis, Info, Pencil, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props<TData> {
  row: Row<TData>
  onEdit?: (data: TData) => void
  onDetails?: (data: TData) => void
  onViewQr?: (data: TData) => void
}

export function DataTableRowActions<TData>({ row, onEdit, onDetails, onViewQr }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Abrir menú"
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onViewQr && (
          <DropdownMenuItem onClick={() => onViewQr(row.original)}>
            <QrCode />
            Ver QR
          </DropdownMenuItem>
        )}
        {onDetails && (
          <DropdownMenuItem onClick={() => onDetails(row.original)}>
            <Info />
            Detalles
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
