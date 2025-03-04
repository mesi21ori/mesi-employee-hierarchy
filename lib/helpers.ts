import type { Position, TreeNode } from "@/types/position"

export function flattenPositionData(data: any[]): Position[] {
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

export function getRootNode(positions: Position[]): Position | null {
  return positions.find((p) => p.parentId === null) || null
}

export function buildTree(positions: Position[]): TreeNode[] {
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

export function findParents(position: Position, positions: Position[]): Position[] {
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

export function findChildren(position: Position, positions: Position[]): Position[] {
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

