"use client"

import { useState } from "react"
import { Plus, MapPin } from "lucide-react"
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
import { AddressCard } from "./address-card"
import { AddressForm } from "./address-form"
import type { Address, AddressInput } from "@/lib/db/types"
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/db/addresses"

interface AddressListProps {
  addresses: Address[]
  userId: string
  onUpdate?: () => void
}

export function AddressList({ addresses: initialAddresses, userId, onUpdate }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = () => {
    setEditingAddress(null)
    setIsFormOpen(true)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: AddressInput) => {
    setIsLoading(true)
    try {
      if (editingAddress) {
        const updated = await updateAddress(editingAddress.id, userId, data)
        if (updated) {
          setAddresses((prev) =>
            prev.map((a) => {
              if (a.id === updated.id) return updated
              if (data.is_default && a.is_default) return { ...a, is_default: false }
              return a
            })
          )
        }
      } else {
        const created = await createAddress(userId, data)
        if (created) {
          setAddresses((prev) => {
            const updated = data.is_default
              ? prev.map((a) => ({ ...a, is_default: false }))
              : prev
            return [created, ...updated]
          })
        }
      }
      setIsFormOpen(false)
      setEditingAddress(null)
      onUpdate?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingAddress) return
    setIsLoading(true)
    try {
      const success = await deleteAddress(deletingAddress.id, userId)
      if (success) {
        setAddresses((prev) => prev.filter((a) => a.id !== deletingAddress.id))
        onUpdate?.()
      }
    } finally {
      setIsLoading(false)
      setDeletingAddress(null)
    }
  }

  const handleSetDefault = async (address: Address) => {
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
        onUpdate?.()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Delivery Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage your saved delivery addresses</p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">No addresses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first delivery address to get started
          </p>
          <Button onClick={handleAdd} className="mt-4" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={setDeletingAddress}
              onSetDefault={handleSetDefault}
              isDeleting={isLoading && deletingAddress?.id === address.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAddress} onOpenChange={(open) => !open && setDeletingAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
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
    </div>
  )
}
