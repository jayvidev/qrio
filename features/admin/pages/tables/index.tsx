'use client'

import { useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { TableListLayout } from '@admin/components/shared/table-list-layout'
import { TableDialog } from '@admin/components/tables/table-dialog'

import { useTenant } from '@/app/providers/tenant-provider'
import { useListQuery } from '@/hooks/use-list-query'
import { tablesApi } from '@/lib/api/tables'
import type { DiningTableList } from '@/lib/schemas/table/table.list.schema'

import { getColumns } from './columns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  title: string
  pathname: string
  resource: string
}

export function TablesPage({ title, pathname, resource }: Props) {
  const tenant = useTenant()
  const { data, error, refetch } = useListQuery<DiningTableList[]>(
    pathname,
    [resource, String(tenant.branchId ?? '')],
    () => tablesApi.getAll(tenant.branchId ?? 0)
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'details'>('create')
  const [selected, setSelected] = useState<DiningTableList | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrRow, setQrRow] = useState<DiningTableList | null>(null)

  const columns = useMemo(
    () =>
      getColumns(
        (row) => {
          setSelected(row)
          setDialogMode('edit')
          setDialogOpen(true)
        },
        undefined,
        (row) => {
          setQrRow(row)
          setQrOpen(true)
        }
      ),
    []
  )

  const form = useForm<{ floor: number }>({
    defaultValues: { floor: 1 },
  })

  const handleAdd = () => {
    setSelected(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const onSubmit = async (values: { floor: number }) => {
    await tablesApi.create({ branchId: tenant.branchId ?? 0, floor: Number(values.floor) })
    setDialogOpen(false)
    form.reset({ floor: 1 })
  }

  if (error) {
    console.error(`Failed to fetch ${resource}:`, error)
  }

  return (
    <>
      <TableListLayout
        columns={columns}
        data={data}
        resource={resource}
        title={title}
        description="Gestión de mesas de comedor."
        pathname={pathname}
        onAdd={handleAdd}
      />
      <TableDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        onClose={() => setDialogOpen(false)}
        onSubmitCreate={async (payload) => {
          await tablesApi.create({ branchId: tenant.branchId ?? 0, floor: payload.floor })
          await refetch()
        }}
        onSubmitEdit={async (id, payload) => {
          await tablesApi.updateFloor(id, { floor: payload.floor })
          await refetch()
        }}
      />

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{qrRow ? `QR de Mesa ${qrRow.tableNumber}` : 'QR de mesa'}</DialogTitle>
          </DialogHeader>
          {qrRow && (
            <div className="flex items-center justify-center">
              {/* Sirve imagen desde backend via proxy /api */}
              <img
                src={`/api/tables/${qrRow.id}/qr?size=256`}
                alt={`QR de Mesa ${qrRow.tableNumber}`}
                width={256}
                height={256}
                className="rounded-md border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
