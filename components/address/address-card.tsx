"use client"

import { MapPin, Star, Pencil, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Address } from "@/lib/db/types"
import { formatAddressFull } from "@/lib/db/addresses"

interface AddressCardProps {
  address: Address
  onEdit?: (address: Address) => void
  onDelete?: (address: Address) => void
  onSetDefault?: (address: Address) => void
  isDeleting?: boolean
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting = false }: AddressCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-4 transition-colors ${
        address.is_default
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              address.is_default ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <MapPin className={`h-5 w-5 ${address.is_default ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {address.title || "Address"}
              </h3>
              {address.is_default && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formatAddressFull(address)}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(address)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onSetDefault && !address.is_default && (
              <DropdownMenuItem onClick={() => onSetDefault(address)}>
                <Star className="mr-2 h-4 w-4" />
                Set as default
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(address)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
