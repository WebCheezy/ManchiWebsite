"use client"

import { useState, useEffect, useMemo } from "react"
import { MapPin, Navigation, Loader2, CheckCircle, AlertCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Address, AddressInput } from "@/lib/db/types"
import {
  BASE_TRANSPORT_FEE_NAIRA,
  getServedLgasForState,
  getServedStateNames,
  isServedRegion,
  normalizeToServedStateAndLga,
  servedRegionErrorMessage,
} from "@/lib/delivery/served-regions"
import { formatPrice } from "@/lib/format"

interface AddressFormProps {
  address?: Address | null
  onSubmit: (data: AddressInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

interface GeocodedAddress {
  state: string
  lga: string
  area: string
  street: string
  formatted: string
}

type FormMode = "initial" | "detecting" | "confirm" | "manual"

export function AddressForm({ address, onSubmit, onCancel, isLoading = false }: AddressFormProps) {
  const isEditing = !!address
  const [mode, setMode] = useState<FormMode>(isEditing ? "manual" : "initial")
  const [detectedAddress, setDetectedAddress] = useState<GeocodedAddress | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<AddressInput>({
    title: address?.title ?? "",
    state: address?.state ?? "",
    lga: address?.lga ?? "",
    area: address?.area ?? "",
    street: address?.street ?? "",
    house_number: address?.house_number ?? "",
    is_default: address?.is_default ?? false,
  })
  const [error, setError] = useState<string | null>(null)

  const servedStates = useMemo(() => {
    const names = getServedStateNames()
    if (isEditing && address?.state && !names.some((n) => n.toLowerCase() === address.state.toLowerCase())) {
      return [...names, address.state].sort((a, b) => a.localeCompare(b))
    }
    return names
  }, [isEditing, address?.state])

  const availableLgas = useMemo(() => {
    if (!formData.state) return []
    const served = getServedLgasForState(formData.state)
    if (
      isEditing &&
      address?.lga &&
      address.state &&
      formData.state.toLowerCase() === address.state.toLowerCase() &&
      !served.some((l) => l.toLowerCase() === address.lga.toLowerCase())
    ) {
      return [address.lga, ...served]
    }
    return served
  }, [formData.state, isEditing, address?.lga, address?.state])

  // Reset LGA when state changes and current LGA is not in the new list
  useEffect(() => {
    if (!formData.state) return
    const lgas = getServedLgasForState(formData.state)
    if (lgas.length === 0) return
    const ok =
      lgas.some((l) => l.toLowerCase() === formData.lga.toLowerCase()) ||
      (isEditing &&
        address?.lga &&
        formData.state.toLowerCase() === address.state?.toLowerCase() &&
        formData.lga.toLowerCase() === address.lga.toLowerCase())
    if (!ok && !isEditing) {
      setFormData((prev) => ({ ...prev, lga: "" }))
    }
  }, [formData.state, formData.lga, isEditing, address?.lga, address?.state])

  const handleChange = (field: keyof AddressInput, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const detectLocation = async () => {
    setMode("detecting")
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setMode("manual")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use Nominatim (OpenStreetMap) for reverse geocoding - free and no API key required
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          )
          
          if (!response.ok) throw new Error("Failed to fetch address")
          
          const data = await response.json()
          const addr = data.address || {}
          
          // Map the response to Nigerian address format
          const detected: GeocodedAddress = {
            state: addr.state || addr.region || "",
            lga: addr.county || addr.city || addr.town || addr.municipality || "",
            area: addr.suburb || addr.neighbourhood || addr.district || "",
            street: addr.road || addr.street || "",
            formatted: data.display_name || "",
          }
          
          const served = normalizeToServedStateAndLga(detected.state, detected.lga)
          if (!served) {
            setLocationError(
              "This location is outside Manchi's delivery LGAs. Please enter your address manually and pick a served state and LGA."
            )
            setMode("manual")
            return
          }

          setDetectedAddress(detected)
          setFormData(prev => ({
            ...prev,
            state: served.state,
            lga: served.lga,
            area: detected.area,
            street: detected.street,
          }))
          setMode("confirm")
        } catch {
          setLocationError("Could not determine your address. Please enter it manually.")
          setMode("manual")
        }
      },
      (err) => {
        let errorMessage = "Could not get your location. "
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += "Please allow location access and try again."
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable."
            break
          case err.TIMEOUT:
            errorMessage += "Location request timed out."
            break
          default:
            errorMessage += "Please enter your address manually."
        }
        setLocationError(errorMessage)
        setMode("manual")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const confirmDetectedAddress = () => {
    setMode("manual")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.state || !formData.lga || !formData.area || !formData.street || !formData.house_number) {
      setError("Please fill in all required fields")
      return
    }

    if (!isServedRegion(formData.state, formData.lga)) {
      setError(servedRegionErrorMessage())
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  // Initial mode - ask how to add address
  if (mode === "initial") {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Add Delivery Address</h3>
          <p className="text-sm text-muted-foreground mt-1">
            How would you like to add your address?
          </p>
          <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
            Delivery is available only in Manchi&apos;s listed LGAs. Base transport fee: ₦
            {formatPrice(BASE_TRANSPORT_FEE_NAIRA)}.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={detectLocation}
            className="w-full h-auto py-4 flex-col gap-1"
          >
            <Navigation className="h-5 w-5 mb-1" />
            <span className="font-medium">Use My Current Location</span>
            <span className="text-xs opacity-80">We&apos;ll detect your address automatically</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setMode("manual")}
            className="w-full h-auto py-4 flex-col gap-1"
          >
            <MapPin className="h-5 w-5 mb-1" />
            <span className="font-medium">Enter Address Manually</span>
            <span className="text-xs opacity-80">Type in your address details</span>
          </Button>
        </div>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full mt-2">
            Cancel
          </Button>
        )}
      </div>
    )
  }

  // Detecting mode - show loading
  if (mode === "detecting") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Detecting your location...</p>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setMode("manual")}
          className="mt-4"
        >
          Enter manually instead
        </Button>
      </div>
    )
  }

  // Confirm mode - show detected address
  if (mode === "confirm" && detectedAddress) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Location detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                {detectedAddress.formatted}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Is this address correct?</p>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={confirmDetectedAddress}>
              Yes, continue
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode("manual")}>
              No, edit it
            </Button>
          </div>
        </div>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        )}
      </div>
    )
  }

  // Manual mode - show full form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {locationError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{locationError}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isEditing && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detectLocation}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Detect my location
        </Button>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Address Label (optional)</Label>
        <Input
          id="title"
          placeholder="e.g. Home, Office, etc."
          value={formData.title ?? ""}
          onChange={(e) => handleChange("title", e.target.value)}
          disabled={isLoading}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Only states and LGAs we deliver to are shown. Base transport fee: ₦{formatPrice(BASE_TRANSPORT_FEE_NAIRA)}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select
            value={formData.state}
            onValueChange={(value) => handleChange("state", value)}
            disabled={isLoading}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {servedStates.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lga">LGA *</Label>
          <Select
            value={formData.lga}
            onValueChange={(value) => handleChange("lga", value)}
            disabled={isLoading || !formData.state}
          >
            <SelectTrigger id="lga">
              <SelectValue placeholder={formData.state ? "Select LGA" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {availableLgas.map((lga) => (
                <SelectItem key={lga} value={lga}>
                  {lga}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">Area / Neighbourhood *</Label>
        <Input
          id="area"
          placeholder="e.g. Victoria Island, Lekki Phase 1"
          value={formData.area}
          onChange={(e) => handleChange("area", e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="street">Street *</Label>
          <Input
            id="street"
            placeholder="e.g. Adeola Odeku Street"
            value={formData.street}
            onChange={(e) => handleChange("street", e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="house_number">House/Building Number *</Label>
          <Input
            id="house_number"
            placeholder="e.g. 12, Block A"
            value={formData.house_number}
            onChange={(e) => handleChange("house_number", e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => handleChange("is_default", checked === true)}
          disabled={isLoading}
        />
        <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
          Set as default delivery address
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
      </div>
    </form>
  )
}
