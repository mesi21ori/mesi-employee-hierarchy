"use client"

import { useState, useEffect } from "react"
import type { Position } from "@/types/position"
import { SearchBar } from "@/components/organization-chart/search-bar"
import { ActionButtons } from "@/components/organization-chart/action-buttons"
import { ChartDisplay } from "@/components/organization-chart/chart-display"
import { PositionDialog } from "@/components/organization-chart/position-dialog"
import { ConfirmationDialog } from "@/components/organization-chart/confirmation-dialog"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks"
import { fetchPositions, deletePosition } from "../../lib/store/positionsSlice"
import { positionsApi } from "../../lib/positions-api"
import { RootState } from "lib/store"

export default function OrganizationChartPage() {
  const dispatch = useAppDispatch()
  const { items: positions, treeData, searchResults, status, error } = useAppSelector((state: RootState) => state.positions)

  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false)
  const [alertDialogContent, setAlertDialogContent] = useState<{
    title: string
    description: string
    action: () => void
  }>({
    title: "",
    description: "",
    action: () => {},
  })

  useEffect(() => {
    dispatch(fetchPositions())
  }, [dispatch])

  const handleAddPosition = () => {
    setSelectedPosition(null)
    setShowAddDialog(true)
  }

  const handleEdit = (position: Position) => {
    setSelectedPosition(position)
    setShowEditDialog(true)
  }

  const confirmDelete = async (position: Position) => {
    if (position.parentId === null) {
      setAlertDialogContent({
        title: "Cannot Delete",
        description: "This is a root node and cannot be deleted.",
        action: () => {},
      })
      setAlertDialogOpen(true)
    } else {
      try {
        const children = await positionsApi.getChildren(position.id)
        if (children && children.length > 0) {
          setAlertDialogContent({
            title: "Cannot Delete",
            description: "This position has child nodes. Please delete all child nodes before deleting this position.",
            action: () => {},
          })
          setAlertDialogOpen(true)
        } else {
          setAlertDialogContent({
            title: "Delete Confirmation",
            description: "Are you sure you want to delete this position?",
            action: () => handleDelete(position.id),
          })
          setAlertDialogOpen(true)
        }
      } catch (error) {
        console.error("Error checking for children:", error)
        toast.error("Failed to check for child positions")
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePosition(id)).unwrap()
      toast.success("Position deleted successfully")
      dispatch(fetchPositions())
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error)
      toast.error("Failed to delete position")
    }
  }

  const handleDialogClose = () => {
    setShowAddDialog(false)
    setShowEditDialog(false)
    setSelectedPosition(null)
  }

  const handleSaveSuccess = () => {
    dispatch(fetchPositions())
    handleDialogClose()
  }

  const isLoading = status === "loading"

  return (
    <div className="space-y-4">
      <div className="fixed top-0 left-0 right-0 bg-secondary border-b z-50 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center gap-4 max-w-7xl mx-auto">
          <SearchBar positions={positions} searchResults={searchResults} />
          <ActionButtons
            onRefresh={() => dispatch(fetchPositions())}
            onAddPosition={handleAddPosition}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="h-16"></div>

      <ChartDisplay
        isLoading={isLoading}
        error={error}
        treeData={treeData}
        searchResults={searchResults}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onRetry={() => dispatch(fetchPositions())}
        onAddPosition={handleAddPosition}
      />

      <PositionDialog
        visible={showAddDialog || showEditDialog}
        onHide={handleDialogClose}
        mode={showAddDialog ? "add" : "edit"}
        position={selectedPosition || undefined}
        onSaveSuccess={handleSaveSuccess}
        positions={positions}
      />

      <ConfirmationDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        title={alertDialogContent.title}
        description={alertDialogContent.description}
        showAction={alertDialogContent.title === "Delete Confirmation"}
        onAction={alertDialogContent.action}
      />
    </div>
  )
}

