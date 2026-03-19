import React, { useMemo, useState } from "react";

const statusOptions = [
  "Active",
  "Reserve",
  "Inactive",
  "Unassigned",
  "LOA",
  "Probationary"
];

const rankOptions = [
  "Colonel",
  "Lieutenant Colonel",
  "Major",
  "Captain",
  "First Lieutenant",
  "Second Lieutenant",
  "Sergeant Major",
  "First Sergeant",
  "Master Sergeant",
  "Sergeant First Class",
  "Staff Sergeant",
  "Sergeant",
  "Corporal",
  "Specialist",
  "Trooper First Class",
  "Trooper Second Class",
  "Trooper Third Class"
];

const initialSettings = {
  quals: ["Gunner", "Marksman", "Medic", "RTO/JTAC"],
  ranks: rankOptions,
  statuses: statusOptions
};

const initialCoreTree = [
  {
    id: "core-hq",
    name: "Battalion HQ",
    kind: "HQ",
    permanent: true,
    children: [
      { id: "cmd", name: "Command Group", kind: "Section", permanent: true, children: [] },
      { id: "s1", name: "S-1 Personnel", kind: "Section", permanent: true, children: [] },
      { id: "s2", name: "S-2 Intelligence", kind: "Section", permanent: true, children: [] },
      { id: "s3", name: "S-3 Operations", kind: "Section", permanent: true, children: [] },
      { id: "s4", name: "S-4 Logistics", kind: "Section", permanent: true, children: [] }
    ]
  }
];

const initialTaskOrgs = [
  {
    id: "op-iron-veil",
    name: "Operation Iron Veil",
    kind: "Operation",
    temporary: true,
    children: [
      {
        id: "tf-aurek",
        name: "Task Force Aurek",
        kind: "Task Force",
        temporary: true,
        children: [
          { id: "tf-aurek-assault", name: "Assault Group Alpha", kind: "Element", temporary: true, children: [] },
          { id: "tf-aurek-recon", name: "Recon Cell Besh", kind: "Element", temporary: true, children: [] },
          { id: "tf-aurek-air", name: "Air Package Hammer", kind: "Element", temporary: true, children: [] }
        ]
      }
    ]
  }
];

const initialPersonnel = [
  {
    id: 1,
    display: 'CC-0281-3292 "Point"',
    roblox: "BODYSTACK",
    discord: "point.actual",
    rank: "Colonel",
    role: "Battalion Commander",
    status: "Active",
    quals: ["RTO/JTAC"],
    notes: "Command profile.",
    home: {
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "Command Group",
      squad: "—"
    },
    attachment: null
  },
  {
    id: 2,
    display: 'CT-7706-2809 "Copper"',
    roblox: "britannic12321",
    discord: "copper.flight",
    rank: "Trooper Third Class",
    role: "Pilot",
    status: "Active",
    quals: [],
    notes: "",
    home: {
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "Unassigned Aviation Cadre",
      squad: "—"
    },
    attachment: {
      operation: "Operation Iron Veil",
      taskUnit: "Air Package Hammer"
    }
  },
  {
    id: 3,
    display: 'CT-9553-2812 "Wonder"',
    roblox: "Wonderanovuh",
    discord: "wonder.ops",
    rank: "Trooper Third Class",
    role: "Combat Medic",
    status: "Reserve",
    quals: ["Medic"],
    notes: "",
    home: {
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "Personnel Holding",
      squad: "—"
    },
    attachment: null
  },
  {
    id: 4,
    display: 'CT-8372-2111 "Quantum"',
    roblox: "JetQuantum",
    discord: "quantum.hold",
    rank: "Specialist",
    role: "Pathfinder Candidate",
    status: "Probationary",
    quals: ["Marksman"],
    notes: "",
    home: {
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "Personnel Holding",
      squad: "—"
    },
    attachment: {
      operation: "Operation Iron Veil",
      taskUnit: "Recon Cell Besh"
    }
  }
];

function flattenTree(nodes, acc = []) {
  for (const node of nodes) {
    acc.push(node.name);
    if (node.children?.length) flattenTree(node.children, acc);
  }
  return acc;
}

function addChild(nodes, parentName, child) {
  return nodes.map((node) => {
    if (node.name === parentName) {
      return { ...node, children: [...(node.children || []), child] };
    }
    if (node.children?.length) {
      return { ...node, children: addChild(node.children, parentName, child) };
    }
    return node;
  });
}

function removeNode(nodes, targetName) {
  return nodes
    .filter((node) => node.name !== targetName)
    .map((node) => ({
      ...node,
      children: node.children?.length ? removeNode(node.children, targetName) : []
    }));
}

function renameNode(nodes, oldName, newName) {
  return nodes.map((node) => ({
    ...node,
    name: node.name === oldName ? newName : node.name,
    children: node.children?.length ? renameNode(node.children, oldName, newName) : []
  }));
}

function findTopOperationForTarget(nodes, targetName, currentOp = null) {
  for (const node of nodes) {
    const opName = node.kind === "Operation" ? node.name : currentOp;
    if (node.name === targetName) return opName;
    if (node.children?.length) {
      const found = findTopOperationForTarget(node.children, targetName, opName);
      if (found) return found;
    }
  }
  return null;
}

function statusClass(status) {
  switch (status) {
    case "Active":
      return "tag tag-cyan";
    case "Reserve":
      return "tag tag-blue";
    case "Inactive":
      return "tag tag-amber";
    case "Unassigned":
      return "tag tag-red";
    case "LOA":
      return "tag tag-purple";
    case "Probationary":
      return "tag tag-lime";
    default:
      return "tag";
  }
}

function qualClass(qual) {
  switch (qual) {
    case "Gunner":
      return "tag tag-amber";
    case "Marksman":
      return "tag tag-purple";
    case "Medic":
      return "tag tag-green";
    case "RTO/JTAC":
      return "tag tag-cyan";
    default:
      return "tag";
  }
}

function TreeNode({
  node,
  selectedNode,
  setSelectedNode,
  adminMode,
  onQuickCreate,
  onRemove,
  mode = "core"
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div className={`tree-row ${selectedNode === node.name ? "selected" : ""}`}>
        <button
          className="tree-main"
          onClick={() => {
            setSelectedNode(node.name);
            if (hasChildren) setOpen(!open);
          }}
        >
          <span className="tree-chevron">{hasChildren ? (open ? "▾" : "▸") : "•"}</span>
          <span className="tree-kind">{node.kind}</span>
          <span className="tree-name">{node.name}</span>
          <span className={node.temporary ? "tree-state temp" : "tree-state perm"}>
            {node.temporary ? "TEMP" : "CORE"}
          </span>
        </button>

        {adminMode && (
          <div className="tree-actions">
            <button className="mini-btn" onClick={() => onQuickCreate(node.name, mode)}>+</button>
            {node.name !== "Battalion HQ" && (
              <button className="mini-btn danger" onClick={() => onRemove(node.name, mode)}>-</button>
            )}
          </div>
        )}
      </div>

      {hasChildren && open && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              adminMode={adminMode}
              onQuickCreate={onQuickCreate}
              onRemove={onRemove}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [coreTree, setCoreTree] = useState(initialCoreTree);
  const [taskOrgTree, setTaskOrgTree] = useState(initialTaskOrgs);
  const [personnel, setPersonnel] = useState(initialPersonnel);

  const [viewMode, setViewMode] = useState("core");
  const [selectedNode, setSelectedNode] = useState("All Units");
  const [selectedMember, setSelectedMember] = useState(initialPersonnel[0]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [adminMode, setAdminMode] = useState(true);

  const [newNodeParent, setNewNodeParent] = useState("Battalion HQ");
  const [newNodeType, setNewNodeType] = useState("Company");
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeTemporary, setNewNodeTemporary] = useState(false);

  const [renameTarget, setRenameTarget] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const [newQual, setNewQual] = useState("");
  const [newRank, setNewRank] = useState("");

  const [draft, setDraft] = useState({
    display: "",
    roblox: "",
    discord: "",
    rank: "Trooper Third Class",
    role: "",
    status: "Active",
    quals: [],
    notes: "",
    home: {
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "Personnel Holding",
      squad: "—"
    }
  });

  const [attachmentTarget, setAttachmentTarget] = useState("");
  const [attachmentMemberId, setAttachmentMemberId] = useState("");

  const currentTree = viewMode === "core" ? coreTree : taskOrgTree;
  const allCoreUnits = useMemo(() => flattenTree(coreTree, []), [coreTree]);
  const allTaskUnits = useMemo(() => flattenTree(taskOrgTree, []), [taskOrgTree]);
  const allVisibleUnits = viewMode === "core" ? allCoreUnits : allTaskUnits;

  const stats = useMemo(() => {
    const count = (s) => personnel.filter((p) => p.status === s).length;
    return {
      total: personnel.length,
      active: count("Active"),
      reserve: count("Reserve"),
      inactive: count("Inactive"),
      unassigned: count("Unassigned"),
      loa: count("LOA"),
      probationary: count("Probationary"),
      attached: personnel.filter((p) => p.attachment).length
    };
  }, [personnel]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((p) => {
      const text =
        `${p.display} ${p.roblox} ${p.discord} ${p.rank} ${p.role} ${p.home.unit} ${p.home.company} ${p.home.platoon} ${p.home.squad} ${p.attachment?.taskUnit || ""}`.toLowerCase();

      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;

      let matchesNode = true;
      if (selectedNode !== "All Units") {
        if (viewMode === "core") {
          matchesNode = [
            p.home.unit,
            p.home.company,
            p.home.platoon,
            p.home.squad
          ].includes(selectedNode);
        } else {
          matchesNode =
            p.attachment?.taskUnit === selectedNode ||
            p.attachment?.operation === selectedNode;
        }
      }

      return matchesQuery && matchesStatus && matchesNode;
    });
  }, [personnel, query, statusFilter, selectedNode, viewMode]);

  const taskOrgCards = useMemo(() => {
    return taskOrgTree.map((op) => ({
      operation: op.name,
      groups: op.children || []
    }));
  }, [taskOrgTree]);

  function handleCreateNode() {
    if (!newNodeName.trim()) return;

    const id = `${newNodeType.toLowerCase()}-${Date.now()}`;
    const isTemp = newNodeTemporary || viewMode === "task";
    const child = {
      id,
      name: newNodeName.trim(),
      kind: newNodeType,
      temporary: isTemp,
      permanent: !isTemp,
      children: []
    };

    let created = child;

    if (
      ["Company", "Detachment", "Wing", "Platoon", "Flight", "Operation", "Task Force"].includes(newNodeType)
    ) {
      let hqLabel = "HQ";
      if (newNodeType === "Operation") hqLabel = "Command Cell";
      if (newNodeType === "Task Force") hqLabel = "Task Force HQ";

      created = {
        ...child,
        children: [
          {
            id: `${id}-hq`,
            name: `${newNodeName.trim()} ${hqLabel}`,
            kind: "Section",
            temporary: isTemp,
            permanent: !isTemp,
            children: []
          }
        ]
      };
    }

    if (viewMode === "core") {
      if (newNodeParent === "ROOT") {
        setCoreTree((prev) => [...prev, created]);
      } else {
        setCoreTree((prev) => addChild(prev, newNodeParent, created));
      }
    } else {
      if (newNodeParent === "ROOT") {
        setTaskOrgTree((prev) => [...prev, created]);
      } else {
        setTaskOrgTree((prev) => addChild(prev, newNodeParent, created));
      }
    }

    setNewNodeName("");
  }

  function handleRemoveNode(name, mode) {
    if (mode === "core") {
      setCoreTree((prev) => removeNode(prev, name));
    } else {
      setTaskOrgTree((prev) => removeNode(prev, name));
      setPersonnel((prev) =>
        prev.map((p) =>
          p.attachment &&
          (p.attachment.taskUnit === name || p.attachment.operation === name)
            ? { ...p, attachment: null }
            : p
        )
      );
    }

    if (selectedNode === name) setSelectedNode("All Units");
  }

  function handleRenameNode() {
    if (!renameTarget || !renameValue.trim()) return;

    if (viewMode === "core") {
      setCoreTree((prev) => renameNode(prev, renameTarget, renameValue.trim()));
      setPersonnel((prev) =>
        prev.map((p) => ({
          ...p,
          home: {
            ...p.home,
            unit: p.home.unit === renameTarget ? renameValue.trim() : p.home.unit,
            company: p.home.company === renameTarget ? renameValue.trim() : p.home.company,
            platoon: p.home.platoon === renameTarget ? renameValue.trim() : p.home.platoon,
            squad: p.home.squad === renameTarget ? renameValue.trim() : p.home.squad
          }
        }))
      );
    } else {
      setTaskOrgTree((prev) => renameNode(prev, renameTarget, renameValue.trim()));
      setPersonnel((prev) =>
        prev.map((p) =>
          p.attachment
            ? {
                ...p,
                attachment: {
                  ...p.attachment,
                  operation:
                    p.attachment.operation === renameTarget
                      ? renameValue.trim()
                      : p.attachment.operation,
                  taskUnit:
                    p.attachment.taskUnit === renameTarget
                      ? renameValue.trim()
                      : p.attachment.taskUnit
                }
              }
            : p
        )
      );
    }

    if (selectedNode === renameTarget) setSelectedNode(renameValue.trim());
    setRenameTarget("");
    setRenameValue("");
  }

  function handleQuickCreate(parentName, mode) {
    setViewMode(mode);
    setNewNodeParent(parentName);

    if (mode === "core") {
      setNewNodeTemporary(false);
      setNewNodeType(parentName === "Battalion HQ" ? "Company" : "Platoon");
    } else {
      setNewNodeTemporary(true);
      if (parentName.startsWith("Operation ")) {
        setNewNodeType("Task Force");
      } else {
        setNewNodeType("Element");
      }
    }
  }

  function toggleDraftQual(qual) {
    setDraft((prev) => ({
      ...prev,
      quals: prev.quals.includes(qual)
        ? prev.quals.filter((q) => q !== qual)
        : [...prev.quals, qual]
    }));
  }

  function handleAddMember() {
    if (!draft.display.trim() || !draft.roblox.trim()) return;

    const newMember = {
      id: Date.now(),
      ...draft,
      attachment: null
    };

    setPersonnel((prev) => [newMember, ...prev]);
    setSelectedMember(newMember);

    setDraft({
      display: "",
      roblox: "",
      discord: "",
      rank: "Trooper Third Class",
      role: "",
      status: "Active",
      quals: [],
      notes: "",
      home: {
        unit: "Battalion HQ",
        company: "HQ",
        platoon: "Personnel Holding",
        squad: "—"
      }
    });
  }

  function handleAttachMember() {
    if (!attachmentMemberId || !attachmentTarget) return;

    const opName = findTopOperationForTarget(taskOrgTree, attachmentTarget, null);

    setPersonnel((prev) =>
      prev.map((p) =>
        String(p.id) === String(attachmentMemberId)
          ? {
              ...p,
              attachment: {
                operation: opName || attachmentTarget,
                taskUnit: attachmentTarget
              }
            }
          : p
      )
    );

    const found = personnel.find((p) => String(p.id) === String(attachmentMemberId));
    if (found) {
      setSelectedMember({
        ...found,
        attachment: {
          operation: opName || attachmentTarget,
          taskUnit: attachmentTarget
        }
      });
    }
  }

  function handleDetachSelected() {
    if (!selectedMember) return;

    setPersonnel((prev) =>
      prev.map((p) =>
        p.id === selectedMember.id
          ? {
              ...p,
              attachment: null
            }
          : p
      )
    );

    setSelectedMember((prev) => ({ ...prev, attachment: null }));
  }

  function handleMoveToParentPool() {
    if (!selectedMember) return;

    const currentSquad = selectedMember.home.squad;
    const currentPlatoon = selectedMember.home.platoon;
    const currentCompany = selectedMember.home.company;

    let nextHome = { ...selectedMember.home };

    if (currentSquad && currentSquad !== "—") {
      nextHome.squad = "Platoon Pool";
    } else if (currentPlatoon && currentPlatoon !== "—" && currentPlatoon !== "Personnel Holding") {
      nextHome.platoon = "Company Pool";
      nextHome.squad = "—";
    } else if (currentCompany && currentCompany !== "HQ" && currentCompany !== "—") {
      nextHome.company = "Battalion Pool";
      nextHome.platoon = "—";
      nextHome.squad = "—";
      nextHome.unit = "Battalion HQ";
    } else {
      nextHome.unit = "Unassigned";
      nextHome.company = "Unassigned";
      nextHome.platoon = "—";
      nextHome.squad = "—";
    }

    setPersonnel((prev) =>
      prev.map((p) => (p.id === selectedMember.id ? { ...p, home: nextHome } : p))
    );
    setSelectedMember((prev) => ({ ...prev, home: nextHome }));
  }

  function addSettingValue(type, value) {
    if (!value.trim()) return;
    setSettings((prev) => {
      const current = prev[type];
      if (current.includes(value.trim())) return prev;
      return { ...prev, [type]: [...current, value.trim()] };
    });
  }

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="topbar">
        <div>
          <div className="eyebrow">GALACTIC REPUBLIC SPECIAL OPERATIONS BRIGADE // COMMAND CONSOLE</div>
          <h1>Mythosaur Battalion</h1>
        </div>

        <div className="topbar-actions">
          <span className="pill cyan">C2 ONLINE</span>
          <span className="pill amber">PAGES LIVE</span>
          <label className="admin-toggle">
            <span>Admin Mode</span>
            <input
              type="checkbox"
              checked={adminMode}
              onChange={(e) => setAdminMode(e.target.checked)}
            />
          </label>
        </div>
      </header>

      <section className="stats-grid stats-grid-8">
        <div className="stat-card"><span>Personnel</span><strong>{stats.total}</strong></div>
        <div className="stat-card"><span>Active</span><strong>{stats.active}</strong></div>
        <div className="stat-card"><span>Reserve</span><strong>{stats.reserve}</strong></div>
        <div className="stat-card"><span>Inactive</span><strong>{stats.inactive}</strong></div>
        <div className="stat-card"><span>Unassigned</span><strong>{stats.unassigned}</strong></div>
        <div className="stat-card"><span>LOA</span><strong>{stats.loa}</strong></div>
        <div className="stat-card"><span>Probation</span><strong>{stats.probationary}</strong></div>
        <div className="stat-card"><span>Attached</span><strong>{stats.attached}</strong></div>
      </section>

      <div className="view-switcher">
        <button
          className={`view-tab ${viewMode === "core" ? "active-view" : ""}`}
          onClick={() => {
            setViewMode("core");
            setSelectedNode("All Units");
          }}
        >
          Core Structure
        </button>
        <button
          className={`view-tab ${viewMode === "task" ? "active-view" : ""}`}
          onClick={() => {
            setViewMode("task");
            setSelectedNode("All Units");
          }}
        >
          Operations Task Organization
        </button>
      </div>

      <main className="layout">
        <aside className="panel">
          <div className="panel-header">
            <h2>{viewMode === "core" ? "Core ORBAT" : "Task Organization"}</h2>
            <p>
              {viewMode === "core"
                ? "Permanent battalion structure. Starts with Battalion HQ only."
                : "Temporary operation-built formations. Personnel remain in home unit and attach here."}
            </p>
          </div>

          <div className="tree-root">
            <button
              className={`tree-main root-all ${selectedNode === "All Units" ? "selected-btn" : ""}`}
              onClick={() => setSelectedNode("All Units")}
            >
              All Units
            </button>

            {currentTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                adminMode={adminMode}
                onQuickCreate={handleQuickCreate}
                onRemove={handleRemoveNode}
                mode={viewMode}
              />
            ))}
          </div>
        </aside>

        <section className="panel middle-panel">
          <div className="panel-header">
            <h2>Command &amp; Control Console</h2>
            <p>
              Force generation, roster control, settings, and attachment management.
            </p>
          </div>

          <div className="toolbar">
            <input
              className="input"
              placeholder="Search personnel..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              {settings.statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="selected-unit">{selectedNode}</div>

          {viewMode === "task" && (
            <div className="task-board">
              {taskOrgCards.map((op) => (
                <div key={op.operation} className="task-op-card">
                  <div className="task-op-header">
                    <div className="eyebrow">Operation</div>
                    <h3>{op.operation}</h3>
                  </div>

                  <div className="task-group-grid">
                    {op.groups.map((group) => (
                      <div key={group.id} className="task-group-card">
                        <div className="task-group-title">{group.name}</div>
                        <div className="task-group-sub">{group.kind}</div>

                        <div className="task-attached-list">
                          {personnel
                            .filter((p) => p.attachment?.taskUnit === group.name)
                            .map((p) => (
                              <div key={p.id} className="task-attached-chip">
                                <span>{p.display}</span>
                                <small>{p.role}</small>
                              </div>
                            ))}

                          {!personnel.some((p) => p.attachment?.taskUnit === group.name) && (
                            <div className="muted">No personnel attached.</div>
                          )}
                        </div>

                        {group.children?.length > 0 && (
                          <div className="task-subnodes">
                            {group.children.map((child) => (
                              <div key={child.id} className="task-subnode">
                                <strong>{child.name}</strong>
                                <span>{child.kind}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="roster-list">
            {filteredPersonnel.map((p) => (
              <button
                key={p.id}
                className={`roster-card ${selectedMember?.id === p.id ? "active-card" : ""}`}
                onClick={() => setSelectedMember(p)}
              >
                <div className="roster-main">
                  <div className="roster-name">{p.display}</div>
                  <div className="roster-sub">{p.roblox} · @{p.discord}</div>
                  <div className="tag-row">
                    <span className="tag">{p.rank}</span>
                    <span className="tag tag-cyan">{p.role}</span>
                    <span className={statusClass(p.status)}>{p.status}</span>
                    {p.attachment && <span className="tag tag-purple">ATTACHED</span>}
                  </div>
                </div>

                <div className="roster-meta">
                  <div>{p.home.company}</div>
                  <div>{p.home.platoon}</div>
                  <div>{p.home.squad}</div>
                </div>
              </button>
            ))}
          </div>

          {adminMode && (
            <div className="admin-grid">
              <div className="admin-box">
                <h3>Force Generation</h3>
                <select className="input" value={newNodeParent} onChange={(e) => setNewNodeParent(e.target.value)}>
                  <option value="ROOT">ROOT</option>
                  {allVisibleUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <select className="input" value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)}>
                  {viewMode === "core" ? (
                    <>
                      <option>Company</option>
                      <option>Detachment</option>
                      <option>Wing</option>
                      <option>Platoon</option>
                      <option>Squad</option>
                      <option>Section</option>
                    </>
                  ) : (
                    <>
                      <option>Operation</option>
                      <option>Task Force</option>
                      <option>Element</option>
                      <option>Section</option>
                    </>
                  )}
                </select>

                <input
                  className="input"
                  placeholder="New unit name"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                />

                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={newNodeTemporary}
                    onChange={(e) => setNewNodeTemporary(e.target.checked)}
                    disabled={viewMode === "task"}
                  />
                  <span>Temporary unit</span>
                </label>

                <button className="btn" onClick={handleCreateNode}>Generate Unit</button>
              </div>

              <div className="admin-box">
                <h3>Structure Editor</h3>
                <select className="input" value={renameTarget} onChange={(e) => setRenameTarget(e.target.value)}>
                  <option value="">Select node</option>
                  {allVisibleUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <input
                  className="input"
                  placeholder="Rename selected node"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />

                <button className="btn amber-btn" onClick={handleRenameNode}>Rename Unit</button>
              </div>

              <div className="admin-box admin-box-wide">
                <h3>Personnel Manager</h3>

                <div className="form-grid">
                  <input
                    className="input"
                    placeholder='CT-0000-0000 "Callsign"'
                    value={draft.display}
                    onChange={(e) => setDraft({ ...draft, display: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Roblox username"
                    value={draft.roblox}
                    onChange={(e) => setDraft({ ...draft, roblox: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Discord username"
                    value={draft.discord}
                    onChange={(e) => setDraft({ ...draft, discord: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Role"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  />

                  <select className="input" value={draft.rank} onChange={(e) => setDraft({ ...draft, rank: e.target.value })}>
                    {settings.ranks.map((r) => <option key={r}>{r}</option>)}
                  </select>

                  <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    {settings.statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>

                  <select
                    className="input"
                    value={draft.home.unit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        home: { ...draft.home, unit: e.target.value }
                      })
                    }
                  >
                    {allCoreUnits.map((u) => <option key={u}>{u}</option>)}
                  </select>

                  <input
                    className="input"
                    placeholder="Company"
                    value={draft.home.company}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        home: { ...draft.home, company: e.target.value }
                      })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Platoon"
                    value={draft.home.platoon}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        home: { ...draft.home, platoon: e.target.value }
                      })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Squad / Pool / Slot"
                    value={draft.home.squad}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        home: { ...draft.home, squad: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="qual-selector">
                  {settings.quals.map((qual) => (
                    <button
                      key={qual}
                      className={draft.quals.includes(qual) ? qualClass(qual) : "tag"}
                      onClick={() => toggleDraftQual(qual)}
                      type="button"
                    >
                      {qual}
                    </button>
                  ))}
                </div>

                <button className="btn" onClick={handleAddMember}>Add Member</button>
              </div>

              <div className="admin-box">
                <h3>Task Attachment Control</h3>

                <select className="input" value={attachmentMemberId} onChange={(e) => setAttachmentMemberId(e.target.value)}>
                  <option value="">Select member</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>{p.display}</option>
                  ))}
                </select>

                <select className="input" value={attachmentTarget} onChange={(e) => setAttachmentTarget(e.target.value)}>
                  <option value="">Select task unit</option>
                  {allTaskUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <button className="btn" onClick={handleAttachMember}>Attach to Task Org</button>
              </div>

              <div className="admin-box">
                <h3>Doctrine Settings</h3>

                <div className="settings-stack">
                  <div>
                    <div className="mini-title">Qualification Tags</div>
                    <div className="tag-row tight">
                      {settings.quals.map((q) => <span key={q} className={qualClass(q)}>{q}</span>)}
                    </div>
                    <div className="inline-form">
                      <input
                        className="input"
                        placeholder="Add qualification"
                        value={newQual}
                        onChange={(e) => setNewQual(e.target.value)}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          addSettingValue("quals", newQual);
                          setNewQual("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mini-title">Ranks</div>
                    <div className="inline-form">
                      <input
                        className="input"
                        placeholder="Add rank"
                        value={newRank}
                        onChange={(e) => setNewRank(e.target.value)}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          addSettingValue("ranks", newRank);
                          setNewRank("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="panel">
          <div className="panel-header">
            <h2>Personnel Dossier</h2>
            <p>Republic special operations personnel record.</p>
          </div>

          {selectedMember && (
            <div className="dossier">
              <div className="dossier-top">
                <div>
                  <div className="eyebrow">Selected Personnel</div>
                  <h3>{selectedMember.display}</h3>
                  <p>{selectedMember.roblox} · @{selectedMember.discord}</p>
                </div>
                <span className="tag tag-cyan">{selectedMember.rank}</span>
              </div>

              <div className="dossier-grid">
                <div className="dossier-box"><span>Role</span><strong>{selectedMember.role}</strong></div>
                <div className="dossier-box"><span>Status</span><strong>{selectedMember.status}</strong></div>
                <div className="dossier-box"><span>Home Unit</span><strong>{selectedMember.home.unit}</strong></div>
                <div className="dossier-box"><span>Home Company</span><strong>{selectedMember.home.company}</strong></div>
                <div className="dossier-box"><span>Home Platoon</span><strong>{selectedMember.home.platoon}</strong></div>
                <div className="dossier-box"><span>Home Squad</span><strong>{selectedMember.home.squad}</strong></div>
              </div>

              <div className="dossier-section">
                <div className="eyebrow">Temporary Attachment</div>
                <div className="notes-box">
                  {selectedMember.attachment ? (
                    <>
                      <div><strong>Operation:</strong> {selectedMember.attachment.operation}</div>
                      <div><strong>Attached To:</strong> {selectedMember.attachment.taskUnit}</div>
                    </>
                  ) : (
                    "No current task organization attachment."
                  )}
                </div>
              </div>

              <div className="dossier-section">
                <div className="eyebrow">Qualifications</div>
                <div className="tag-row">
                  {selectedMember.quals.length
                    ? selectedMember.quals.map((q) => (
                        <span key={q} className={qualClass(q)}>
                          {q}
                        </span>
                      ))
                    : <span className="muted">No qualifications assigned.</span>}
                </div>
              </div>

              <div className="dossier-section">
                <div className="eyebrow">Notes</div>
                <div className="notes-box">{selectedMember.notes || "No command notes attached."}</div>
              </div>

              {adminMode && (
                <div className="dossier-actions">
                  <button className="btn" onClick={handleMoveToParentPool}>Move to Parent Pool</button>
                  <button className="btn amber-btn" onClick={handleDetachSelected}>Detach from Task Org</button>
                </div>
              )}
            </div>
          )}

          <div className="helper-box">
            <h3>Authority Model</h3>
            <p>
              Core ORBAT holds permanent home assignments. Task Organization uses temporary attachments.
              Personnel removed by leaders flow upward through parent pools instead of being deleted.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
