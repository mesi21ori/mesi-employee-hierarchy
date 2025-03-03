"use client"
import { useState, useEffect } from "react"
import { OrganizationChart } from "primereact/organizationchart"
import type { TreeNode, Position } from "@/types/position"
import { Edit, Trash2, Search, Plus, ChevronDown, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


const positionsApi = {

  getAll: async () => {
    try {
      const response = await fetch("http://localhost:3000/api/positions")
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error fetching positions:", error)
      throw error
    }
  },

  getOne: async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/positions/${id}`)
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Error fetching position ${id}:`, error)
      throw error
    }
  },

  create: async (position: Partial<Position>) => {
    const response = await fetch("http://localhost:3000/api/positions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(position),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.details || data.error || "Failed to create position")
    }
    return { data: data.data, message: data.message }
  },

  update: async (id: string, position: Partial<Position>) => {
    const response = await fetch(`http://localhost:3000/api/positions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(position),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.details || data.error || "Failed to update position")
    }
    return { data: data.data, message: data.message }
  },

  delete: async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/positions/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error)
      throw error
    }
  },

  getChildren: async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/positions/${id}/children`)
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Error fetching children for position ${id}:`, error)
      throw error
    }
  },
}

interface DialogProps {
  visible: boolean
  onHide: () => void
  mode: "add" | "edit"
  position?: Position
  onSave: (position: Partial<Position>) => Promise<void>
  positions: Position[]
}

const PositionDialog = ({ visible, onHide, mode, position, onSave, positions }: DialogProps) => {
  const [formData, setFormData] = useState<Partial<Position>>(position || {})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setFormData(position || {})
      setErrors({})
      setFormError(null)
    }
  }, [visible, position])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name?.trim()) {
      newErrors.name = "Position name is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (validate()) {
      setIsSubmitting(true)
      setFormError(null)
      try {
        await onSave(formData)
        onHide()
      } catch (error) {
        setFormError((error as Error).message)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const parentOptions = [
    { label: "None (Root Node)", value: null },
    ...positions
      .filter((p) => mode === "add" || (p.id !== position?.id && !isDescendantOf(p, position?.id)))
      .map((p) => ({ label: p.name, value: p.id })),
  ]

  function isDescendantOf(pos: Position, ancestorId: string | undefined): boolean {
    if (!ancestorId) return false
    if (pos.parentId === ancestorId) return true
    const parent = positions.find((p) => p.id === pos.parentId)
    return parent ? isDescendantOf(parent, ancestorId) : false
  }

    function hasRootNode(positions: Position[]): boolean {
        return positions.some((p) => p.parentId === null);
    }

  return (
    <Dialog open={visible} onOpenChange={(open: boolean) => !open && onHide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Position" : "Edit Position"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {formError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{formError}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">
              Position Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., CEO, CTO, Project Manager"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this position's responsibilities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Position</Label>
            <Select
              value={formData.parentId?.toString() || ""}
              onValueChange={(value: string) => setFormData({ ...formData, parentId: value === "null" ? null : value })}
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
            <p className="text-sm text-gray-500">
              {positions.length === 0
                ? "This will be the root position "
                : hasRootNode(positions) && !position?.parentId
                  ? "Only one root position is allowed. Please select a parent position."
                  : "Select a parent position to create a hierarchy"}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={onHide} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function OrganizationChartDemo() {
  const [positions, setPositions] = useState<Position[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [searchType, setSearchType] = useState<"node" | "parent" | "child">("node")
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [newPosition, setNewPosition] = useState<Partial<Position>>({})
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
  const [searchResults, setSearchResults] = useState<{
    matches: Position[]
    parents: Position[]
    children: Position[]
  }>({
    matches: [],
    parents: [],
    children: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

 

  useEffect(() => {
    fetchPositions()
  }, [])

  useEffect(() => {
    setTreeData(buildTree(positions))
  }, [positions])

  const fetchPositions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await positionsApi.getAll()
      const flattenedPositions = flattenPositionData(data)
      setPositions(flattenedPositions)
    } catch (error) {
      console.error("Error fetching positions:", error)
      setError("Failed to load positions. Please try again.")
      toast.error("Failed to load positions")
    } finally {
      setIsLoading(false)
    }
  }

  const flattenPositionData = (data: any[]): Position[] => {
    const result: Position[] = []
    const processNode = (node: any) => {
      const position: Position = {
        id: node.id,
        name: node.name,
        description: node.description,
        parentId: node.parentId,
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
      }

      result.push(position)

      if (node.children && node.children.length > 0) {
        node.children.forEach(processNode)
      }
    }

    data.forEach(processNode)
    return result
  }

  const getRootNode = (positions: Position[]): Position | null => {
    return positions.find((p) => p.parentId === null) || null
  }

  const buildTree = (positions: Position[]): TreeNode[] => {
    const posMap = new Map<string, TreeNode>()

    positions.forEach((pos) => {
      posMap.set(pos.id, {
        key: pos.id.toString(),
        type: "position",
        data: pos,
        children: [],
        expanded: true,
      })
    })

    const tree: TreeNode[] = []
    
    positions.forEach((pos) => {
      const node = posMap.get(pos.id)
      if (node) {
        if (pos.parentId === null) {
          tree.push(node)
        } else {
          const parentNode = posMap.get(pos.parentId)
          if (parentNode) {
            parentNode.children = parentNode.children || []
            parentNode.children.push(node)
          }
        }
      }
    })

    return tree
  }

  const findParents = (position: Position): Position[] => {
    const parents: Position[] = []
    let currentPosition = position
    while (currentPosition.parentId !== null) {
      const parent = positions.find((p) => p.id === currentPosition.parentId)
      if (parent) {
        parents.push(parent)
        currentPosition = parent
      } else {
        break
      }
    }
    return parents
  }

  const findChildren = (position: Position): Position[] => {
    const children: Position[] = []
    const stack = [position]

    while (stack.length > 0) {
      const current = stack.pop()!
      const directChildren = positions.filter((p) => p.parentId === current.id)
      children.push(...directChildren)
      stack.push(...directChildren)
    }

    return children
  }

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
              handleEdit(node.data)
            }}
          >
            <Edit size={14} />
          </button>
          <button
            className="text-destructive hover:text-destructive/80 p-1 rounded-full bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation()
              confirmDelete(node.data)
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

  const handleAddPosition = () => {
    setSelectedPosition(null)
    setNewPosition({
      parentId: positions.length === 0 ? null : undefined,
    })
    setShowAddDialog(true)
  }

  const handleEdit = (position: Position) => {
    setSelectedPosition(position)
    setNewPosition({ ...position })
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
      await positionsApi.delete(id)
      toast.success("Position deleted successfully")
      fetchPositions()
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error)
      toast.error("Failed to delete position")
    }
  }

  const handleSavePosition = async (positionData: Partial<Position>) => {
    try {
      if (showAddDialog) {
        const { data, message } = await positionsApi.create(positionData)
        toast.success(message || "Position created successfully")
      } else if (showEditDialog && selectedPosition) {
        const { data, message } = await positionsApi.update(selectedPosition.id, positionData)
        toast.success(message || "Position updated successfully")
      }

      fetchPositions()

      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedPosition(null)
      setNewPosition({})
    } catch (error) {
      throw error 
    }
  }

  const handleSearch = () => {
    if (!searchText.trim()) {
      setSearchResults({ matches: [], parents: [], children: [] })
      setTreeData(buildTree(positions))
      return
    }

    const searchLower = searchText.toLowerCase()
    const matches = positions.filter(
      (p) => p.name.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower),
    )

    let relevantNodes: Position[] = []
    let parents: Position[] = []
    let children: Position[] = []

    switch (searchType) {
      case "node":
        relevantNodes = matches
        break
      case "parent":
        parents = matches.flatMap(findParents)
        relevantNodes = [...matches, ...parents]
        break
      case "child":
        children = matches.flatMap(findChildren)
        relevantNodes = [...matches, ...children]
        break
    }

    const fullPathNodes = new Set<Position>()
    relevantNodes.forEach((node) => {
      fullPathNodes.add(node)
      findParents(node).forEach((parent) => fullPathNodes.add(parent))
    })

    setSearchResults({ matches, parents, children })
    setTreeData(buildTree(Array.from(fullPathNodes)))
  }

  return (
    <div className="space-y-4">
      <div className="fixed top-0 left-0 right-0 bg-secondary border-b z-50 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md">
            <div className="relative flex items-center">
              <Input
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  if (e.target.value === "") {
                    setTreeData(buildTree(positions))
                    setSearchResults({ matches: [], parents: [], children: [] })
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                placeholder="Search positions..."
                className="pl-10 pr-[6.5rem] bg-secondary/80 border-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-secondary-foreground/70" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="absolute right-[4.25rem] h-full px-2 py-2">
                    {searchType === "node" ? "Node" : searchType === "parent" ? "Parent" : "Child"}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSearchType("node")}>Node</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchType("parent")}>Parent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchType("child")}>Child</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleSearch} className="absolute right-0 rounded-l-none">
                Search
              </Button>
            </div>
            {searchResults.matches.length > 0 && (
              <div className="absolute right-0 top-full mt-2 mr-32 bg-popover text-popover-foreground rounded-md shadow-md p-2 text-sm z-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Match</span>
                  </div>
                  {searchType === "parent" && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      <span>Parent</span>
                    </div>
                  )}
                  {searchType === "child" && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span>Child</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPositions} className="shrink-0" disabled={isLoading}>
              <RefreshCw size={16} className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleAddPosition} className="shrink-0" disabled={isLoading}>
              <Plus size={16} className="mr-1" />
              Add position
            </Button>
          </div>
        </div>
      </div>

      <div className="h-16"></div>

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
            <Button onClick={fetchPositions}  className="mt-4">
              Try Again
            </Button>
          </div>
        ) : treeData.length > 0 ? (
          <OrganizationChart value={treeData} nodeTemplate={nodeTemplate} className="org-chart" />
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">No positions to display</p>
            <Button onClick={handleAddPosition}>Add your first position</Button>
          </div>
        )}
      </div>

      <PositionDialog
        visible={showAddDialog || showEditDialog}
        onHide={() => {
          setShowAddDialog(false)
          setShowEditDialog(false)
        }}
        mode={showAddDialog ? "add" : "edit"}
        position={selectedPosition || undefined}
        onSave={handleSavePosition}
        positions={positions}
      />

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {alertDialogContent.title === "Delete Confirmation" && (
              <AlertDialogAction onClick={alertDialogContent.action}>Delete</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

