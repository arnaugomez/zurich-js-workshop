import React, { useState, useMemo, useEffect, useCallback } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Tokens. Colour is semantic here: every hue means one edit operation.
   coral = move right = delete from A
   teal  = move down  = insert from B
   amber = diagonal   = free match
──────────────────────────────────────────────────────────────────────────── */
const C = {
  ink: "#080C15",
  panel: "#111726",
  well: "#0C111C",
  rule: "#222D49",
  ruleHi: "#374672",
  text: "#E9EEFA",
  muted: "#7C88AB",
  faint: "#4E5878",
  del: "#FF6E5C",
  ins: "#2ED3BD",
  match: "#FFC24B",
  gold: "#FFE39A",
};
const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const PRESETS = [
  { a: "ABCABBA", b: "CBABAC", label: "Blog post example", note: "The exact pair from Coglan's write-up, and the grid in his diagrams. Five edits." },
  { a: "AB", b: "BA", label: "Warm-up", note: "Two edits. Four steps total — good for a first run." },
  { a: "banana", b: "ananas", label: "Long snake", note: "A five-character match runs free straight through the middle." },
  { a: "kitten", b: "sitting", label: "Classic pair", note: "The edit-distance chestnut. Myers has no substitution, so it costs five." },
  { a: "ABC", b: "XYZ", label: "Nothing shared", note: "No diagonals anywhere. The frontier fans out as wide as it can go." },
  { a: "GATTACA", b: "GCATGCU", label: "Scattered matches", note: "Short snakes in every direction. The widest search here." },
];

const MAXLEN = 12;

/* ────────────────────────────────────────────────────────────────────────────
   The algorithm. One entry per accepted (d, k) pair, in the exact order the
   greedy BFS visits them, with both candidate moves recorded so the game can
   grade a click and explain the rule.
──────────────────────────────────────────────────────────────────────────── */
function computeTrace(a, b) {
  const N = a.length,
    M = b.length;
  const V = new Map();
  const nodeAt = new Map();
  const nodes = [];
  const steps = [];
  const events = [];
  let done = false;

  for (let d = 0; d <= N + M && !done; d++) {
    for (let k = -d; k <= d && !done; k += 2) {
      if (k > N || k < -M) {
        events.push({ type: "skip", d, k, reason: `diagonal ${k} lies outside the grid` });
        continue;
      }
      let downC = null,
        rightC = null;
      if (d > 0) {
        const vp = V.get(k + 1);
        if (vp !== undefined) {
          const px = vp,
            py = vp - (k + 1);
          if (py + 1 <= M)
            downC = { move: "down", parentK: k + 1, parent: nodeAt.get(k + 1), px, py, x: px, y: py + 1, reach: px };
        }
        const vm = V.get(k - 1);
        if (vm !== undefined) {
          const px = vm,
            py = vm - (k - 1);
          if (px + 1 <= N)
            rightC = { move: "right", parentK: k - 1, parent: nodeAt.get(k - 1), px, py, x: px + 1, y: py, reach: px + 1 };
        }
      }

      let chosen, why;
      if (d === 0) {
        chosen = { move: "start", px: 0, py: 0, x: 0, y: 0, parent: null, parentK: null, reach: 0 };
        why = "Every search starts at the origin.";
      } else if (!downC && !rightC) {
        events.push({ type: "skip", d, k, reason: `no legal move lands on diagonal ${k} yet` });
        continue;
      } else if (!downC) {
        chosen = rightC;
        why =
          V.get(k + 1) !== undefined
            ? `Down from k = ${k + 1} would fall off the bottom edge, so right is the only legal move.`
            : `Nothing has reached diagonal ${k + 1} yet, so right is the only legal move.`;
      } else if (!rightC) {
        chosen = downC;
        why =
          V.get(k - 1) !== undefined
            ? `Right from k = ${k - 1} would run past the right edge, so down is the only legal move.`
            : `Nothing has reached diagonal ${k - 1} yet, so down is the only legal move.`;
      } else if (k === -d) {
        chosen = downC;
        why = `k = −d, the bottom-left edge of the wave. There is no diagonal ${k - 1} to step right from, so move down.`;
      } else if (k === d) {
        chosen = rightC;
        why = `k = d, the top-right edge of the wave. There is no diagonal ${k + 1} to step down from, so move right.`;
      } else {
        const vm = V.get(k - 1),
          vp = V.get(k + 1);
        if (vm < vp) {
          chosen = downC;
          why = `V[${k - 1}] = ${vm} and V[${k + 1}] = ${vp}. Since V[k−1] < V[k+1], move down from k = ${k + 1}: it reaches x = ${vp}, while right would only reach x = ${vm + 1}.`;
        } else {
          chosen = rightC;
          why = `V[${k - 1}] = ${vm} and V[${k + 1}] = ${vp}. V[k−1] is not less than V[k+1], so move right from k = ${k - 1}: it reaches x = ${vm + 1}, while down would only reach x = ${vp}.`;
        }
      }

      let x = chosen.x,
        y = chosen.y;
      const snake = [];
      let matched = "";
      while (x < N && y < M && a[x] === b[y]) {
        matched += a[x];
        x++;
        y++;
        snake.push([x, y]);
      }

      const vBefore = [...V.entries()].sort((p, q) => p[0] - q[0]);
      const node = {
        id: nodes.length,
        d,
        k,
        x,
        y,
        parent: chosen.parent === undefined ? null : chosen.parent,
        move: chosen.move,
        matched,
      };
      nodes.push(node);
      V.set(k, x);
      nodeAt.set(k, node.id);
      const isFinal = x >= N && y >= M;

      steps.push({
        seq: events.length,
        d,
        k,
        node: node.id,
        downC,
        rightC,
        chosen: chosen.move,
        why,
        from: [chosen.px, chosen.py],
        mid: [chosen.x, chosen.y],
        snake,
        matched,
        end: [x, y],
        isFinal,
        vBefore,
      });
      events.push({ type: "step", d, k, index: steps.length - 1 });
      if (isFinal) done = true;
    }
  }

  let path = null,
    script = null,
    chain = [];
  if (done) {
    let cur = nodes[nodes.length - 1];
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent === null ? null : nodes[cur.parent];
    }
    const pts = [[0, 0]];
    const push = (p) => {
      const l = pts[pts.length - 1];
      if (l[0] !== p[0] || l[1] !== p[1]) pts.push([p[0], p[1]]);
    };
    for (const n of chain) {
      const st = steps[n.id];
      push(st.mid);
      for (const s of st.snake) push(s);
    }
    path = pts;
    script = [];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i];
      if (x1 > x0 && y1 > y0) script.push({ op: "=", ch: a[x0], ai: x0, bi: y0 });
      else if (x1 > x0) script.push({ op: "-", ch: a[x0], ai: x0, bi: null });
      else script.push({ op: "+", ch: b[y0], ai: null, bi: y0 });
    }
  }

  return {
    a,
    b,
    N,
    M,
    nodes,
    steps,
    events,
    distance: done ? nodes[nodes.length - 1].d : null,
    path,
    script,
    chainIds: chain.map((n) => n.id),
  };
}

/* Tidy layered layout, computed once over the whole tree so revealed nodes
   never jump around as the search grows. */
function treeLayout(nodes) {
  const kids = nodes.map(() => []);
  nodes.forEach((n) => {
    if (n.parent !== null) kids[n.parent].push(n.id);
  });
  kids.forEach((arr) => arr.sort((p, q) => nodes[p].k - nodes[q].k));
  const pos = new Array(nodes.length).fill(0);
  let slot = 0;
  const walk = (id) => {
    const ch = kids[id];
    if (!ch.length) {
      pos[id] = slot++;
      return pos[id];
    }
    const xs = ch.map(walk);
    pos[id] = (xs[0] + xs[xs.length - 1]) / 2;
    return pos[id];
  };
  if (nodes.length) walk(0);
  const maxD = nodes.reduce((m, n) => Math.max(m, n.d), 0);
  return { pos, width: slot, depth: maxD, kids };
}

const MOVE_COLOR = { down: C.ins, right: C.del, start: C.gold };

/* Every move the current wave can still make.

   A wave of depth d writes the diagonals with d's parity and only ever reads
   the ones with the opposite parity, so the set of source endpoints is fixed
   for the whole wave: it is V as the wave began. From each source, right and
   down are both on the table. Diagonals are filled low to high, so anything
   landing below the current k is already spent and drops out of the list. */
function waveMoves(trace, step) {
  const { N, M } = trace;
  const par = (n) => ((n % 2) + 2) % 2;
  const out = [];
  for (const [k, x] of step.vBefore) {
    if (par(k) === par(step.d)) continue; // this wave writes that diagonal, it doesn't read it
    const y = x - k;
    if (x + 1 <= N) out.push({ move: "right", px: x, py: y, x: x + 1, y, srcK: k, landK: k + 1, reach: x + 1 });
    if (y + 1 <= M) out.push({ move: "down", px: x, py: y, x, y: y + 1, srcK: k, landK: k - 1, reach: x });
  }
  return out.filter((m) => m.landK >= step.k && m.landK <= step.d);
}

function sameMove(m, c) {
  return !!c && !!m && m.move === c.move && m.px === c.px && m.py === c.py;
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function MyersDiffGame() {
  const [seqs, setSeqs] = useState(null); // { a, b }
  const key = seqs ? seqs.a + "\u0000" + seqs.b : "";
  return (
    <div style={{ background: C.ink, color: C.text, fontFamily: MONO, minHeight: "100%" }}>
      <style>{`
        @keyframes mdPulse { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes mdPop { 0%{transform:scale(.2);opacity:0} 65%{transform:scale(1.4)} 100%{transform:scale(1);opacity:1} }
        @keyframes mdShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 45%{transform:translateX(7px)} 70%{transform:translateX(-4px)} 88%{transform:translateX(3px)} }
        @keyframes mdIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .md-pulse { animation: mdPulse 1.15s ease-in-out infinite }
        .md-pop { animation: mdPop .32s cubic-bezier(.2,.9,.3,1.2) both; transform-box: fill-box; transform-origin: center }
        .md-shake { animation: mdShake .4s ease both }
        .md-in { animation: mdIn .25s ease both }
        .md-btn { transition: background .13s, border-color .13s, color .13s, transform .13s }
        .md-btn:hover:not(:disabled) { transform: translateY(-1px) }
        .md-btn:disabled { opacity: .38 }
        .md-hit { fill: none; stroke: transparent; stroke-width: 15; cursor: pointer }
        .md-hit:hover { stroke: #ffffff14 }
        *:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px }
        .md-scroll::-webkit-scrollbar { height: 8px; width: 8px }
        .md-scroll::-webkit-scrollbar-thumb { background: ${C.rule}; border-radius: 8px }
      `}</style>
      {seqs ? (
        <Game key={key} a={seqs.a} b={seqs.b} onExit={() => setSeqs(null)} />
      ) : (
        <Setup onStart={(a, b) => setSeqs({ a, b })} />
      )}
    </div>
  );
}

/* ───────────────────────────── setup ───────────────────────────── */

function Setup({ onStart }) {
  const [a, setA] = useState("ABCABBA");
  const [b, setB] = useState("CBABAC");
  const [note, setNote] = useState(PRESETS[0].note);
  const clean = (s) => s.replace(/\s+/g, "").slice(0, MAXLEN);
  const ok = a.length > 0 && b.length > 0;

  return (
    <div className="md-in" style={{ maxWidth: 940, margin: "0 auto", padding: "40px 22px 56px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.34em", color: C.match, textTransform: "uppercase" }}>
        Eugene Myers, 1986
      </div>
      <h1
        style={{
          fontSize: "clamp(30px,6.2vw,52px)",
          lineHeight: 1.02,
          margin: "14px 0 0",
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        Walk the diff
      </h1>
      <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.7, maxWidth: 620, marginTop: 16 }}>
        Every diff is a shortest path across a grid. Going <Tag c={C.del}>right</Tag> drops a character from the
        first sequence, going <Tag c={C.ins}>down</Tag> adds one from the second, and a{" "}
        <Tag c={C.match}>diagonal</Tag> is free — the characters already match. Myers walks the grid one wave at a
        time and stops at the far corner. You pick the moves.
      </p>

      <div style={{ height: 1, background: C.rule, margin: "30px 0 24px" }} />

      <div style={{ fontSize: 11, letterSpacing: "0.22em", color: C.faint, textTransform: "uppercase" }}>
        Pick a pair
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
        {PRESETS.map((p) => {
          const active = p.a === a && p.b === b;
          return (
            <button
              key={p.label}
              className="md-btn"
              onClick={() => {
                setA(p.a);
                setB(p.b);
                setNote(p.note);
              }}
              style={{
                background: active ? "#1B2337" : C.panel,
                border: `1px solid ${active ? C.match : C.rule}`,
                color: active ? C.text : C.muted,
                borderRadius: 8,
                padding: "9px 12px",
                fontFamily: MONO,
                fontSize: 12.5,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ color: active ? C.match : C.text, fontSize: 11, letterSpacing: "0.08em" }}>
                {p.label}
              </div>
              <div style={{ marginTop: 3, letterSpacing: "0.06em" }}>
                {p.a} <span style={{ color: C.faint }}>→</span> {p.b}
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ color: C.muted, fontSize: 12.5, marginTop: 12, minHeight: 34, lineHeight: 1.6 }}>{note}</p>

      <div className="flex flex-wrap items-end gap-4" style={{ marginTop: 10 }}>
        <Field label="Sequence A — across the top" value={a} onChange={(v) => { setA(clean(v)); setNote("Your own pair."); }} color={C.del} />
        <Field label="Sequence B — down the side" value={b} onChange={(v) => { setB(clean(v)); setNote("Your own pair."); }} color={C.ins} />
        <button
          className="md-btn"
          disabled={!ok}
          onClick={() => ok && onStart(a, b)}
          style={{
            background: C.match,
            color: C.ink,
            border: "none",
            borderRadius: 8,
            padding: "12px 22px",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.12em",
            cursor: ok ? "pointer" : "not-allowed",
          }}
        >
          DRAW THE GRID →
        </button>
      </div>
      <p style={{ color: C.faint, fontSize: 11.5, marginTop: 10 }}>
        Up to {MAXLEN} characters each. Case matters.
      </p>

      <div style={{ height: 1, background: C.rule, margin: "34px 0 22px" }} />
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
        <Rule n="Wave" t="The search runs breadth-first. Wave d holds every point reachable in exactly d edits, so the first wave to touch the bottom-right corner gives the shortest edit script." />
        <Rule n="Diagonal" t="Label each diagonal k = x − y. One wave writes one value per diagonal: V[k], the furthest x any d-edit path reaches there." />
        <Rule n="Your move" t="For each diagonal in turn, two paths could arrive — down from k+1 or right from k−1. Click the one the algorithm takes. Matches after it are free and follow automatically." />
      </div>
      <p style={{ color: C.faint, fontSize: 11.5, marginTop: 22, lineHeight: 1.7 }}>
        Walkthrough this is built on: blog.jcoglan.com/2017/02/12/the-myers-diff-algorithm-part-1/
      </p>
    </div>
  );
}

function Tag({ c, children }) {
  return <span style={{ color: c }}>{children}</span>;
}

function Field({ label, value, onChange, color }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.18em", color: C.faint, textTransform: "uppercase", marginBottom: 7 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          background: C.well,
          border: `1px solid ${C.rule}`,
          borderBottom: `2px solid ${color}`,
          borderRadius: 8,
          color: C.text,
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: "0.22em",
          padding: "11px 13px",
          width: 200,
        }}
      />
    </label>
  );
}

function Rule({ n, t }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.match, textTransform: "uppercase" }}>{n}</div>
      <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.65, marginTop: 7 }}>{t}</p>
    </div>
  );
}

/* ───────────────────────────── game ───────────────────────────── */

function Game({ a, b, onExit }) {
  const trace = useMemo(() => computeTrace(a, b), [a, b]);
  const layout = useMemo(() => treeLayout(trace.nodes), [trace]);
  const total = trace.steps.length;

  const [done, setDone] = useState(1); // step 0 (the origin) is applied for you
  const [tab, setTab] = useState("graph");
  const [msg, setMsg] = useState(null); // { kind:'ok'|'no'|'hint', text }
  const [shake, setShake] = useState(0);
  const [hint, setHint] = useState(false);
  const [play, setPlay] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0, helped: 0 });
  const solved = done >= total;
  const current = solved ? null : trace.steps[done];

  useEffect(() => {
    if (trace.steps[0] && trace.steps[0].isFinal) setDone(total);
  }, [trace, total]);

  const advance = useCallback(
    (credit) => {
      const s = trace.steps[done];
      if (!s) return;
      setMsg({
        kind: credit ? "ok" : "hint",
        text: `${credit ? "Right. " : ""}V[${s.k}] = ${s.end[0]} — the path reaches (${s.end[0]}, ${s.end[1]})${
          s.matched ? ` after running free over "${s.matched}"` : ""
        }.`,
      });
      setHint(false);
      setDone(done + 1);
      setScore((v) => (credit ? { ...v, right: v.right + 1 } : { ...v, helped: v.helped + 1 }));
    },
    [trace, done]
  );

  useEffect(() => {
    if (!play || solved) {
      if (solved) setPlay(false);
      return;
    }
    const t = setTimeout(() => advance(false), 620);
    return () => clearTimeout(t);
  }, [play, solved, done, advance]);

  useEffect(() => {
    if (!solved) return;
    const t = setTimeout(() => setTab("result"), 1100);
    return () => clearTimeout(t);
  }, [solved]);

  const [mode, setMode] = useState("guided");

  function reject(text) {
    setMsg({ kind: "no", text });
    setShake((n) => n + 1);
    setScore((v) => ({ ...v, wrong: v.wrong + 1 }));
  }

  function onEdgeClick(kind, x, y) {
    if (!current || play) return;
    const { k, d, chosen } = current;
    const target = chosen === "down" ? current.downC : current.rightC;
    const moves = waveMoves(trace, current);
    const hit = moves.find(
      (m) => m.move === (kind === "h" ? "right" : "down") && m.px === x && m.py === y
    );

    if (hit && sameMove(hit, target)) {
      advance(true);
      return;
    }
    if (hit) {
      if (hit.landK === k) reject(current.why);
      else
        reject(
          `That move fills diagonal k = ${hit.landK}. A wave fills its diagonals from low to high, and k = ${k} is next.`
        );
      return;
    }

    const landK = kind === "h" ? x + 1 - y : x - (y + 1);
    const srcK = x - y;
    const v = new Map(current.vBefore);
    if (v.get(srcK) !== x) {
      reject(`No path has reached (${x}, ${y}), so nothing can step from there.`);
    } else if (landK < k) {
      reject(`Diagonal k = ${landK} was already filled earlier in this wave.`);
    } else {
      reject(
        `(${x}, ${y}) sits on diagonal ${srcK}, which wave ${d} is writing rather than reading. Every move this wave starts from an endpoint of wave ${d - 1}.`
      );
    }
  }

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 16px 40px" }}>
      <Header a={a} b={b} trace={trace} done={done} total={total} solved={solved} onExit={onExit} />

      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 14 }}>
        {[
          ["graph", "Edit graph"],
          ["tree", "Search tree"],
          ["result", "Edit script"],
        ].map(([id, label]) => {
          const locked = id === "result" && !solved;
          const active = tab === id;
          return (
            <button
              key={id}
              className="md-btn"
              disabled={locked}
              onClick={() => setTab(id)}
              style={{
                background: active ? C.panel : "transparent",
                border: `1px solid ${active ? C.ruleHi : "transparent"}`,
                borderRadius: 999,
                color: active ? C.text : locked ? C.faint : C.muted,
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.1em",
                padding: "7px 14px",
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {label}
              {locked ? " ·" : ""}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div
          className={shake ? "md-shake" : undefined}
          key={"pane" + shake}
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            background: C.panel,
            border: `1px solid ${C.rule}`,
            borderRadius: 14,
            padding: 12,
          }}
        >
          {tab === "graph" && (
            <GraphView
              trace={trace}
              done={done}
              current={current}
              hint={hint}
              solved={solved}
              reveal={mode === "guided"}
              onEdgeClick={onEdgeClick}
            />
          )}
          {tab === "tree" && <TreeView trace={trace} layout={layout} done={done} solved={solved} />}
          {tab === "result" && <ResultView trace={trace} score={score} onExit={onExit} />}
        </div>

        <Panel
          trace={trace}
          current={current}
          solved={solved}
          msg={msg}
          hint={hint}
          play={play}
          done={done}
          total={total}
          score={score}
          mode={mode}
          onMode={setMode}
          onHint={() => {
            setHint(true);
            setMsg({ kind: "hint", text: current ? current.why : "" });
          }}
          onSkip={() => advance(false)}
          onPlay={() => setPlay((p) => !p)}
          onTree={() => setTab("tree")}
        />
      </div>
    </div>
  );
}

function Header({ a, b, trace, done, total, solved, onExit }) {
  const wave = solved ? trace.distance : trace.steps[done] ? trace.steps[done].d : 0;
  return (
    <div className="flex flex-wrap items-end justify-between gap-4" style={{ marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.3em", color: C.match, textTransform: "uppercase" }}>
          Walk the diff
        </div>
        <div className="flex items-center gap-3" style={{ marginTop: 8, fontSize: 20, letterSpacing: "0.18em" }}>
          <span style={{ color: C.del }}>{a}</span>
          <span style={{ color: C.faint, fontSize: 14 }}>→</span>
          <span style={{ color: C.ins }}>{b}</span>
        </div>
      </div>
      <div className="flex items-end gap-5">
        <Stat label="wave d" value={wave} c={C.text} />
        <Stat label="step" value={`${Math.min(done, total)}/${total}`} c={C.text} />
        <Stat label="edits" value={solved ? trace.distance : "—"} c={solved ? C.match : C.faint} />
        <button
          className="md-btn"
          onClick={onExit}
          style={{
            background: "transparent",
            border: `1px solid ${C.rule}`,
            borderRadius: 8,
            color: C.muted,
            fontFamily: MONO,
            fontSize: 11.5,
            letterSpacing: "0.1em",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          New pair
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, c }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: "0.2em", color: C.faint, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, color: c, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

/* ───────────────────────────── edit graph ───────────────────────────── */

function GraphView({ trace, done, current, hint, solved, reveal, onEdgeClick }) {
  const { a, b, N, M } = trace;
  const cell = 56,
    padL = 52,
    padT = 50,
    padR = 44,
    padB = 36;
  const W = padL + N * cell + padR;
  const H = padT + M * cell + padB;
  const X = (x) => padL + x * cell;
  const Y = (y) => padT + y * cell;

  const applied = trace.steps.slice(0, done);
  const frontier = new Map();
  applied.forEach((s) => frontier.set(s.k, s));

  const moves = current ? waveMoves(trace, current) : [];
  const target = current ? (current.chosen === "down" ? current.downC : current.rightC) : null;

  const pathPts = solved && trace.path ? trace.path : null;

  return (
    <div className="md-scroll" style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block", margin: "0 auto" }}>
        {/* lattice */}
        <g stroke={C.rule} strokeWidth={1}>
          {Array.from({ length: M + 1 }, (_, y) => (
            <line key={"r" + y} x1={X(0)} y1={Y(y)} x2={X(N)} y2={Y(y)} />
          ))}
          {Array.from({ length: N + 1 }, (_, x) => (
            <line key={"c" + x} x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(M)} />
          ))}
        </g>

        {/* free diagonals */}
        <g stroke={C.match} strokeWidth={1.4} strokeDasharray="3 4" opacity={0.42}>
          {Array.from({ length: N }, (_, x) =>
            Array.from({ length: M }, (_, y) =>
              a[x] === b[y] ? <line key={`d${x}-${y}`} x1={X(x)} y1={Y(y)} x2={X(x + 1)} y2={Y(y + 1)} /> : null
            )
          )}
        </g>

        {/* lattice dots */}
        <g fill={C.ruleHi}>
          {Array.from({ length: N + 1 }, (_, x) =>
            Array.from({ length: M + 1 }, (_, y) => <circle key={`p${x}-${y}`} cx={X(x)} cy={Y(y)} r={2.1} />)
          )}
        </g>

        {/* explored traces */}
        <g fill="none" strokeLinecap="round">
          {applied.map((s, i) => {
            const col = MOVE_COLOR[s.chosen];
            const last = i === done - 1;
            const op = last ? 1 : 0.62;
            const segs = [];
            if (s.chosen !== "start")
              segs.push(
                <line
                  key="m"
                  x1={X(s.from[0])}
                  y1={Y(s.from[1])}
                  x2={X(s.mid[0])}
                  y2={Y(s.mid[1])}
                  stroke={col}
                  strokeWidth={last ? 4.4 : 3.2}
                  opacity={op}
                />
              );
            let px = s.mid[0],
              py = s.mid[1];
            s.snake.forEach(([sx, sy], j) => {
              segs.push(
                <line
                  key={"s" + j}
                  x1={X(px)}
                  y1={Y(py)}
                  x2={X(sx)}
                  y2={Y(sy)}
                  stroke={C.match}
                  strokeWidth={last ? 4.4 : 3.2}
                  opacity={op}
                />
              );
              px = sx;
              py = sy;
            });
            return <g key={s.node}>{segs}</g>;
          })}
        </g>

        {/* shortest path */}
        {pathPts && (
          <g fill="none">
            <polyline
              points={pathPts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}
              stroke="#ffffff"
              strokeWidth={9}
              opacity={0.1}
              strokeLinejoin="round"
            />
            <polyline
              points={pathPts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}
              stroke={C.gold}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeDasharray="7 5"
            />
          </g>
        )}

        {/* every move still open to this wave — inset at both ends so the
            endpoint markers and their wave numbers stay readable */}
        {moves.map((m, i) => {
          const lit = sameMove(m, target);
          const dim = hint && !lit;
          const col = MOVE_COLOR[m.move];
          const x1 = X(m.px),
            y1 = Y(m.py),
            x2 = X(m.x),
            y2 = Y(m.y);
          const len = Math.hypot(x2 - x1, y2 - y1) || 1;
          const ux = (x2 - x1) / len,
            uy = (y2 - y1) / len;
          const sx = x1 + ux * 13,
            sy = y1 + uy * 13; // clear of the source circle
          const tx = x2 - ux * 7,
            ty = y2 - uy * 7; // arrow tip, short of the landing point
          const bx = tx - ux * 9,
            by = ty - uy * 9; // base of the arrowhead
          const nx = -uy,
            ny = ux;
          const head = `${tx},${ty} ${bx + nx * 5.4},${by + ny * 5.4} ${bx - nx * 5.4},${by - ny * 5.4}`;
          return (
            <g key={`c${i}`} opacity={dim ? 0.1 : 1} style={{ pointerEvents: "none" }}>
              {hint && lit && (
                <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={col} strokeWidth={12} opacity={0.2} strokeLinecap="round" />
              )}
              <line
                x1={sx}
                y1={sy}
                x2={bx}
                y2={by}
                stroke={col}
                strokeWidth={hint && lit ? 4.4 : 3.2}
                strokeDasharray="5 4"
                opacity={hint && lit ? 1 : 0.82}
              />
              <polygon points={head} fill={col} />
            </g>
          );
        })}

        {/* endpoints */}
        <g>
          {applied.map((s, i) => {
            const [x, y] = s.end;
            const isFront = frontier.get(s.k) === s;
            const last = i === done - 1;
            return (
              <g key={"e" + s.node} className={last ? "md-pop" : undefined}>
                <circle
                  cx={X(x)}
                  cy={Y(y)}
                  r={isFront ? 7 : 4.4}
                  fill={C.ink}
                  stroke={MOVE_COLOR[s.chosen]}
                  strokeWidth={isFront ? 2.4 : 1.6}
                  opacity={isFront ? 1 : 0.55}
                />
                {isFront && (
                  <text
                    x={X(x)}
                    y={Y(y) + 3.2}
                    textAnchor="middle"
                    fontSize={8.5}
                    fill={C.text}
                    fontFamily={MONO}
                    style={{ pointerEvents: "none" }}
                  >
                    {s.d}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* labels */}
        <g fontFamily={MONO} style={{ pointerEvents: "none" }}>
          {a.split("").map((ch, x) => {
            const act = reveal && moves.some((m) => m.move === "right" && m.landK === current.k && m.px === x);
            return (
              <text
                key={"a" + x}
                x={X(x + 0.5)}
                y={Y(0) - 20}
                textAnchor="middle"
                fontSize={16}
                fill={act ? C.del : C.muted}
                opacity={act ? 1 : 0.85}
              >
                {ch}
              </text>
            );
          })}
          {b.split("").map((ch, y) => {
            const act = reveal && moves.some((m) => m.move === "down" && m.landK === current.k && m.py === y);
            return (
              <text
                key={"b" + y}
                x={X(0) - 22}
                y={Y(y + 0.5) + 5.5}
                textAnchor="middle"
                fontSize={16}
                fill={act ? C.ins : C.muted}
                opacity={act ? 1 : 0.85}
              >
                {ch}
              </text>
            );
          })}
          {Array.from({ length: N + 1 }, (_, x) => (
            <text key={"xi" + x} x={X(x)} y={Y(M) + 22} textAnchor="middle" fontSize={10.5} fill={C.faint}>
              {x}
            </text>
          ))}
          {Array.from({ length: M + 1 }, (_, y) => (
            <text key={"yi" + y} x={X(N) + 20} y={Y(y) + 3.5} textAnchor="middle" fontSize={10.5} fill={C.faint}>
              {y}
            </text>
          ))}
          <text x={X(0) - 22} y={Y(0) - 20} textAnchor="middle" fontSize={9.5} fill={C.faint}>
            x→
          </text>
          <text x={X(N) + 20} y={Y(M) + 22} textAnchor="middle" fontSize={9.5} fill={C.faint}>
            y↓
          </text>
        </g>

        {/* click targets last so they sit on top */}
        <g>
          {Array.from({ length: N }, (_, x) =>
            Array.from({ length: M + 1 }, (_, y) => (
              <line
                key={`hh${x}-${y}`}
                className="md-hit"
                x1={X(x)}
                y1={Y(y)}
                x2={X(x + 1)}
                y2={Y(y)}
                onClick={() => onEdgeClick("h", x, y)}
              />
            ))
          )}
          {Array.from({ length: N + 1 }, (_, x) =>
            Array.from({ length: M }, (_, y) => (
              <line
                key={`vv${x}-${y}`}
                className="md-hit"
                x1={X(x)}
                y1={Y(y)}
                x2={X(x)}
                y2={Y(y + 1)}
                onClick={() => onEdgeClick("v", x, y)}
              />
            ))
          )}
        </g>
      </svg>

      <div className="flex flex-wrap gap-4" style={{ padding: "6px 4px 2px", fontSize: 11, color: C.muted }}>
        <Key c={C.del} t="right = delete from A" />
        <Key c={C.ins} t="down = insert from B" />
        <Key c={C.match} t="diagonal = match, free" />
        <Key c={C.gold} t="shortest path" dash />
      </div>
      {current && (
        <p style={{ padding: "8px 4px 2px", fontSize: 11.5, color: C.faint, lineHeight: 1.65 }}>
          Solid traces are already walked. The {moves.length} dashed{" "}
          {moves.length === 1 ? "arrow is the only move" : "arrows are every move"} wave {current.d} can still make —
          one of them is next.
        </p>
      )}
    </div>
  );
}

function Key({ c, t, dash }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="20" height="8">
        <line x1="0" y1="4" x2="20" y2="4" stroke={c} strokeWidth="3" strokeDasharray={dash ? "5 4" : undefined} />
      </svg>
      {t}
    </span>
  );
}

/* ───────────────────────────── search tree ───────────────────────────── */

function TreeView({ trace, layout, done, solved }) {
  const nodes = trace.nodes;
  const { pos, width, depth } = layout;
  const nodeW = 54,
    colW = 88,
    rowH = 92,
    padL = 54,
    padT = 34;
  const W = padL + Math.max(1, width) * colW + 40;
  const H = padT + depth * rowH + 62;
  const cx = (id) => padL + pos[id] * colW + nodeW / 2;
  const cy = (id) => padT + nodes[id].d * rowH;
  const shown = new Set(nodes.slice(0, done).map((n) => n.id));
  const onPath = new Set(solved ? trace.chainIds : []);

  return (
    <div className="md-scroll" style={{ overflowX: "auto" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.faint, textTransform: "uppercase", padding: "4px 4px 10px" }}>
        Search tree — every furthest-reaching endpoint, by wave
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
        {Array.from({ length: depth + 1 }, (_, d) => (
          <g key={"row" + d}>
            <line x1={30} y1={padT + d * rowH} x2={W - 10} y2={padT + d * rowH} stroke={C.rule} strokeWidth={1} opacity={0.5} />
            <text x={14} y={padT + d * rowH + 4} fontSize={11} fill={C.faint} fontFamily={MONO}>
              {d}
            </text>
          </g>
        ))}

        {nodes.map((n) => {
          if (n.parent === null || !shown.has(n.id) || !shown.has(n.parent)) return null;
          const x1 = cx(n.parent),
            y1 = cy(n.parent) + 12,
            x2 = cx(n.id),
            y2 = cy(n.id) - 12;
          const my = (y1 + y2) / 2;
          const lit = onPath.has(n.id) && onPath.has(n.parent);
          return (
            <path
              key={"ed" + n.id}
              d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
              fill="none"
              stroke={lit ? C.gold : MOVE_COLOR[n.move]}
              strokeWidth={lit ? 3 : 1.8}
              opacity={lit ? 1 : 0.75}
            />
          );
        })}

        {nodes.map((n) => {
          if (!shown.has(n.id)) return null;
          const x = cx(n.id),
            y = cy(n.id);
          const lit = onPath.has(n.id);
          const fresh = n.id === done - 1;
          return (
            <g key={"nd" + n.id} className={fresh ? "md-pop" : undefined}>
              <rect
                x={x - nodeW / 2}
                y={y - 12}
                width={nodeW}
                height={24}
                rx={5}
                fill={lit ? "#221D12" : C.well}
                stroke={lit ? C.gold : MOVE_COLOR[n.move]}
                strokeWidth={lit ? 1.8 : 1.2}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={11.5} fill={lit ? C.gold : C.text} fontFamily={MONO}>
                {n.x},{n.y}
              </text>
              {n.matched && (
                <text x={x} y={y + 25} textAnchor="middle" fontSize={9.5} fill={C.match} fontFamily={MONO}>
                  ={n.matched}
                </text>
              )}
              <text x={x} y={y - 16} textAnchor="middle" fontSize={8.5} fill={C.faint} fontFamily={MONO}>
                k={n.k}
              </text>
            </g>
          );
        })}
      </svg>
      <p style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.7, padding: "10px 4px 0" }}>
        Each box is one V[k] value: the furthest point reached on diagonal k using exactly d edits. Teal edges are
        insertions, coral edges deletions, and <span style={{ color: C.match }}>=runs</span> under a box are the free
        matches that followed. Two boxes can share a row only if they sit on different diagonals — that cap is why the
        search stays cheap.
      </p>
    </div>
  );
}

/* ───────────────────────────── result ───────────────────────────── */

function ResultView({ trace, score, onExit }) {
  const { a, b, script, path, distance } = trace;
  const delSet = new Set(script.filter((s) => s.op === "-").map((s) => s.ai));
  const insSet = new Set(script.filter((s) => s.op === "+").map((s) => s.bi));
  return (
    <div className="md-in" style={{ padding: "6px 6px 4px" }}>
      <div className="flex flex-wrap items-end gap-6" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.faint, textTransform: "uppercase" }}>
            Shortest edit script
          </div>
          <div style={{ fontSize: 40, color: C.match, lineHeight: 1.05, marginTop: 4 }}>
            {distance} <span style={{ fontSize: 14, color: C.muted }}>edits</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          <div>
            called right <span style={{ color: C.ins }}>{score.right}</span>
          </div>
          <div>
            wrong picks <span style={{ color: C.del }}>{score.wrong}</span>
          </div>
          <div>
            revealed <span style={{ color: C.text }}>{score.helped}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1" style={{ marginBottom: 22 }}>
        {script.map((s, i) => {
          const col = s.op === "-" ? C.del : s.op === "+" ? C.ins : C.match;
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${col}`,
                borderRadius: 6,
                padding: "6px 9px",
                color: col,
                fontSize: 14,
                background: s.op === "=" ? "transparent" : `${col}14`,
              }}
            >
              {s.op}
              {s.ch}
            </div>
          );
        })}
      </div>

      <Line label="A" color={C.del}>
        {a.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              color: delSet.has(i) ? C.del : C.text,
              textDecoration: delSet.has(i) ? "line-through" : "none",
              opacity: delSet.has(i) ? 1 : 0.65,
            }}
          >
            {ch}
          </span>
        ))}
      </Line>
      <Line label="B" color={C.ins}>
        {b.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              color: insSet.has(i) ? C.ins : C.text,
              borderBottom: insSet.has(i) ? `2px solid ${C.ins}` : "2px solid transparent",
              opacity: insSet.has(i) ? 1 : 0.65,
            }}
          >
            {ch}
          </span>
        ))}
      </Line>

      <div style={{ height: 1, background: C.rule, margin: "20px 0 14px" }} />
      <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.faint, textTransform: "uppercase", marginBottom: 8 }}>
        Path through the grid
      </div>
      <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.9, wordBreak: "break-word" }}>
        {path.map(([x, y], i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: C.faint }}> → </span>}
            ({x},{y})
          </span>
        ))}
      </div>

      <button
        className="md-btn"
        onClick={onExit}
        style={{
          marginTop: 22,
          background: C.match,
          color: C.ink,
          border: "none",
          borderRadius: 8,
          padding: "11px 18px",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 12.5,
          letterSpacing: "0.12em",
          cursor: "pointer",
        }}
      >
        RUN ANOTHER PAIR →
      </button>
    </div>
  );
}

function Line({ label, color, children }) {
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
      <span style={{ fontSize: 11, color, width: 14 }}>{label}</span>
      <span style={{ fontSize: 22, letterSpacing: "0.2em" }}>{children}</span>
    </div>
  );
}

/* ───────────────────────────── side panel ───────────────────────────── */

function Panel({ trace, current, solved, msg, hint, play, done, total, score, mode, onMode, onHint, onSkip, onPlay, onTree }) {
  const guided = mode === "guided";
  const chips = useMemo(() => {
    if (!current) return [];
    return trace.events
      .filter((e) => e.d === current.d)
      .map((e) => ({
        k: e.k,
        state: e.type === "skip" ? "skip" : e.index < done ? "done" : e.index === done ? "now" : "next",
      }));
  }, [trace, current, done]);
  const left = chips.filter((c) => c.state === "now" || c.state === "next").length;

  const vRows = useMemo(() => {
    const src = current ? current.vBefore : trace.steps[total - 1] ? [...trace.steps[total - 1].vBefore] : [];
    const map = new Map(src);
    if (!current && trace.steps[total - 1]) {
      const s = trace.steps[total - 1];
      map.set(s.k, s.end[0]);
    }
    const d = current ? current.d : trace.distance;
    const lo = Math.max(-trace.M, -(d + 1)),
      hi = Math.min(trace.N, d + 1);
    const out = [];
    for (let k = lo; k <= hi; k++) {
      if (map.has(k) || (current && k === current.k)) out.push([k, map.has(k) ? map.get(k) : null]);
    }
    return out;
  }, [current, trace, total]);

  return (
    <aside
      style={{
        flex: "0 0 auto",
        width: "min(100%, 330px)",
        background: C.panel,
        border: `1px solid ${C.rule}`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {current ? (
        <>
          <div>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.faint, textTransform: "uppercase" }}>
                This step
              </div>
              <div className="flex" style={{ border: `1px solid ${C.rule}`, borderRadius: 999, overflow: "hidden" }}>
                {[
                  ["guided", "guided"],
                  ["blind", "blind"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className="md-btn"
                    onClick={() => onMode(id)}
                    style={{
                      background: mode === id ? C.ruleHi : "transparent",
                      border: "none",
                      color: mode === id ? C.text : C.faint,
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      padding: "4px 9px",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>
              Wave <span style={{ color: C.match }}>d = {current.d}</span>
              {guided ? (
                <>
                  , filling diagonal <span style={{ color: C.match }}>k = {current.k}</span>
                </>
              ) : (
                <span style={{ color: C.muted }}>
                  {" "}
                  — {left} {left === 1 ? "diagonal" : "diagonals"} left
                </span>
              )}
            </div>

            {guided && (
              <div className="flex flex-wrap" style={{ gap: 4, marginTop: 9 }}>
                {chips.map((c, i) => {
                  const col =
                    c.state === "now" ? C.match : c.state === "done" ? C.ins : c.state === "skip" ? C.faint : C.ruleHi;
                  return (
                    <span
                      key={i}
                      title={c.state === "skip" ? "skipped — no legal move lands here" : undefined}
                      style={{
                        border: `1px solid ${col}`,
                        background: c.state === "now" ? "#241E10" : "transparent",
                        borderRadius: 5,
                        color: c.state === "next" ? C.muted : col,
                        fontSize: 10.5,
                        padding: "2px 6px",
                        textDecoration: c.state === "skip" ? "line-through" : "none",
                      }}
                    >
                      k={c.k}
                    </span>
                  );
                })}
              </div>
            )}

            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, marginTop: 9 }}>
              {guided
                ? (current.downC ? 1 : 0) + (current.rightC ? 1 : 0) === 1
                  ? `Only one arrow can land on k = ${current.k}, so this one is forced. Find it and click it.`
                  : `Two of the dashed arrows land on k = ${current.k}. Click the one that reaches further.`
                : "Diagonals fill from low to high. Work out which one is next, then click the arrow that reaches furthest along it."}
            </p>
          </div>

          {guided && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <Cand c={current.downC} label="down" desc={(cc) => `insert "${trace.b[cc.py]}"`} k={current.k + 1} trace={trace} hint={hint} pick={current.chosen === "down"} />
              <Cand c={current.rightC} label="right" desc={(cc) => `delete "${trace.a[cc.px]}"`} k={current.k - 1} trace={trace} hint={hint} pick={current.chosen === "right"} />
            </div>
          )}

          <div style={{ background: C.well, border: `1px solid ${C.rule}`, borderRadius: 9, padding: "9px 10px" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: C.faint, textTransform: "uppercase" }}>
              The rule
            </div>
            <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.7, marginTop: 6 }}>
              if k = −d, or V[k−1] &lt; V[k+1] → move <span style={{ color: C.ins }}>down</span> from k+1
              <br />
              otherwise → move <span style={{ color: C.del }}>right</span> from k−1
            </p>
          </div>
        </>
      ) : (
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.match, textTransform: "uppercase" }}>
            Corner reached
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginTop: 8 }}>
            Wave {trace.distance} touched ({trace.N}, {trace.M}). No shorter script exists — every earlier wave was
            searched in full.
          </p>
          <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
            You called {score.right} of {total - 1} moves yourself
            {score.wrong ? `, with ${score.wrong} wrong ${score.wrong === 1 ? "pick" : "picks"}` : " with a clean sheet"}.
          </p>
          <button
            className="md-btn"
            onClick={onTree}
            style={{
              marginTop: 12,
              background: "transparent",
              border: `1px solid ${C.ruleHi}`,
              borderRadius: 8,
              color: C.text,
              fontFamily: MONO,
              fontSize: 12,
              padding: "9px 12px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            See the finished tree
          </button>
        </div>
      )}

      {/* V strip */}
      <div>
        <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: C.faint, textTransform: "uppercase", marginBottom: 6 }}>
          V — furthest x per diagonal
        </div>
        <div className="md-scroll flex" style={{ gap: 3, overflowX: "auto", paddingBottom: 4 }}>
          {vRows.map(([k, v]) => {
            const isTarget = current && k === current.k;
            const isSrc = current && (k === current.k - 1 || k === current.k + 1);
            const col = isTarget ? C.match : isSrc ? C.ruleHi : C.rule;
            return (
              <div
                key={k}
                style={{
                  flex: "0 0 auto",
                  minWidth: 26,
                  textAlign: "center",
                  border: `1px solid ${col}`,
                  borderRadius: 5,
                  background: isTarget ? "#241E10" : C.well,
                }}
              >
                <div style={{ fontSize: 9, color: isTarget ? C.match : C.faint, padding: "3px 0 1px" }}>{k}</div>
                <div style={{ fontSize: 12.5, color: v === null ? C.faint : C.text, padding: "1px 0 4px" }}>
                  {v === null ? "·" : v}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* message */}
      {msg && (
        <div
          className="md-in"
          key={msg.text}
          style={{
            background: msg.kind === "no" ? "#20120F" : msg.kind === "ok" ? "#0E1F1C" : C.well,
            border: `1px solid ${msg.kind === "no" ? C.del : msg.kind === "ok" ? C.ins : C.rule}`,
            borderRadius: 9,
            padding: "9px 10px",
            fontSize: 11.5,
            lineHeight: 1.65,
            color: msg.kind === "no" ? "#FFC9C1" : msg.kind === "ok" ? "#B6F2E9" : C.muted,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* skipped diagonals log */}
      <SkipLog trace={trace} current={current} />

      <div className="flex gap-2" style={{ marginTop: "auto" }}>
        <PanelBtn onClick={onHint} disabled={!current || play}>
          Hint
        </PanelBtn>
        <PanelBtn onClick={onSkip} disabled={!current || play}>
          Play it
        </PanelBtn>
        <PanelBtn onClick={onPlay} disabled={solved} active={play}>
          {play ? "Pause" : "Auto"}
        </PanelBtn>
      </div>
      <div style={{ height: 3, background: C.well, borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(Math.min(done, total) / total) * 100}%`,
            background: C.match,
            transition: "width .3s ease",
          }}
        />
      </div>
    </aside>
  );
}

function Cand({ c, label, desc, k, trace, hint, pick }) {
  if (!c)
    return (
      <div
        style={{
          border: `1px dashed ${C.rule}`,
          borderRadius: 9,
          padding: "9px 10px",
          fontSize: 11.5,
          color: C.faint,
        }}
      >
        no {label} move — diagonal k = {k} offers nothing legal
      </div>
    );
  const col = MOVE_COLOR[c.move];
  const dim = hint && !pick;
  return (
    <div
      style={{
        border: `1px solid ${hint && pick ? col : C.rule}`,
        background: hint && pick ? `${col}12` : C.well,
        borderRadius: 9,
        padding: "9px 10px",
        opacity: dim ? 0.4 : 1,
      }}
    >
      <div className="flex items-center justify-between" style={{ gap: 8 }}>
        <span style={{ color: col, fontSize: 12, letterSpacing: "0.08em" }}>
          {c.move === "down" ? "↓ down" : "→ right"}
        </span>
        <span style={{ color: C.muted, fontSize: 11 }}>{desc(c)}</span>
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5, lineHeight: 1.55 }}>
        from k = {c.parentK} at ({c.px},{c.py}) → reaches x = {c.reach}
      </div>
    </div>
  );
}

function SkipLog({ trace, current }) {
  const upto = current ? current.seq : trace.events.length;
  const skips = trace.events.slice(0, upto).filter((e) => e.type === "skip");
  if (!skips.length) return null;
  const last = skips.slice(-2);
  return (
    <div style={{ fontSize: 10.5, color: C.faint, lineHeight: 1.7 }}>
      {last.map((s, i) => (
        <div key={i}>
          skipped d={s.d} k={s.k} — {s.reason}
        </div>
      ))}
      {skips.length > 2 && <div>…{skips.length - 2} earlier skips</div>}
    </div>
  );
}

function PanelBtn({ children, onClick, disabled, active }) {
  return (
    <button
      className="md-btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: active ? C.match : "transparent",
        border: `1px solid ${active ? C.match : C.ruleHi}`,
        borderRadius: 8,
        color: active ? C.ink : C.text,
        fontFamily: MONO,
        fontSize: 11.5,
        letterSpacing: "0.06em",
        padding: "9px 6px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
