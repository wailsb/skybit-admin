"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react"

interface ControlMenuProps {
  title: string
  description: string
  addLabel: string
  addHref: string
}

export function ControlMenu({ title, description, addLabel, addHref }: ControlMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")

  // Debounce search update
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = createQueryString("q", search)
      router.push(`${pathname}?${query}`, { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [search, pathname, router, createQueryString])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <HugeiconsIcon 
            icon={Search01Icon} 
            className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" 
          />
          <Input
            placeholder="Search..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => router.push(addHref)}>
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          <span className="hidden sm:inline">{addLabel}</span>
        </Button>
      </div>
    </div>
  )
}