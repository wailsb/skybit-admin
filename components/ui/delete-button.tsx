"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
  endpoint: string;
  itemName?: string;
  className?: string;
}

export function DeleteButton({ id, endpoint, itemName = "item", className }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete this ${itemName}?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success(`${itemName} deleted successfully!`);
      // Refresh the current page to pull the latest DB state without the deleted item
      router.refresh();
    } catch (error) {
      const err = error as Error;
      console.error(err);
      toast.error(`Could not delete ${itemName}.`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="destructive"
      className={className || "w-full"}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
