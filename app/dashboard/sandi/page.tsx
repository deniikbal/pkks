import Link from "next/link"

import { FormSandi } from "@/components/form-sandi"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default function HalamanSandi() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Arsip
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ganti kata sandi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ganti kata sandi
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Setelah kata sandi diganti, sesi di perangkat lain yang masih
            terbuka akan diputus. Perangkat ini tetap masuk.
          </p>
        </header>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Kata sandi baru</CardTitle>
          <CardDescription>
            Minimal 10 karakter, dan tidak dipakai di layanan lain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormSandi />
        </CardContent>
      </Card>
    </div>
  )
}
