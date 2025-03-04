"use client"
import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Position } from "@/types/position"
import { findParents, findChildren, buildTree } from "../../../lib/helpers"
import { SearchLegend } from "./search-legend"
import { useAppDispatch } from "../../../lib/store/hooks"
import { setSearchResults, clearSearch } from "../../../lib/store/positionsSlice"

interface SearchBarProps {
  positions: Position[]
  searchResults: {
    matches: Position[]
    parents: Position[]
    children: Position[]
  }
}

export function SearchBar({ positions, searchResults }: SearchBarProps) {
  const dispatch = useAppDispatch()
  const [searchText, setSearchText] = useState<string>("")
  const [searchType, setSearchType] = useState<"node" | "parent" | "child">("node")

  const handleSearch = () => {
    if (!searchText.trim()) {
      dispatch(clearSearch())
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
        parents = matches.flatMap((match) => findParents(match, positions))
        relevantNodes = [...matches, ...parents]
        break
      case "child":
        children = matches.flatMap((match) => findChildren(match, positions))
        relevantNodes = [...matches, ...children]
        break
    }

    const fullPathNodes = new Set<Position>()
    relevantNodes.forEach((node) => {
      fullPathNodes.add(node)
      findParents(node, positions).forEach((parent) => fullPathNodes.add(parent))
    })

    const results = { matches, parents, children }
    const filteredTree = buildTree(Array.from(fullPathNodes))

    dispatch(
      setSearchResults({
        matches,
        parents,
        children,
        filteredTree,
      }),
    )
  }


  useEffect(() => {
    if (searchText === "") {
      dispatch(clearSearch())
    }
  }, [dispatch, searchText])

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative flex items-center">
        <Input
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            if (e.target.value === "") {
              dispatch(clearSearch())
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

      {searchResults.matches.length > 0 && <SearchLegend searchType={searchType} />}
    </div>
  )
}


