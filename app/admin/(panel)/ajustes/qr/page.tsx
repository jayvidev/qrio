'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function buildPayload(branchId: number | null, tableNumber: number | null, v = 1) {
  return JSON.stringify({ branchId, tableNumber, v })
}

export default function QrGeneratorPage() {
  const [branchId, setBranchId] = useState<number | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [version, setVersion] = useState<number>(1)

  const payload = useMemo(
    () => buildPayload(branchId, tableNumber, version),
    [branchId, tableNumber, version]
  )
  const encoded = useMemo(() => encodeURIComponent(payload), [payload])
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encoded}`,
    [encoded]
  )

  const handleDownload = async () => {
    // Descargar la imagen que estamos mostrando (QR API pública)
    try {
      const res = await fetch(qrUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-branch-${branchId ?? '_'}-table-${tableNumber ?? '_'}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Generar QR para mesa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchId">Branch ID</Label>
              <Input
                id="branchId"
                inputMode="numeric"
                placeholder="Ej. 1"
                value={branchId ?? ''}
                onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Mesa</Label>
              <Input
                id="tableNumber"
                inputMode="numeric"
                placeholder="Ej. 7"
                value={tableNumber ?? ''}
                onChange={(e) => setTableNumber(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versión</Label>
              <Input
                id="version"
                inputMode="numeric"
                placeholder="1"
                value={version}
                onChange={(e) => setVersion(Number(e.target.value || 1))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col md:flex-row items-center gap-6">
            <img src={qrUrl} alt="QR generado" className="size-64 rounded border" />
            <div className="grid gap-3 w-full">
              <div className="space-y-1">
                <Label>Payload (JSON)</Label>
                <div className="text-sm break-all bg-muted/40 rounded p-2">{payload}</div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copy(payload)}>
                    Copiar JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => copy(qrUrl)}>
                    Copiar URL QR
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Enlace alternativo (query)</Label>
                <div className="text-sm break-all bg-muted/40 rounded p-2">
                  {`?branchId=${branchId ?? ''}&tableNumber=${tableNumber ?? ''}&v=${version}`}
                </div>
              </div>

              <div>
                <Button onClick={handleDownload} disabled={!branchId || !tableNumber}>
                  Descargar PNG
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            El QR codifica un JSON con las claves branchId, tableNumber y v. La app móvil ya soporta
            este formato y un fallback por query.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
