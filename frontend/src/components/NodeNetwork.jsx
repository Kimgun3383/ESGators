import { useEffect, useRef, useState } from "react"
import Button from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { API_BASE_URL } from "../lib/api"
import "./NodeNetwork.css"

const NODE_RADIUS = 42
const CANVAS_WIDTH = 760
const CANVAS_HEIGHT = 520
const DRAG_THRESHOLD = 6

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function truncateNodeLabel(name) {
  if (!name) {
    return "Node"
  }

  return name.length > 11 ? `${name.slice(0, 9)}...` : name
}

function buildInitialPosition(index, total, canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(total || 1)))
  const usableWidth = Math.max(canvasSize.width - NODE_RADIUS * 2, 120)
  const spacingX = Math.max(110, usableWidth / Math.max(columns, 2))
  const spacingY = 130
  const baseX = NODE_RADIUS + Math.min(68, spacingX / 2)
  const baseY = 110

  return {
    x: clamp(baseX + (index % columns) * spacingX, NODE_RADIUS, canvasSize.width - NODE_RADIUS),
    y: clamp(baseY + Math.floor(index / columns) * spacingY, NODE_RADIUS, canvasSize.height - NODE_RADIUS),
  }
}

function formatNodeName(nodeId, nodesById) {
  return nodesById.get(nodeId)?.name || "None"
}

function getNodeRoles(nodeId, gatewayNodeId, backupGatewayNodeId, includedNodeIds) {
  const isGateway = gatewayNodeId === nodeId
  const isBackupGateway = backupGatewayNodeId === nodeId
  const isIncluded = includedNodeIds.includes(nodeId)

  return {
    isBackupGateway,
    isGateway,
    isIncluded,
  }
}

function buildRadioNetworkConfig(includedNodeIds, gatewayNodeId, backupGatewayNodeId) {
  const gateways = [gatewayNodeId, backupGatewayNodeId].filter(Boolean)

  return {
    version: 1,
    gateways,
    nodes: includedNodeIds.map((nodeId) => {
      const isGatewayNode = nodeId === gatewayNodeId || nodeId === backupGatewayNodeId
      const preferredGateway =
        nodeId === gatewayNodeId || nodeId === backupGatewayNodeId
          ? nodeId
          : gatewayNodeId || backupGatewayNodeId || nodeId

      let fallbackGateway = 0

      if (nodeId === gatewayNodeId && backupGatewayNodeId) {
        fallbackGateway = backupGatewayNodeId
      } else if (nodeId === backupGatewayNodeId && gatewayNodeId) {
        fallbackGateway = gatewayNodeId
      } else if (
        nodeId !== gatewayNodeId &&
        nodeId !== backupGatewayNodeId &&
        gatewayNodeId &&
        backupGatewayNodeId
      ) {
        fallbackGateway = backupGatewayNodeId
      }

      return {
        nodeId,
        role: isGatewayNode ? "gateway" : "client",
        preferredGateway,
        fallbackGateway,
        enabled: true,
      }
    }),
  }
}

function NodeNetwork({ nodes }) {
  const networkRef = useRef(null)
  const dragStateRef = useRef(null)
  const [nodePositions, setNodePositions] = useState({})
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [gatewayNodeId, setGatewayNodeId] = useState(null)
  const [backupGatewayNodeId, setBackupGatewayNodeId] = useState(null)
  const [includedNodeIds, setIncludedNodeIds] = useState([])
  const [configStatus, setConfigStatus] = useState("")
  const [isPublishingConfig, setIsPublishingConfig] = useState(false)
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  })

  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  useEffect(() => {
    if (!networkRef.current) {
      return undefined
    }

    const updateCanvasSize = () => {
      if (!networkRef.current) {
        return
      }

      const bounds = networkRef.current.getBoundingClientRect()
      setCanvasSize({
        width: Math.max(bounds.width, NODE_RADIUS * 2),
        height: Math.max(bounds.height, NODE_RADIUS * 2),
      })
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(() => updateCanvasSize())
    resizeObserver.observe(networkRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    setNodePositions((currentPositions) => {
      const nextPositions = {}

      nodes.forEach((node, index) => {
        const existingPosition = currentPositions[node.id]
        const fallbackPosition = buildInitialPosition(index, nodes.length, canvasSize)

        nextPositions[node.id] = existingPosition
          ? {
              x: clamp(existingPosition.x, NODE_RADIUS, canvasSize.width - NODE_RADIUS),
              y: clamp(existingPosition.y, NODE_RADIUS, canvasSize.height - NODE_RADIUS),
            }
          : fallbackPosition
      })

      return nextPositions
    })

    setSelectedNodeId((currentSelectedNodeId) =>
      nodes.some((node) => node.id === currentSelectedNodeId) ? currentSelectedNodeId : null
    )
    setGatewayNodeId((currentGatewayNodeId) =>
      nodes.some((node) => node.id === currentGatewayNodeId) ? currentGatewayNodeId : null
    )
    setBackupGatewayNodeId((currentBackupGatewayNodeId) =>
      nodes.some((node) => node.id === currentBackupGatewayNodeId) ? currentBackupGatewayNodeId : null
    )
    setIncludedNodeIds((currentIncludedNodeIds) =>
      currentIncludedNodeIds.filter((nodeId) => nodes.some((node) => node.id === nodeId))
    )
  }, [canvasSize.height, canvasSize.width, nodes])

  useEffect(() => {
    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current

      if (!dragState || !networkRef.current) {
        return
      }

      const bounds = networkRef.current.getBoundingClientRect()

      if (
        Math.abs(event.clientX - dragState.startX) > DRAG_THRESHOLD ||
        Math.abs(event.clientY - dragState.startY) > DRAG_THRESHOLD
      ) {
        dragState.hasMoved = true
      }

      const x = clamp(event.clientX - bounds.left - dragState.offsetX, NODE_RADIUS, bounds.width - NODE_RADIUS)
      const y = clamp(event.clientY - bounds.top - dragState.offsetY, NODE_RADIUS, bounds.height - NODE_RADIUS)

      setNodePositions((currentPositions) => ({
        ...currentPositions,
        [dragState.nodeId]: { x, y },
      }))
    }

    const handlePointerUp = () => {
      dragStateRef.current = null
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const handlePointerDown = (event, nodeId) => {
    if (!networkRef.current) {
      return
    }

    const bounds = networkRef.current.getBoundingClientRect()
    const position = nodePositions[nodeId]

    dragStateRef.current = {
      hasMoved: false,
      nodeId,
      offsetX: event.clientX - bounds.left - position.x,
      offsetY: event.clientY - bounds.top - position.y,
      startX: event.clientX,
      startY: event.clientY,
    }
  }

  const handleNodeClick = (nodeId) => {
    if (dragStateRef.current?.hasMoved) {
      dragStateRef.current = null
      return
    }

    setSelectedNodeId((currentSelectedNodeId) => (currentSelectedNodeId === nodeId ? null : nodeId))
  }

  const toggleNodeIncluded = (nodeId) => {
    setIncludedNodeIds((currentIncludedNodeIds) => {
      const isIncluded = currentIncludedNodeIds.includes(nodeId)

      if (isIncluded) {
        if (gatewayNodeId === nodeId) {
          setGatewayNodeId(null)
        }

        if (backupGatewayNodeId === nodeId) {
          setBackupGatewayNodeId(null)
        }

        return currentIncludedNodeIds.filter((currentNodeId) => currentNodeId !== nodeId)
      }

      return [...currentIncludedNodeIds, nodeId]
    })
  }

  const assignGatewayRole = (role, nodeId) => {
    setIncludedNodeIds((currentIncludedNodeIds) =>
      currentIncludedNodeIds.includes(nodeId) ? currentIncludedNodeIds : [...currentIncludedNodeIds, nodeId]
    )

    if (role === "primary") {
      setGatewayNodeId(nodeId)
      if (backupGatewayNodeId === nodeId) {
        setBackupGatewayNodeId(null)
      }
      return
    }

    setBackupGatewayNodeId(nodeId)
    if (gatewayNodeId === nodeId) {
      setGatewayNodeId(null)
    }
  }

  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) : null

  const handleExportNetwork = () => {
    const radioNetwork = buildRadioNetworkConfig(includedNodeIds, gatewayNodeId, backupGatewayNodeId)

    const blob = new Blob([JSON.stringify(radioNetwork, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "radio-network-config.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setConfigStatus("Downloaded the current radio network configuration JSON.")
  }

  const handlePublishNetwork = async () => {
    setIsPublishingConfig(true)
    setConfigStatus("")

    try {
      const radioNetwork = buildRadioNetworkConfig(includedNodeIds, gatewayNodeId, backupGatewayNodeId)
      const response = await fetch(`${API_BASE_URL}/configuration/radio-network`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(radioNetwork),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || "Failed to send configuration to Firebase")
      }

      setConfigStatus(`Configuration saved to Firebase at ${payload.path || "config/radio-network"}.`)
    } catch (error) {
      setConfigStatus(error.message || "Failed to send configuration to Firebase")
    } finally {
      setIsPublishingConfig(false)
    }
  }

  return (
    <section className="node-network-panel">
      <div className="flex items-start justify-between gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-[14px] py-3 text-[0.95rem] text-[var(--muted)]">
        <div>
          <span className="text-[var(--text)]">Node Network</span>
          <p className="mt-1 text-[0.78rem] leading-[1.35] text-[#b8c4d7]">
            Drag nodes to reposition them. Click a node to manage gateway roles and radio-network inclusion.
          </p>
          {configStatus && <p className="mt-2 text-[0.78rem] leading-[1.35] text-[#b8c4d7]">{configStatus}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExportNetwork}
            disabled={includedNodeIds.length === 0}
          >
            Download Config JSON
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublishNetwork}
            disabled={includedNodeIds.length === 0 || isPublishingConfig}
          >
            {isPublishingConfig ? "Sending..." : "Send to Firebase"}
          </Button>
        </div>
      </div>

      <div className="node-network-layout">
        <div className="node-network-shell">
          <div className="node-network-canvas" ref={networkRef}>
            {nodes.length === 0 ? (
              <div className="max-w-[420px] rounded-[12px] border border-dashed border-[rgba(154,164,181,0.35)] bg-[rgba(255,255,255,0.02)] px-5 py-[18px] text-[var(--muted)]">
                Create a node first to start arranging your layout.
              </div>
            ) : (
              <>
                {nodes.map((node) => {
                  const position = nodePositions[node.id] || buildInitialPosition(0, nodes.length, canvasSize)
                  const isSelected = selectedNodeId === node.id
                  const { isIncluded, isGateway, isBackupGateway } = getNodeRoles(
                    node.id,
                    gatewayNodeId,
                    backupGatewayNodeId,
                    includedNodeIds
                  )
                  const nodeClassName = [
                    "node-network-node",
                    isSelected ? "is-selected" : "",
                    isIncluded ? "is-included" : "",
                    isGateway ? "is-gateway" : "",
                    isBackupGateway ? "is-backup-gateway" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={nodeClassName}
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                      }}
                      onPointerDown={(event) => handlePointerDown(event, node.id)}
                      onClick={() => handleNodeClick(node.id)}
                      title={node.name}
                    >
                      <span className="node-network-node-badges" aria-hidden="true">
                        {isGateway ? <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#facc15] text-[0.64rem] font-extrabold leading-none text-[#08111b]">G</span> : null}
                        {isBackupGateway ? <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f87171] text-[0.64rem] font-extrabold leading-none text-[#08111b]">B</span> : null}
                        {isIncluded && !isGateway && !isBackupGateway ? (
                          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#4ade80] text-[0.64rem] font-extrabold leading-none text-[#08111b]">R</span>
                        ) : null}
                      </span>
                      <span className="text-[0.78rem] font-bold leading-[1.2]">{truncateNodeLabel(node.name)}</span>
                    </button>
                  )
                })}
              </>
            )}
          </div>

          <Card className="node-network-summary-block shadow-none">
            <CardContent className="p-3">
              <p className="mb-[6px] text-[0.72rem] uppercase tracking-[0.08em] text-[#aebbd0]">Network Summary</p>
              {includedNodeIds.length === 0 ? (
                <p className="m-0 leading-[1.35] text-[var(--muted)]">No nodes are currently included in the radio network.</p>
              ) : (
                <div className="node-network-summary-list">
                  {nodes
                    .filter((node) => includedNodeIds.includes(node.id))
                    .map((node) => {
                      const { isGateway, isBackupGateway, isIncluded } = getNodeRoles(
                        node.id,
                        gatewayNodeId,
                        backupGatewayNodeId,
                        includedNodeIds
                      )

                      return (
                        <button
                          key={node.id}
                          type="button"
                          className={`flex w-full min-h-0 items-start justify-between gap-[10px] rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.38)] px-[10px] py-2 text-left text-[var(--text)] ${selectedNodeId === node.id ? "border-[rgba(125,211,252,0.45)] bg-[rgba(14,165,233,0.1)]" : ""}`}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <span className="min-w-0 text-[0.82rem] font-bold leading-[1.3]">{node.name}</span>
                          <span className="flex flex-wrap justify-end gap-1">
                            {isGateway ? <span className="inline-flex items-center rounded-full bg-[rgba(250,204,21,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#fde68a]">Gateway</span> : null}
                            {isBackupGateway ? <span className="inline-flex items-center rounded-full bg-[rgba(248,113,113,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#fecaca]">Backup</span> : null}
                            {isIncluded ? <span className="inline-flex items-center rounded-full bg-[rgba(74,222,128,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#bbf7d0]">In Network</span> : null}
                          </span>
                        </button>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          <aside className="node-network-sidebar">
            <Card className="shadow-none">
              <CardContent className="p-3">
                <p className="mb-[6px] text-[0.72rem] uppercase tracking-[0.08em] text-[#aebbd0]">Gateway</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-[10px]">
                    <span className="min-w-5 text-[0.82rem] font-bold text-[#94a3b8]">1.</span>
                    <span className="m-0 leading-[1.35] text-[var(--text)]">{formatNodeName(gatewayNodeId, nodesById)}</span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className="min-w-5 text-[0.82rem] font-bold text-[#94a3b8]">2.</span>
                    <span className="m-0 leading-[1.35] text-[var(--text)]">{formatNodeName(backupGatewayNodeId, nodesById)}</span>
                  </div>
                </div>
                <div className="mt-[10px] flex flex-col gap-[6px]">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => selectedNode && assignGatewayRole("primary", selectedNode.id)}
                    disabled={!selectedNode}
                  >
                    Add Gateway
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => selectedNode && assignGatewayRole("backup", selectedNode.id)}
                    disabled={!selectedNode}
                  >
                    Add Backup Gateway
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-3">
                <p className="mb-[6px] text-[0.72rem] uppercase tracking-[0.08em] text-[#aebbd0]">Selected Node</p>
                <p className="mb-[10px] text-[0.8rem] leading-[1.35] text-[var(--muted)]">{includedNodeIds.length} node(s) in the radio network</p>
                {selectedNode ? (
                  <>
                    <p className="m-0 leading-[1.35] text-[var(--text)]">{selectedNode.name}</p>
                    <div className="mt-[10px] flex flex-wrap gap-[6px]">
                      {gatewayNodeId === selectedNode.id ? (
                        <span className="inline-flex items-center rounded-full bg-[rgba(250,204,21,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#fde68a]">Gateway</span>
                      ) : null}
                      {backupGatewayNodeId === selectedNode.id ? (
                        <span className="inline-flex items-center rounded-full bg-[rgba(248,113,113,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#fecaca]">Backup Gateway</span>
                      ) : null}
                      {includedNodeIds.includes(selectedNode.id) ? (
                        <span className="inline-flex items-center rounded-full bg-[rgba(74,222,128,0.16)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#bbf7d0]">In Radio Network</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[rgba(148,163,184,0.14)] px-2 py-1 text-[0.7rem] font-bold leading-none text-[#cbd5e1]">Excluded</span>
                      )}
                    </div>
                    <div className="mt-[10px] flex flex-col gap-[6px]">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => toggleNodeIncluded(selectedNode.id)}
                      >
                        {includedNodeIds.includes(selectedNode.id) ? "Remove from Radio Network" : "Include in Radio Network"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          if (gatewayNodeId === selectedNode.id) {
                            setGatewayNodeId(null)
                          }

                          if (backupGatewayNodeId === selectedNode.id) {
                            setBackupGatewayNodeId(null)
                          }
                        }}
                        disabled={gatewayNodeId !== selectedNode.id && backupGatewayNodeId !== selectedNode.id}
                      >
                        Clear Gateway Role
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="m-0 leading-[1.35] text-[var(--muted)]">Click a node to manage its network role.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default NodeNetwork
