export function SearchLegend({ searchType }: { searchType: "node" | "parent" | "child" }) {
    return (
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
    )
  }
  
  