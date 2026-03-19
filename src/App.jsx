import React, { useMemo, useState } from "react";

const initialTree = [
  {
    id: "hq",
    name: "Battalion HQ",
    kind: "HQ",
    children: [
      { id: "cmd", name: "Command Group", kind: "Section", children: [] },
      { id: "s1", name: "S-1 Personnel", kind: "Section", children: [] },
      { id: "s2", name: "S-2 Intelligence", kind: "Section", children: [] },
      { id: "s3", name: "S-3 Operations", kind: "Section", children: [] },
      { id: "s4", name: "S-4 Logistics", kind: "Section", children: [] }
    ]
  },
  {
    id: "alpha",
    name: "Alpha Company",
    kind: "Company",
    children: [
      { id: "alpha-hq", name: "Company HQ", kind: "Section", children: [] },
      { id: "alpha-1", name: "1st Platoon", kind: "Platoon", children: [] },
      { id: "alpha-2", name: "2nd Platoon", kind: "Platoon", children: [] },
      { id: "alpha-3", name: "3rd Platoon", kind: "Platoon", children: [] }
    ]
  },
  {
    id: "aviation",
    name: "Aviation Wing",
    kind: "Wing",
    children: [
      { id: "aviation-hq", name: "Flight HQ", kind: "Section", children: [] },
      { id: "flight-a", name: "Alpha Flight", kind: "Flight", children: [] }
    ]
  },
  {
    id: "reserve",
    name: "Reserve Board",
    kind: "Reserve",
    children: []
  },
  {
    id: "unassigned",
    name: "Unassigned Pool",
    kind: "Pool",
    children: []
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
    unit: "Battalion HQ",
    company: "HQ",
    platoon: "Command Group",
    squad: "—",
    status: "Active",
    quals: ["RTO/JTAC"],
    notes: "Command profile."
  },
  {
    id: 2,
    display: 'CT-7706-2809 "Copper"',
    roblox: "britannic12321",
    discord: "copper.flight",
    rank: "Trooper Third Class",
    role: "Pilot",
    unit: "Aviation Wing",
    company: "Aviation",
    platoon: "Alpha Flight",
    squad: "H2",
    status: "Active",
    quals: [],
    notes: ""
  },
  {
    id: 3,
    display: 'CT-9553-2812 "Wonder"',
    roblox: "Wonderanovuh",
    discord: "wonder.ops",
    rank: "Trooper Third Class",
    role: "Combat Medic",
    unit: "Alpha Company",
    company: "Alpha",
    platoon: "1st Platoon",
    squad: "A-1-2",
    status: "Reserve",
    quals: ["Medic"],
    notes: ""
  },
  {
    id: 4,
    display: 'CT-8372-2111 "Quantum"',
    roblox: "JetQuantum",
    discord: "quantum.hold",
    rank: "Specialist",
    role: "Unassigned Trooper",
    unit: "Unassigned Pool",
    company: "Unassigned",
    platoon: "—",
    squad: "—",
    status: "Unassigned",
    quals: [],
    notes: ""
  }
];

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
      return {
        ...node,
        children: [...(node.children || []), child]
      };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: addChild(node.children, parentName, child)
      };
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

function TreeNode({ node, selectedUnit, setSelectedUnit, adminMode, onCreate, onRemove }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div className={`tree-row ${selectedUnit === node.name ? "selected" : ""}`}>
        <button
          className="tree-main"
          onClick={() => {
            setSelectedUnit(node.name);
            if (hasChildren) setOpen(!open);
          }}
        >
          <span className="tree-chevron">{hasChildren ? (open ? "▾" : "▸") : "•"}</span>
          <span className="tree-kind">{node.kind}</span>
          <span className="tree-name">{node.name}</span>
        </button>

        {adminMode && (
          <div className="tree-actions">
            <button className="mini-btn" onClick={() => onCreate(node.name)}>+</button>
            {node.name !== "Battalion HQ" && (
              <button className="mini-btn danger" onClick={() => onRemove(node.name)}>-</button>
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
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              adminMode={adminMode}
              onCreate={onCreate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tree, setTree] = useState(initialTree);
  const [personnel, setPersonnel] = useState(initialPersonnel);
  const [selectedUnit, setSelectedUnit] = useState("All Units");
  const [selectedMember, setSelectedMember] = useState(initialPersonnel[0]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [adminMode, setAdminMode] = useState(true);

  const [newNodeParent, setNewNodeParent] = useState("Battalion HQ");
  const [newNodeType, setNewNodeType] = useState("Company");
  const [newNodeName, setNewNodeName] = useState("");

  const [renameTarget, setRenameTarget] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const [draft, setDraft] = useState({
    display: "",
    roblox: "",
    discord: "",
    rank: "Trooper Third Class",
    role: "",
    unit: "Battalion HQ",
    company: "HQ",
    platoon: "—",
    squad: "—",
    status: "Active",
    quals: [],
    notes: ""
  });

  const allUnits = useMemo(() => flattenTree(tree, []), [tree]);

  const stats = useMemo(() => {
    const count = (s) => personnel.filter((p) => p.status === s).length;
    return {
      total: personnel.length,
      active: count("Active"),
      reserve: count("Reserve"),
      inactive: count("Inactive"),
      unassigned: count("Unassigned"),
      loa: count("LOA"),
      probationary: count("Probationary")
    };
  }, [personnel]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((p) => {
      const text = `${p.display} ${p.roblox} ${p.discord} ${p.rank} ${p.role} ${p.company} ${p.platoon} ${p.unit}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesUnit =
        selectedUnit === "All Units" ||
        p.unit === selectedUnit ||
        p.company === selectedUnit ||
        p.platoon === selectedUnit ||
        p.squad === selectedUnit;

      return matchesQuery && matchesStatus && matchesUnit;
    });
  }, [personnel, query, statusFilter, selectedUnit]);

  function handleCreateNode() {
    if (!newNodeName.trim()) return;

    const id = `${newNodeType.toLowerCase()}-${Date.now()}`;
    const child = {
      id,
      name: newNodeName.trim(),
      kind: newNodeType,
      children: []
    };

    let created = child;

    if (["Company", "Detachment", "Wing", "Platoon", "Flight"].includes(newNodeType)) {
      created = {
        ...child,
        children: [
          {
            id: `${id}-hq`,
            name: `${newNodeName.trim()} HQ`,
            kind: "Section",
            children: []
          }
        ]
      };
    }

    if (newNodeParent === "ROOT") {
      setTree((prev) => [...prev, created]);
    } else {
      setTree((prev) => addChild(prev, newNodeParent, created));
    }

    setNewNodeName("");
  }

  function handleRemoveNode(name) {
    setTree((prev) => removeNode(prev, name));
    if (selectedUnit === name) setSelectedUnit("All Units");
  }

  function handleRenameNode() {
    if (!renameTarget || !renameValue.trim()) return;
    setTree((prev) => renameNode(prev, renameTarget, renameValue.trim()));
    if (selectedUnit === renameTarget) setSelectedUnit(renameValue.trim());
    setRenameTarget("");
    setRenameValue("");
  }

  function handleQuickCreate(parentName) {
    setNewNodeParent(parentName);
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
      ...draft
    };

    setPersonnel((prev) => [newMember, ...prev]);
    setSelectedMember(newMember);

    setDraft({
      display: "",
      roblox: "",
      discord: "",
      rank: "Trooper Third Class",
      role: "",
      unit: "Battalion HQ",
      company: "HQ",
      platoon: "—",
      squad: "—",
      status: "Active",
      quals: [],
      notes: ""
    });
  }

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="topbar">
        <div>
          <div className="eyebrow">REPUBLIC TACTICAL PERSONNEL CONSOLE / IDROID LINK</div>
          <h1>Mythosaur Battalion</h1>
          <p>
            Star Wars hologram command UI + MGSV staff-management feel + modern military readiness dashboard.
          </p>
          <div className="motto">STRIKE FIRST. VANISH SECOND.</div>
        </div>

        <div className="topbar-actions">
          <span className="pill cyan">COMMAND LINK ACTIVE</span>
          <span className="pill amber">CLOUDFLARE READY</span>
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

      <section className="stats-grid">
        <div className="stat-card"><span>Total</span><strong>{stats.total}</strong></div>
        <div className="stat-card"><span>Active</span><strong>{stats.active}</strong></div>
        <div className="stat-card"><span>Reserve</span><strong>{stats.reserve}</strong></div>
        <div className="stat-card"><span>Inactive</span><strong>{stats.inactive}</strong></div>
        <div className="stat-card"><span>Unassigned</span><strong>{stats.unassigned}</strong></div>
        <div className="stat-card"><span>LOA</span><strong>{stats.loa}</strong></div>
        <div className="stat-card"><span>Probationary</span><strong>{stats.probationary}</strong></div>
      </section>

      <main className="layout">
        <aside className="panel">
          <div className="panel-header">
            <h2>ORBAT Hierarchy</h2>
            <p>Base: Battalion HQ, Alpha Company, Aviation Wing.</p>
          </div>

          <div className="tree-root">
            <button
              className={`tree-main root-all ${selectedUnit === "All Units" ? "selected-btn" : ""}`}
              onClick={() => setSelectedUnit("All Units")}
            >
              All Units
            </button>

            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                adminMode={adminMode}
                onCreate={handleQuickCreate}
                onRemove={handleRemoveNode}
              />
            ))}
          </div>
        </aside>

        <section className="panel middle-panel">
          <div className="panel-header">
            <h2>Personnel Directory</h2>
            <p>Search by Roblox, Discord, rank, role, company, platoon, or CT number.</p>
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
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="selected-unit">{selectedUnit}</div>

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
                  </div>
                </div>
                <div className="roster-meta">
                  <div>{p.company}</div>
                  <div>{p.platoon}</div>
                  <div>{p.squad}</div>
                </div>
              </button>
            ))}
          </div>

          {adminMode && (
            <div className="admin-grid">
              <div className="admin-box">
                <h3>Structure Generator</h3>
                <select className="input" value={newNodeParent} onChange={(e) => setNewNodeParent(e.target.value)}>
                  <option value="ROOT">ROOT</option>
                  {allUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <select className="input" value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)}>
                  <option>Company</option>
                  <option>Detachment</option>
                  <option>Wing</option>
                  <option>Platoon</option>
                  <option>Flight</option>
                  <option>Squad</option>
                  <option>Section</option>
                </select>
                <input
                  className="input"
                  placeholder="New node name"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                />
                <button className="btn" onClick={handleCreateNode}>Generate Node</button>
              </div>

              <div className="admin-box">
                <h3>Rename Node</h3>
                <select className="input" value={renameTarget} onChange={(e) => setRenameTarget(e.target.value)}>
                  <option value="">Select node</option>
                  {allUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <input
                  className="input"
                  placeholder="New name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
                <button className="btn amber-btn" onClick={handleRenameNode}>Rename</button>
              </div>

              <div className="admin-box admin-box-wide">
                <h3>Add Personnel</h3>
                <div className="form-grid">
                  <input className="input" placeholder='CT-0000-0000 "Callsign"' value={draft.display} onChange={(e) => setDraft({ ...draft, display: e.target.value })} />
                  <input className="input" placeholder="Roblox username" value={draft.roblox} onChange={(e) => setDraft({ ...draft, roblox: e.target.value })} />
                  <input className="input" placeholder="Discord username" value={draft.discord} onChange={(e) => setDraft({ ...draft, discord: e.target.value })} />
                  <input className="input" placeholder="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
                  <select className="input" value={draft.rank} onChange={(e) => setDraft({ ...draft, rank: e.target.value })}>
                    {rankOptions.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    {statusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select className="input" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
                    {allUnits.map((u) => <option key={u}>{u}</option>)}
                  </select>
                  <input className="input" placeholder="Company" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
                  <input className="input" placeholder="Platoon" value={draft.platoon} onChange={(e) => setDraft({ ...draft, platoon: e.target.value })} />
                  <input className="input" placeholder="Squad / Slot" value={draft.squad} onChange={(e) => setDraft({ ...draft, squad: e.target.value })} />
                </div>

                <div className="qual-selector">
                  {["Gunner", "Marksman", "Medic", "RTO/JTAC"].map((qual) => (
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
            </div>
          )}
        </section>

        <aside className="panel">
          <div className="panel-header">
            <h2>Personnel Dossier</h2>
            <p>MGSV-style tactical member panel.</p>
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
                <div className="dossier-box"><span>Unit</span><strong>{selectedMember.unit}</strong></div>
                <div className="dossier-box"><span>Company</span><strong>{selectedMember.company}</strong></div>
                <div className="dossier-box"><span>Platoon</span><strong>{selectedMember.platoon}</strong></div>
                <div className="dossier-box"><span>Squad</span><strong>{selectedMember.squad}</strong></div>
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
            </div>
          )}

          <div className="helper-box">
            <h3>Permissions</h3>
            <p>
              V1 should start with a simple admin password gate. Public is view-only.
              Later, upgrade to Discord login with role checks for cleaner mod/admin access.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
