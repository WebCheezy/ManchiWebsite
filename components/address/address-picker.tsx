"use client"

import { useState } from "react"
import { MapPin, Plus, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddressForm } from "./address-form"
import type { Address, AddressInput } from "@/lib/db/types"
import { formatAddressFull, createAddress } from "@/lib/db/addresses"

interface AddressPickerProps {
  addresses: Address[]
  selectedAddressId: string | null
  onSelect: (address: Address) => void
  userId: string
  onAddressCreated?: (address: Address) => void
}

export function AddressPicker({
  addresses,
  selectedAddressId,
  onSelect,
  userId,
  onAddressCreated,
}: AddressPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  const handleAddNew = async (data: AddressInput) => {
    setIsLoading(true)
    try {
      const created = await createAddress(userId, data)
      if (created) {
        onAddressCreated?.(created)
        onSelect(created)
        setIsAddingNew(false)
        setIsOpen(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAddress = (address: Address) => {
    onSelect(address)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Deliver to</p>
            {selectedAddress ? (
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedAddress.title || "Address"} - {formatAddressFull(selectedAddress)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Select delivery address</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAddingNew ? "Add New Address" : "Select Delivery Address"}
          </DialogTitle>
        </DialogHeader>

        {isAddingNew ? (
          <AddressForm
            onSubmit={handleAddNew}
            onCancel={() => setIsAddingNew(false)}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No saved addresses
                </p>
                <Button onClick={() => setIsAddingNew(true)} className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => handleSelectAddress(address)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        address.id === selectedAddressId
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          address.id === selectedAddressId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {address.id === selectedAddressId ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {address.title || "Address"}
                          </p>
                          {address.is_default && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatAddressFull(address)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
