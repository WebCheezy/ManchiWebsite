"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, Plus, Check, Star, Pencil, Trash2, LogIn, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddressForm } from "./address-form"
import type { Address, AddressInput } from "@/lib/db/types"
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  formatAddressFull,
} from "@/lib/db/addresses"
import { useCart } from "@/lib/cart/cart-context"
import { getBranchDisplayInfo, resolveStoreLocationFromAddress } from "@/lib/location/branch"

interface HeaderAddressPickerProps {
  addresses: Address[]
  selectedAddress: Address | null
  userId: string | null
  onAddressChange?: (address: Address) => void
}

export function HeaderAddressPicker({
  addresses: initialAddresses,
  selectedAddress: initialSelected,
  userId,
  onAddressChange,
}: HeaderAddressPickerProps) {
  const { setStoreLocation } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(initialSelected)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setAddresses(initialAddresses)
  }, [initialAddresses])

  useEffect(() => {
    setSelectedAddress(initialSelected)
  }, [initialSelected])

  useEffect(() => {
    if (selectedAddress) {
      setStoreLocation(resolveStoreLocationFromAddress(selectedAddress))
    }
  }, [selectedAddress, setStoreLocation])

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
    onAddressChange?.(address)
    setIsOpen(false)
  }

  const handleAddNew = async (data: AddressInput) => {
    if (!userId) return
    setIsLoading(true)
    try {
      const created = await createAddress(userId, data)
      if (created) {
        const updated = data.is_default
          ? addresses.map((a) => ({ ...a, is_default: false }))
          : addresses
        setAddresses([created, ...updated])
        setSelectedAddress(created)
        onAddressChange?.(created)
        setIsAddingNew(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (data: AddressInput) => {
    if (!userId || !editingAddress) return
    setIsLoading(true)
    try {
      const updated = await updateAddress(editingAddress.id, userId, data)
      if (updated) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === updated.id) return updated
            if (data.is_default && a.is_default) return { ...a, is_default: false }
            return a
          })
        )
        if (selectedAddress?.id === updated.id) {
          setSelectedAddress(updated)
          onAddressChange?.(updated)
        }
        setEditingAddress(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userId || !deletingAddress) return
    setIsLoading(true)
    try {
      const success = await deleteAddress(deletingAddress.id, userId)
      if (success) {
        setAddresses((prev) => prev.filter((a) => a.id !== deletingAddress.id))
        if (selectedAddress?.id === deletingAddress.id) {
          const remaining = addresses.filter((a) => a.id !== deletingAddress.id)
          const newSelected = remaining.find((a) => a.is_default) || remaining[0] || null
          setSelectedAddress(newSelected)
          if (newSelected) onAddressChange?.(newSelected)
        }
      }
    } finally {
      setIsLoading(false)
      setDeletingAddress(null)
    }
  }

  const handleSetDefault = async (address: Address) => {
    if (!userId) return
    setIsLoading(true)
    try {
      const success = await setDefaultAddress(address.id, userId)
      if (success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_default: a.id === address.id,
          }))
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const displayLabel = selectedAddress
    ? `${selectedAddress.house_number} ${selectedAddress.street}, ${selectedAddress.area}`
    : "Select address"

  const branchInfo = selectedAddress ? getBranchDisplayInfo(resolveStoreLocationFromAddress(selectedAddress)) : null

  const isLoggedIn = !!userId

  return (
    <>
      {/* Mobile: icon only */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Select delivery address"
        className="lg:hidden p-1.5 text-foreground hover:text-primary transition-colors"
        title={branchInfo ? branchInfo.label : undefined}
      >
        <MapPin className="h-5 w-5" />
      </button>

      {/* Desktop: full address display */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:inline-flex flex-col items-start gap-0.5 px-2 py-1 rounded-xl bg-muted/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[220px]"
      >
        <span className="inline-flex items-center gap-1.5 w-full min-w-0">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 ml-auto" />
        </span>
        {branchInfo && (
          <span className="pl-5 text-[10px] text-primary/90 font-medium truncate w-full">{branchInfo.label}</span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddingNew
                ? "Add New Address"
                : editingAddress
                  ? "Edit Address"
                  : "Delivery Address"}
            </DialogTitle>
          </DialogHeader>

          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MapPin className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Sign in to manage addresses</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Save your delivery addresses for faster checkout
              </p>
              <Button asChild className="mt-5">
                <a href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </a>
              </Button>
            </div>
          ) : isAddingNew ? (
            <AddressForm
              onSubmit={handleAddNew}
              onCancel={() => setIsAddingNew(false)}
              isLoading={isLoading}
            />
          ) : editingAddress ? (
            <AddressForm
              address={editingAddress}
              onSubmit={handleEdit}
              onCancel={() => setEditingAddress(null)}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">No saved addresses</p>
                  <Button onClick={() => setIsAddingNew(true)} className="mt-4" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <>
                  {selectedAddress && branchInfo && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-1">
                      <div className="flex items-start gap-2">
                        <Store className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">Menu &amp; stock for this branch</p>
                          <p className="text-sm font-medium text-primary mt-0.5">{branchInfo.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{branchInfo.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`group relative flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                          address.id === selectedAddress?.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectAddress(address)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              address.id === selectedAddress?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {address.id === selectedAddress?.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {address.title || "Address"}
                              </p>
                              {address.is_default && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {formatAddressFull(address)}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-primary/90">
                              {getBranchDisplayInfo(resolveStoreLocationFromAddress(address)).label}
                            </p>
                          </div>
                        </button>

                        {/* Action buttons */}
                        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!address.is_default && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetDefault(address)
                              }}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Set as default"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingAddress(address)
                            }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingAddress(address)
                            }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAddress} onOpenChange={(open) => !open && setDeletingAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAddress?.title || "this address"}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
