import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { positionsApi } from "../../lib/positions-api"
import type { Position, TreeNode } from "@/types/position"
import { buildTree } from "../../lib/helpers"

interface PositionsState {
  items: Position[]
  treeData: TreeNode[]
  searchResults: {
    matches: Position[]
    parents: Position[]
    children: Position[]
  }
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: PositionsState = {
  items: [],
  treeData: [],
  searchResults: {
    matches: [],
    parents: [],
    children: [],
  },
  status: "idle",
  error: null,
}

export const fetchPositions = createAsyncThunk("positions/fetchPositions", async () => {
  const data = await positionsApi.getAll()
  return data
})

export const createPosition = createAsyncThunk("positions/createPosition", async (position: Partial<Position>) => {
  const response = await positionsApi.create(position)
  return response.data
})

export const updatePosition = createAsyncThunk(
  "positions/updatePosition",
  async ({ id, position }: { id: string; position: Partial<Position> }) => {
    const response = await positionsApi.update(id, position)
    return response.data
  },
)

export const deletePosition = createAsyncThunk("positions/deletePosition", async (id: string) => {
  await positionsApi.delete(id)
  return id
})

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    setSearchResults: (
      state,
      action: PayloadAction<{
        matches: Position[]
        parents: Position[]
        children: Position[]
        filteredTree: TreeNode[]
      }>,
    ) => {
      state.searchResults = {
        matches: action.payload.matches,
        parents: action.payload.parents,
        children: action.payload.children,
      }
      state.treeData = action.payload.filteredTree
    },
    clearSearch: (state) => {
      state.searchResults = {
        matches: [],
        parents: [],
        children: [],
      }
      state.treeData = buildTree(state.items)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
        state.treeData = buildTree(action.payload)
        state.error = null
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch positions"
      })
      .addCase(createPosition.fulfilled, (state) => {
        state.status = "idle"
      })
      .addCase(updatePosition.fulfilled, (state) => {
        state.status = "idle"
      })
      .addCase(deletePosition.fulfilled, (state) => {
        state.status = "idle"
      })
  },
})

export const { setSearchResults, clearSearch } = positionsSlice.actions
export default positionsSlice.reducer

