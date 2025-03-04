import { RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onRefresh: () => void
  onAddPosition: () => void
  isLoading: boolean
}

export function ActionButtons({ onRefresh, onAddPosition, isLoading }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onRefresh} className="shrink-0" disabled={isLoading}>
        <RefreshCw size={16} className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
      <Button onClick={onAddPosition} className="shrink-0" disabled={isLoading}>
        <Plus size={16} className="mr-1" />
        Add position
      </Button>
    </div>
  )
}

