export interface TreeNode {
  key: string
  type: string
  data: any
  children?: TreeNode[]
  expanded?: boolean
}

export interface Position {
  id: string
  name: string
  description?: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  children?: Position[]
}

