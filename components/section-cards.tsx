"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartUpIcon, ChartDownIcon } from "@hugeicons/core-free-icons"

export function SectionCards({ stats }: { stats?: { clients: number, services: number, team: number, submissions: number } }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.clients ?? "..."}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active portfolio items
          </div>
          <div className="text-muted-foreground">
            Sourced from database
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Form Submissions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.submissions ?? "..."}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />
              New
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Project inquiries
          </div>
          <div className="text-muted-foreground">
            Contact form requests
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Services Offered</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.services ?? "..."}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Public service list
          </div>
          <div className="text-muted-foreground">Capabilities catalog</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Team Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.team ?? "..."}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />
              Staff
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            SkyBit experts
          </div>
          <div className="text-muted-foreground">Human resources</div>
        </CardFooter>
      </Card>
    </div>
  )
}
  
