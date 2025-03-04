import axios from "axios"
import type { Position } from "@/types/position"


const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

export const positionsApi = {
  getAll: async () => {
    try {
      const response = await api.get("/positions")
      return response.data.data
    } catch (error) {
      console.error("Error fetching positions:", error)
      throw error
    }
  },

  getOne: async (id: string) => {
    try {
      const response = await api.get(`/positions/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching position ${id}:`, error)
      throw error
    }
  },

  create: async (position: Partial<Position>) => {
    try {
      const response = await api.post("/positions", position)
      return { data: response.data.data, message: response.data.message }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.details || error.response.data.error || "Failed to create position")
      }
      throw error
    }
  },

  update: async (id: string, position: Partial<Position>) => {
    try {
      const response = await api.put(`/positions/${id}`, position)
      return { data: response.data.data, message: response.data.message }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.details || error.response.data.error || "Failed to update position")
      }
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/positions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error)
      throw error
    }
  },

  getChildren: async (id: string) => {
    try {
      const response = await api.get(`/positions/${id}/children`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching children for position ${id}:`, error)
      throw error
    }
  },
}

