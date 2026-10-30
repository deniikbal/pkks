"use client"

import Link from "next/link"
import { useTransition } from "react"
import {
  ArchiveIcon,
  ChevronDownIcon,
  KeyRoundIcon,
  LogOutIcon,
} from "lucide-react"

import { aksiKeluar } from "@/app/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"

function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("")
}

export function MenuPengguna({
  nama,
  email,
  peran,
}: {
  nama: string
  email: string
  peran: "admin" | "pengawas"
}) {
  const [sedangKeluar, mulaiKeluar] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 gap-2 px-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground data-[popup-open]:bg-primary-foreground/10"
        )}
      >
        <Avatar size="sm" className="after:border-primary-foreground/25">
          <AvatarFallback className="bg-primary-foreground/15 text-[11px] font-semibold text-primary-foreground">
            {inisial(nama)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-sm font-medium">{nama}</span>
          <span className="text-[11px] font-normal text-primary-foreground/70">
            {peran === "admin" ? "Admin" : "Pengawas"}
          </span>
        </span>
        <ChevronDownIcon className="hidden size-4 opacity-70 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-medium text-foreground">{nama}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <ArchiveIcon />
          Arsip dokumen
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/sandi" />}>
          <KeyRoundIcon />
          Ganti kata sandi
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={sedangKeluar}
          onClick={() => mulaiKeluar(() => void aksiKeluar())}
        >
          {sedangKeluar ? <Spinner /> : <LogOutIcon />}
          {sedangKeluar ? "Mengeluarkan..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
