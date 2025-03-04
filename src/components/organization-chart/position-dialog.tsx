"use client"
import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Position } from "@/types/position"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { positionSchema, type PositionFormValues } from "../../../lib/validations/position-schema"
import { toast } from "sonner"
import { useAppDispatch } from "../../../lib/store/hooks"
import { createPosition, updatePosition } from "../../../lib/store/positionsSlice"

interface DialogProps {
  visible: boolean
  onHide: () => void
  mode: "add" | "edit"
  position?: Position
  onSaveSuccess: () => void
  positions: Position[]
}

export function PositionDialog({ visible, onHide, mode, position, onSaveSuccess, positions }: DialogProps) {
  const dispatch = useAppDispatch()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: positions.length === 0 ? null : undefined,
    },
  })

  useEffect(() => {
    if (visible) {
      reset(
        position
          ? {
              name: position.name,
              description: position.description || "",
              parentId: position.parentId,
            }
          : {
              name: "",
              description: "",
              parentId: positions.length === 0 ? null : undefined,
            },
      )
    }
  }, [visible, position, positions.length, reset])

  const onSubmit = async (data: PositionFormValues) => {
    try {
      if (mode === "add") {
        await dispatch(createPosition(data)).unwrap()
        toast.success("Position created successfully")
      } else if (mode === "edit" && position) {
        await dispatch(updatePosition({ id: position.id, position: data })).unwrap()
        toast.success("Position updated successfully")
      }
      onSaveSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setError("root", { message: errorMessage })
      toast.error(errorMessage)
    }
  }

  const parentOptions = [
    { label: "None (Root Node)", value: null },
    ...positions
      .filter((p) => mode === "add" || (p.id !== position?.id && !isDescendantOf(p, position?.id, positions)))
      .map((p) => ({ label: p.name, value: p.id })),
  ]

  function isDescendantOf(pos: Position, ancestorId: string | undefined, positions: Position[]): boolean {
    if (!ancestorId) return false
    if (pos.parentId === ancestorId) return true
    const parent = positions.find((p) => p.id === pos.parentId)
    return parent ? isDescendantOf(parent, ancestorId, positions) : false
  }

  function hasRootNode(positions: Position[]): boolean {
    return positions.some((p) => p.parentId === null)
  }

  return (
    <Dialog open={visible} onOpenChange={(open: boolean) => !open && onHide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Position" : "Edit Position"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{errors.root.message}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Position Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  id="name"
                  {...field}
                  placeholder="e.g., CEO, CTO, Project Manager"
                  className={errors.name ? "border-red-500" : ""}
                />
              )}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  id="description"
                  {...field}
                  placeholder="Brief description of this position's responsibilities"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Position</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value: string) => field.onChange(value === "null" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent position" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.value ?? "null"} value={option.value?.toString() ?? "null"}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-sm text-gray-500">
              {positions.length === 0
                ? "This will be the root position "
                : hasRootNode(positions) && !position?.parentId
                  ? "Only one root position is allowed. Please select a parent position."
                  : "Select a parent position to create a hierarchy"}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" onClick={onHide} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Create Position"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

