"use client"
import { OrganizationChart } from "primereact/organizationchart"
import type { TreeNode, Position } from "@/types/position"
import { RefreshCw, AlertCircle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartDisplayProps {
  isLoading: boolean
  error: string | null
  treeData: TreeNode[]
  searchResults: {
    matches: Position[]
    parents: Position[]
    children: Position[]
  }
  onEdit: (position: Position) => void
  onDelete: (position: Position) => void
  onRetry: () => void
  onAddPosition: () => void
}

export function ChartDisplay({
  isLoading,
  error,
  treeData,
  searchResults,
  onEdit,
  onDelete,
  onRetry,
  onAddPosition,
}: ChartDisplayProps) {
  const nodeTemplate = (node: TreeNode) => {
    if (!node || !node.data) return null

    const isMatch = searchResults.matches.some((p) => p.id === node.data.id)
    const isParent = searchResults.parents.some((p) => p.id === node.data.id)
    const isChild = searchResults.children.some((p) => p.id === node.data.id)

    let highlightClass = ""
    if (isMatch) highlightClass = "ring-2 ring-primary"
    else if (isParent) highlightClass = "ring-2 ring-blue-400"
    else if (isChild) highlightClass = "ring-2 ring-green-400"

    return (
      <div
        className={`p-3 text-center bg-secondary rounded border border-secondary-foreground min-w-[120px] group relative ${highlightClass}`}
      >
        <div className="absolute top-0 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="text-primary hover:text-primary/80 p-1 rounded-full bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(node.data)
            }}
          >
            <Edit size={14} />
          </button>
          <button
            className="text-destructive hover:text-destructive/80 p-1 rounded-full bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.data)
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="font-bold">{node.data.name}</div>
        <div className="text-sm mt-1">{node.data.description}</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg rounded-lg bg-secondary/80 mt-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading positions...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>{error}</p>
          <Button onClick={onRetry} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : treeData.length > 0 ? (
        <OrganizationChart value={treeData} nodeTemplate={nodeTemplate} className="org-chart" />
      ) : (
        <div className="text-center py-4">
          <p className="mb-4">No positions to display</p>
          <Button onClick={onAddPosition}>Add your first position</Button>
        </div>
      )}
    </div>
  )
}

