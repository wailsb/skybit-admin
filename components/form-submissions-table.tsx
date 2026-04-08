"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import type { ContactSubmission } from "@/app/Types";

export function FormSubmissionsTable({
  initialData,
}: {
  initialData: ContactSubmission[];
}) {
  if (!initialData || initialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No submissions
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No contact form submissions have been received yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initialData.map((sub) => {
        const idToUse = sub.id;
        return (
          <Card key={idToUse}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }) : "No date"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{sub.email}</span>
                  <span>{sub.phone}</span>
                </div>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                  {sub.message}
                </CardDescription>
              </div>
              <DeleteButton id={idToUse} endpoint="/api/form" itemName="submission" />
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
