const councilSeats = [
  ["Evidence Steward", "Separates user-provided claims, sourced claims, inference, speculation, symbolism, and unknowns."],
  ["Visual Integrity Steward", "Checks whether scale, hierarchy, color, layout, and emphasis clarify instead of distort."],
  ["Power and Incentives Mapper", "Tracks who benefits, who pays, who decides, who is excluded, and which incentives shape behavior."],
  ["Care and Harm Steward", "Protects private people, vulnerable groups, and civilians from exposure, stigma, or dehumanization."],
  ["Narrative and Propaganda Auditor", "Asks what story the visual makes easy to believe and what it omits."],
  ["Historical Analogy Steward", "Uses history as illumination, not prophecy or false equivalence."],
  ["Uncertainty Steward", "Turns unknowns, contested points, alternatives, and limits into visible design features."],
  ["Dissenting Reviewer", "Challenges the dominant interpretation and asks what would weaken the model."]
];

const doctrineCards = [
  ["Forward Motion", "Make clear assumptions and produce a useful first pass instead of stalling for a perfect brief."],
  ["Chat First", "The main workflow is conversation. Controls are steering hints, not the experience."],
  ["Triadic Spine", "Read serious subjects through strategic games, symbolic scripts, and material futures before turning them into visuals."],
  ["Density Discipline", "Minimalist, Moderate, Hybrid, Maximalist, and Layered modes are chosen by purpose, evidence, audience, and risk."],
  ["No False Authority", "Polish, diagrams, and mural intensity must not make weak evidence feel stronger."],
  ["Dignity Before Satire", "Critique systems, institutions, incentives, and narratives without dehumanizing people."],
  ["Lock When Useful", "Use 'Lock this concept' only when a polished final prompt or final image direction benefits from confirmation."]
];

const templates = {
  "Triadic Visual Read": `Event Definition:
Surface Narrative:
Strategic-Rational Layer:
Symbolic-Civilizational Layer:
Materialist-Futurist Layer:
Cross-Pole Contradiction:
Visual Translation:
Indicators / Falsifiers:
Uncertainty:
Strong Direction:`,
  "Compact Concept Direction": `Title:
Working Assumption:
Selected Mode:
Visual Type:
Core Structure:
Primary Tension:
Visual Metaphor:
What Is Known / Claimed:
What Is Inferred:
What Remains Unknown:
Next Move:`,
  "Maximalist Mural Blueprint": `Concept Title:
Core Analytical Thesis:
Central Metaphor:
Composition Overview:
Major Visual Zones:
Character Archetypes:
Institutional Personifications:
Micro-Scenes:
Recurring Motifs:
Fake Signage and Typography:
Historical Echoes:
Emotional Atmosphere:
Rendering Directives:
Ethical Guardrail:
Final Image Prompt:`,
  "Sensitive Image Guardrail": `This is an interpretive visual metaphor, not documentary evidence. Do not fabricate documents, maps, headlines, seals, evidence, or misleading depictions of real people. Do not imply verified causation, guilt, conspiracy, or coordination unless explicitly supported. Preserve human dignity and avoid dehumanizing groups.`,
  "Density Selector": `Minimalist: precision, safety, public clarity.
Moderate: clear multi-actor or institutional explanation.
Hybrid: structure plus symbolism for power, media, ideology, empire, political economy.
Maximalist: exploratory, satirical, allegorical, historically layered, or explicitly requested.
Layered: when one visual cannot responsibly carry the analysis.`
};

const conceptBanks = {
  institutions: ["courthouse", "factory", "casino", "temple", "theater", "prison", "archive", "shopping mall", "control room", "schoolhouse"],
  systems: ["conveyor belts", "debt pipes", "filing cabinets", "leaking valves", "surveillance screens", "paperwork mazes", "receipt waterfalls", "turnstiles", "stamp machines", "ladders with missing rungs"],
  characters: ["filing-cabinet-headed clerks", "many-handed repair workers", "floating investor mouths", "overloaded citizen scribes", "puppet politicians", "algorithmic spider machines", "sleepwalking shoppers", "ledger-faced landlords"],
  motifs: ["clocks", "masks", "receipts", "keys", "ladders", "teeth", "coins", "eyes", "hands", "wires", "mirrors", "fences", "stamps", "barcodes", "halos", "leaky pipes", "broken trophies"],
  ads: ["Subscribe to Stability", "Luxury Crisis Units Now Leasing", "Freedom, Terms Apply", "Official Efficiency Department", "Your Future Has Been Optimized", "Premium Scarcity Experience"]
};

const chatLog = document.querySelector("#chatLog");
const chatInput = document.querySelector("#chatInput");
const sendMessage = document.querySelector("#sendMessage");
const phaseBadge = document.querySelector("#phaseBadge");
const emotion = document.querySelector("#emotion");
const satire = document.querySelector("#satire");
const diagramCanvas = document.querySelector("#diagramCanvas");
const welcome = document.querySelector("#welcome");
const dashboardView = document.querySelector("#dashboardView");
const settingsPanel = document.querySelector("#settingsPanel");
const fileInput = document.querySelector("#fileInput");
const sourceFileInput = document.querySelector("#sourceFileInput");
const sourceUrl = document.querySelector("#sourceUrl");
const composerSourceUrl = document.querySelector("#composerSourceUrl");
const composerSourceBar = document.querySelector("#composerSourceBar");
const addMenu = document.querySelector("#addMenu");
const addMenuToggle = document.querySelector("#addMenuToggle");
const sourceTray = document.querySelector("#sourceTray");
const connectionStatus = document.querySelector("#connectionStatus");
let recognition = null;
let listening = false;
let serverOnline = false;

if (connectionStatus) {
  connectionStatus.textContent = "Connecting";
  connectionStatus.className = "connection-status";
}

let messages = [];
let lastConceptText = "";
let pendingAttachments = [];
let activeSources = [];
let selectedEmphasis = new Set();
let thinkingTimer = null;
let imageTimer = null;
let currentMode = "chat";
let dashboardSpec = null;

const iconPaths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  paperclip: '<path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  "file-code": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  "arrow-up": '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};

const emphasisProtocols = {
  auto: ["Evidence strength", "Power map", "Narrative frame", "Material stakes", "Visual metaphor", "Uncertainty"],
  evidence: ["Claims vs facts", "Unknowns", "Source limits", "Counterevidence", "Falsifiers", "Confidence labels"],
  power: ["Who benefits", "Who pays", "Decision points", "Incentives", "Excluded actors", "Institutional pressure"],
  material: ["Class dynamics", "Labor", "Capital flows", "Infrastructure", "Ownership", "Future being financed"],
  symbolic: ["Myth", "Legitimacy", "Ritual", "Humiliation", "Identity script", "Historical memory"],
  narrative: ["Propaganda", "Official story", "Omissions", "Spectacle", "Audience capture", "Media incentives"],
  mural: ["Hidden micro-scenes", "Fake advertisements", "Living institutions", "Arrows and labels", "Recurring motifs", "Grotesque symbols"],
  source: ["Direct source claims", "Source contradictions", "Quoted terminology", "What is absent", "Evidence gaps", "Source-to-visual mapping"]
};

const tiltLabels = [
  "0 - documentary",
  "1 - grounded symbolic",
  "2 - sharp allegory",
  "3 - satirical surreal",
  "4 - maximal absurd"
];

const dashboardWidgetNames = {
  intake: "Signal Intake",
  outside: "Outside Analysis",
  triadic: "Reasoning Map",
  actors: "Actor & Incentive Map",
  timeline: "Historical Timeline",
  risks: "Risk & Ethics Governor",
  render: "Render Control"
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function icon(name) {
  const pathData = iconPaths[name] || "";
  return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${pathData}</svg>`;
}

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
  if (sendMessage && !sendMessage.querySelector(".icon-svg")) {
    sendMessage.innerHTML = icon("arrow-up");
  }
}

function steeringOptions() {
  const protocol = document.querySelector("#emphasisProtocol")?.value || "auto";
  const tilt = Number(document.querySelector("#realityTilt")?.value || 1);
  return {
    emotionalWeather: emotion.value,
    satireLevel: satire.value,
    reasoningProtocol: document.querySelector("#reasoningProtocol")?.value || "Auto triadic reasoning",
    emphasisProtocol: protocol,
    emphasis: Array.from(selectedEmphasis),
    realityTilt: tilt,
    realityTiltLabel: tiltLabels[tilt] || tiltLabels[1]
  };
}

function inferredProtocol() {
  const text = `${chatInput.value}\n${activeSources.map((source) => `${source.title || ""} ${source.excerpt || ""}`).join("\n")}\n${messages.map((message) => message.content).join("\n")}`.toLowerCase();
  if (activeSources.length) return "source";
  if (/propaganda|media|headline|platform|narrative|advertis|spectacle/.test(text)) return "narrative";
  if (/labor|class|capital|rent|debt|infrastructure|ownership|supply|energy/.test(text)) return "material";
  if (/myth|identity|legitimacy|ritual|humiliation|memory|religion|nation/.test(text)) return "symbolic";
  if (/evidence|source|claim|uncertain|data|report|study|document/.test(text)) return "evidence";
  if (/power|incentive|institution|state|corporation|policy|elite|benefit/.test(text)) return "power";
  return "auto";
}

function renderEmphasisList() {
  const protocolControl = document.querySelector("#emphasisProtocol");
  const list = document.querySelector("#emphasisList");
  const tilt = Number(document.querySelector("#realityTilt")?.value || 1);
  const tiltLabel = document.querySelector("#tiltLabel");
  if (tiltLabel) tiltLabel.textContent = tiltLabels[tilt] || tiltLabels[1];
  if (!protocolControl || !list) return;

  const protocol = protocolControl.value === "auto" ? inferredProtocol() : protocolControl.value;
  const options = emphasisProtocols[protocol] || emphasisProtocols.auto;
  if (!selectedEmphasis.size) {
    selectedEmphasis = new Set(options.slice(0, 4));
  }
  list.innerHTML = options.map((item) => {
    const active = selectedEmphasis.has(item);
    return `<button class="emphasis-chip ${active ? "active" : ""}" type="button" data-emphasis="${escapeHtml(item)}">${escapeHtml(item)}</button>`;
  }).join("");
}

function setMode(mode) {
  currentMode = mode;
  const dashboardOn = mode === "dashboard";
  document.querySelector(".chatgpt-main").hidden = dashboardOn;
  if (dashboardView) dashboardView.hidden = !dashboardOn;
  diagramCanvas.hidden = dashboardOn;
  document.body.classList.toggle("dashboard-mode", dashboardOn);
  document.querySelector("#dashboardToggle").textContent = dashboardOn ? "Chat" : "Command center";
  if (dashboardOn && !dashboardSpec) {
    openDashboard();
  }
}

function renderMarkdownish(text) {
  const safe = escapeHtml(text);
  return safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.*)$/gm, "<strong>$1</strong>")
    .replace(/^## (.*)$/gm, "<strong>$1</strong>")
    .replace(/^# (.*)$/gm, "<strong>$1</strong>");
}

function attachmentLabel(file) {
  if (file.kind === "image") return `Image: ${file.name}`;
  if (file.kind === "text") return `Text: ${file.name}`;
  return `File: ${file.name}`;
}

function attachmentHtml(files = []) {
  if (!files.length) return "";
  return `<div class="attachment-list">${files.map((file) => `<span class="attachment-chip">${escapeHtml(attachmentLabel(file))}</span>`).join("")}</div>`;
}

function sourceLabel(source) {
  return source.title || source.url || source.name || "HTML source";
}

function renderSources() {
  if (!sourceTray) return;
  sourceTray.innerHTML = activeSources.map((source, index) => `
    <div class="source-chip">
      <div class="source-chip-title">${escapeHtml(sourceLabel(source))}</div>
      <div class="source-chip-meta">${escapeHtml(source.sourceType || "html")} - ${Math.round((source.excerpt || "").length / 1000)}k chars - active in chat</div>
      <button class="top-button" type="button" data-remove-source="${index}">Remove</button>
    </div>
  `).join("");
}

function imageResultHtml(image, revisedPrompt) {
  return `
    <div class="generated-image-card">
      <img src="${image}" alt="Generated visual concept">
      <div class="generated-image-actions">
        <a href="${image}" download="visual-systems-image.png">Download image</a>
      </div>
      ${revisedPrompt ? `<details><summary>Revised prompt</summary><p>${escapeHtml(revisedPrompt)}</p></details>` : ""}
    </div>
  `;
}

function logicTraceHtml(stage = 0) {
  const steering = steeringOptions();
  const corpus = `${chatInput.value}\n${messages.map((message) => message.content).join("\n")}\n${activeSources.map((source) => source.excerpt || source.title || "").join("\n")}`;
  const keywords = extractKeywords(corpus, ["Power", "Narrative", "Institution", "Material", "Speech", "Uncertainty"]);
  const emphasis = steering.emphasis && steering.emphasis.length ? steering.emphasis.join(", ") : "auto-selected emphasis";
  const steps = [
    ["Intake", `Reading ${activeSources.length ? `${activeSources.length} loaded source${activeSources.length === 1 ? "" : "s"}` : "the prompt"} and extracting the core topic: ${keywords.slice(0, 3).join(", ")}.`],
    ["Working Model", `Drafting a provisional system map around ${keywords[0]}, ${keywords[1]}, and ${keywords[2]}.`],
    ["Triadic Split", "Separating incentives and power, symbolic legitimacy, and material futures before visual synthesis."],
    ["Emphasis Pass", `${steering.emphasisProtocol}: foregrounding ${emphasis}.`],
    ["Visual Hypothesis", `Testing which metaphor can show ${keywords[0]} without turning inference into fake evidence.`],
    ["Guardrail", `Reality tilt ${steering.realityTilt}/4: ${steering.realityTiltLabel}. Claims stay separate from allegory.`]
  ];
  return `
    <div class="logic-trace">
      <div class="logic-trace-head">
        <span>Live logic trace</span>
        <span>${Math.min(stage + 1, steps.length)} / ${steps.length}</span>
      </div>
      ${steps.map(([title, body], index) => `
        <div class="logic-step ${index < stage ? "done" : index === stage ? "active" : ""}">
          <span class="logic-dot"></span>
          <div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(body)}</p>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function updatePendingTrace(article, stage) {
  const body = article.querySelector(".message-body");
  if (!body) return;
  body.innerHTML = `Thinking through the system...${logicTraceHtml(stage)}`;
}

function imageProgressHtml(progress = {}) {
  const percent = Math.max(0, Math.min(99, Math.round(progress.percent || 0)));
  const elapsed = Math.max(0, Math.floor((progress.elapsed || 0) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const stage = progress.stage || "Preparing image request";
  const detail = progress.detail || "Refining the visual prompt and preserving the current steering controls.";
  return `
    <div class="image-progress-card">
      <div class="image-progress-head">
        <strong>Image generation</strong>
        <span>${percent}% · ${minutes}:${seconds}</span>
      </div>
      <div class="image-progress-bar"><span style="width:${percent}%"></span></div>
      <div class="image-progress-stage">${escapeHtml(stage)}</div>
      <p>${escapeHtml(detail)}</p>
    </div>
  `;
}

function updateImageProgress(article, progress) {
  const body = article.querySelector(".message-body");
  if (!body) return;
  body.innerHTML = imageProgressHtml(progress);
}

function addMessage(role, content, options = {}) {
  welcome.style.display = "none";
  chatLog.classList.add("has-messages");
  const article = document.createElement("article");
  article.className = `message ${role}`;
  const name = role === "user" ? "You" : role === "system" ? "System" : "Visual Systems Analyst";
  article.innerHTML = `
    <div class="message-name">${name}</div>
    <div class="message-body">${renderMarkdownish(content)}${options.trace ? logicTraceHtml(0) : ""}${attachmentHtml(options.attachments)}${options.image ? imageResultHtml(options.image, options.revisedPrompt) : ""}</div>
  `;
  if (!options.skipStore && role !== "system") {
    messages.push({ role, content, attachments: options.attachments || [] });
  }
  chatLog.appendChild(article);
  chatLog.scrollTop = chatLog.scrollHeight;
  if (role === "assistant") lastConceptText = content;
  return article;
}

function bestImagePrompt(override = "") {
  if (override.trim()) return override.trim();
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant" && /prompt|mural|image|visual/i.test(message.content || ""));
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  return (lastAssistant && lastAssistant.content) || (lastUser && lastUser.content) || chatInput.value || "";
}

async function generateImage(promptOverride = "") {
  const prompt = (promptOverride.trim() || chatInput.value.trim() || bestImagePrompt()).trim();
  if (!prompt) {
    addMessage("system", "Give me an image prompt or a visual concept first, then I can generate the image.", { skipStore: true });
    return;
  }

  const pending = addMessage("assistant", "", { skipStore: true });
  const start = Date.now();
  const stages = [
    [8, "Preparing request", "Collecting the current prompt, loaded sources, emphasis protocol, and reality tilt."],
    [18, "Refining visual prompt", "Condensing the analysis into a coherent image-generation prompt."],
    [38, "Sending to image model", "The image model is composing the first visual pass."],
    [62, "Rendering dense details", "This can be slow for mural-style prompts with many symbolic elements."],
    [82, "Packaging result", "Waiting for image data and optional Supabase storage."],
    [94, "Finalizing", "Almost done; holding the connection open rather than falling back early."]
  ];
  let imageStageIndex = 0;
  window.clearInterval(imageTimer);
  updateImageProgress(pending, {
    percent: stages[0][0],
    elapsed: 0,
    stage: stages[0][1],
    detail: stages[0][2]
  });
  imageTimer = window.setInterval(() => {
    const elapsed = Date.now() - start;
    const nextIndex = Math.min(stages.length - 1, Math.floor(elapsed / 45000));
    imageStageIndex = Math.max(imageStageIndex, nextIndex);
    const stage = stages[imageStageIndex];
    const drift = Math.min(12, Math.floor((elapsed % 45000) / 4500));
    updateImageProgress(pending, {
      percent: Math.min(96, stage[0] + drift),
      elapsed,
      stage: stage[1],
      detail: stage[2]
    });
  }, 1000);

  try {
    if (!serverModeAvailable()) throw new Error("Open the app from http://127.0.0.1:5174 to generate images.");
    const healthy = serverOnline || await checkServerHealth();
    if (!healthy) throw new Error("The local server is not connected.");

    const response = await withTimeout(fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, messages, sources: activeSources, steering: steeringOptions() })
    }), 480000, "Image generation timed out after 8 minutes. Try lowering reality tilt, using fewer source details, or generating from the locked dashboard summary.");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image generation failed.");
    pending.remove();
    const storageNote = data.storage && data.storage.ok ? `\n\nSaved to Supabase: ${data.storage.bucket}/${data.storage.path}` : "";
    addMessage("assistant", `Generated image:${storageNote}`, {
      image: data.image,
      revisedPrompt: data.revisedPrompt,
      skipStore: true
    });
  } catch (error) {
    pending.remove();
    addMessage("system", error.message, { skipStore: true });
  } finally {
    window.clearInterval(imageTimer);
    imageTimer = null;
  }
}

function setBusy(isBusy) {
  sendMessage.disabled = isBusy;
  sendMessage.innerHTML = isBusy ? icon("x") : icon("arrow-up");
  if (phaseBadge) {
    phaseBadge.textContent = isBusy ? "Thinking" : "Ready";
    phaseBadge.className = `badge ${isBusy ? "medium" : ""}`;
  }
  if (connectionStatus && serverOnline) {
    connectionStatus.textContent = isBusy ? "Thinking" : "Connected";
    connectionStatus.className = `connection-status ${isBusy ? "" : "ok"}`;
  }
}

function serverModeAvailable() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

async function withTimeout(promise, ms, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function setConnectionStatus(ok, label) {
  serverOnline = ok;
  if (!connectionStatus) return;
  connectionStatus.textContent = label || (ok ? "Connected" : "Offline");
  connectionStatus.className = `connection-status ${ok ? "ok" : "bad"}`;
}

async function checkServerHealth() {
  if (!serverModeAvailable()) {
    setConnectionStatus(false, "File mode");
    return false;
  }
  try {
    const response = await withTimeout(fetch("/api/health", { cache: "no-store" }), 2000, "Server health check timed out.");
    const ok = response.ok;
    setConnectionStatus(ok, ok ? "Connected" : "Server error");
    return ok;
  } catch (error) {
    setConnectionStatus(false, "Offline");
    return false;
  }
}

function fallbackResponse(userText) {
  const lock = /lock this concept|final prompt|final image prompt/i.test(userText);
  const keywords = extractKeywords(messages.map((message) => message.content).join("\n"), ["power", "institution", "scarcity", "spectacle", "labor", "memory"]);
  const metaphor = `${keywords[0]} as a malfunctioning ${conceptBanks.institutions[keywords.join("").length % conceptBanks.institutions.length]}`;

  if (lock) {
    return `I will lock this as a final mural direction using the local fallback engine.

**Continuous image prompt**
Create an ultra-dense black-and-white hand-drawn ink doodle mural visualizing ${metaphor}. Make it feel like an anarchic classroom notebook, underground zine spread, satirical systems diagram, exploded editorial cartoon universe, and wall-sized political cartoon. Fill the composition with crosshatching, marginalia, fake advertisements, labels, arrows, symbolic architecture, tiny crowds, bureaucratic machinery, hidden micro-scenes, recurring motifs, and no empty space.

**Structured blueprint**
Central engine: ${metaphor}.
Major zones: ${conceptBanks.institutions.slice(0, 5).join(", ")}.
Systems: ${conceptBanks.systems.slice(0, 6).join(", ")}.
Characters: ${conceptBanks.characters.slice(0, 5).join(", ")}.
Motifs: ${conceptBanks.motifs.slice(0, 8).join(", ")}.
Guardrail: interpretive metaphor only, not documentary evidence. Do not fabricate maps, headlines, seals, documents, or claims. Preserve human dignity.`;
  }

  return `I am going to deconstruct this first rather than rush into a final prompt.

**Working read**
The core visual problem is not just the topic itself, but the system underneath it: actors, incentives, institutions, narrative cover, material pressure, and what the visual should make newly legible.

**Triadic spine**
Strategic: identify the game being played, the incentives, the bargaining pressure, and who benefits from delay, ambiguity, or escalation.

Symbolic: identify the myth, legitimacy story, identity script, humiliation, spectacle, or sacred value being activated.

Material-futurist: identify who owns, operates, finances, or suffers the future being built: labor, capital, infrastructure, technology, energy, logistics, territory, or debt.

**Cross-pole contradiction**
The strongest visual usually appears where the public story, strategic mechanics, and material payload do not line up.

**Strong first direction**
Use ${metaphor} as the central visual engine. Around it, build zones for public language, hidden machinery, affected people, institutional rituals, and small counter-movements.

**Visual density**
I would start Hybrid: a readable central structure with symbolic margins. If you want more intensity, push it into maximalist black-and-white doodle mural territory after the concept proves itself.

**What to show**
- who benefits and who absorbs costs
- the official story versus the material machinery
- contradiction as physical architecture
- uncertainty as dotted lines, question marks, disputed labels, or competing mini-scenes

**Next move**
React to the direction, or say "lock this concept" and I will turn it into the final cinematic mural prompt and structured blueprint.`;
}

async function askAnalyst(text) {
  const trimmed = text.trim();
  if (!trimmed && !pendingAttachments.length) return;

  const attachments = pendingAttachments;
  pendingAttachments = [];
  renderPendingAttachments();
  const messageText = trimmed || "Please analyze the attached material.";
  addMessage("user", messageText, { attachments });
  chatInput.value = "";
  setBusy(true);
  const pending = addMessage("assistant", "Thinking through the system...", { skipStore: true, trace: true });
  let traceStage = 0;
  window.clearInterval(thinkingTimer);
  thinkingTimer = window.setInterval(() => {
    traceStage = Math.min(traceStage + 1, 5);
    updatePendingTrace(pending, traceStage);
  }, 1800);

  try {
    if (!serverModeAvailable()) {
      throw new Error("Open the app from http://127.0.0.1:5174 to use the real LLM backend.");
    }
    if (!serverOnline) {
      const healthy = await checkServerHealth();
      if (!healthy) {
        throw new Error("The local server is not connected.");
      }
    }
    const request = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, steering: steeringOptions(), sources: activeSources })
    });
    const response = await withTimeout(request, 120000, "The local server did not answer within 120 seconds.");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The analyst backend failed.");
    const answer = (data.text || "").trim();
    if (!answer) throw new Error("The analyst returned an empty response.");
    pending.remove();
    addMessage("assistant", answer);
    if (/lock this concept|lock concept|command center|dashboard/i.test(trimmed)) {
      openDashboard();
    }
  } catch (error) {
    pending.remove();
    setConnectionStatus(false, "Fallback");
    addMessage("system", `${error.message} I am using the built-in fallback right now so the chat keeps moving.`, { skipStore: true });
    const reply = fallbackResponse(messageText);
    addMessage("assistant", reply);
  } finally {
    window.clearInterval(thinkingTimer);
    thinkingTimer = null;
    setBusy(false);
  }
}

function extractKeywords(text, fallback) {
  const stop = new Set(["about", "after", "against", "also", "because", "before", "being", "between", "could", "every", "from", "have", "into", "more", "most", "should", "than", "that", "their", "there", "these", "this", "through", "under", "what", "when", "where", "which", "while", "with", "without", "would", "visual", "system", "systems", "material", "concept"]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !stop.has(word));
  const counts = words.reduce((map, word) => {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
  const ranked = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word.replace(/^\w/, (char) => char.toUpperCase()));
  const unique = [...new Set(ranked)].slice(0, 8);
  return unique.length ? unique : fallback;
}

function scoreFromText(seed, min = 28, spread = 58) {
  const total = String(seed).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.min(96, min + (total % spread));
}

function currentCorpus() {
  return [
    messages.map((message) => message.content).join("\n"),
    activeSources.map((source) => `${source.title}\n${source.excerpt || ""}`).join("\n")
  ].filter(Boolean).join("\n\n");
}

function sourceCardsForDashboard(keywords) {
  if (activeSources.length) {
    return activeSources.map((source, index) => ({
      title: sourceLabel(source),
      type: source.sourceType === "html" ? "HTML SOURCE" : "IMPORTED SOURCE",
      date: source.metadata?.importedAt ? new Date(source.metadata.importedAt).toLocaleDateString() : "Loaded",
      region: source.url ? "Web source" : "Local source",
      tone: index % 2 ? "Interpretive" : "Documentary",
      confidence: scoreFromText(source.title || index, 54, 34),
      tags: [keywords[index % keywords.length] || "SOURCE", "USER-PROVIDED", source.url ? "URL" : "LOCAL"].map((tag) => String(tag).toUpperCase())
    }));
  }

  return [
    { title: "Locked conversation", type: "WORKING BRIEF", date: "Now", region: "User prompt", tone: "Exploratory", confidence: 68, tags: ["PROMPT", "INFERENCE", "NEEDS SOURCES"] },
    { title: "Analyst synthesis", type: "INTERNAL MODEL", date: "Now", region: "Triadic frame", tone: "Structured", confidence: 62, tags: ["STRATEGIC", "SYMBOLIC", "MATERIAL"] }
  ];
}

function buildDashboardSpec() {
  const corpus = currentCorpus();
  const keywords = extractKeywords(corpus, ["Power", "Narrative", "Institution", "Material", "Uncertainty", "Future"]);
  const steering = steeringOptions();
  const title = keywords.slice(0, 3).join(" / ") || "Narrative Observatory";
  const sourceCards = sourceCardsForDashboard(keywords);
  const selected = steering.emphasis && steering.emphasis.length ? steering.emphasis : ["Evidence strength", "Power map", "Material stakes", "Uncertainty"];

  return {
    title,
    subtitle: "Command center generated from the locked prompt, loaded sources, and steering controls.",
    status: ["Ethical governor active", "Uncertainty visible", `${steering.realityTiltLabel}`],
    keywords,
    sources: sourceCards,
    outside: {
      consensus: [
        `${keywords[0]} is the dominant visible pressure.`,
        `${keywords[1] || "Narrative"} shapes how the system explains itself.`,
        "Source claims should be treated as inputs, not automatic facts."
      ],
      disputed: [
        `Which actor benefits most from ${keywords[2] || "the current arrangement"}.`,
        "Whether symbolic escalation or material constraint is driving the next move.",
        "Which missing sources would change the model."
      ],
      missing: activeSources.length ? ["Contrary analysis", "Primary documents", "Affected public perspectives"] : ["Outside analysis", "Primary documents", "Independent reporting"]
    },
    layers: {
      game: {
        label: "Strategic Game Model",
        headline: `Dominant structure: incentives around ${keywords[0] || "power"}`,
        details: selected.slice(0, 3).map((item) => `Track ${item.toLowerCase()} as a strategic signal.`)
      },
      myth: {
        label: "Mythic Operating System",
        headline: `Dominant script: ${keywords[1] || "legitimacy"} as public meaning`,
        details: ["Look for sacred language, humiliation, legitimacy claims, and identity sorting.", "Convert symbolic claims into visible architecture, not fake evidence.", "Show counter-myths as competing signs or rituals."]
      },
      material: {
        label: "Material Future Map",
        headline: `Core question: who owns or absorbs ${keywords[2] || "the future"}?`,
        details: ["Track labor, capital, infrastructure, debt, logistics, and ownership.", "Show who pays costs and who captures optionality.", "Map the future being financed or foreclosed."]
      }
    },
    actors: [
      { name: "Institutional actors", role: "Decision layer", incentive: "Preserve authority", risk: "False certainty" },
      { name: "Capital networks", role: "Allocator", incentive: "Control chokepoints", risk: "Fragile dependencies" },
      { name: "Media systems", role: "Narrative amplifier", incentive: "Attention and framing", risk: "Spectacle drift" },
      { name: "Publics", role: "Cost absorber", incentive: "Stability and dignity", risk: "Fear politics" }
    ],
    timeline: [
      { label: "Trigger", text: keywords[0] || "Initial shock" },
      { label: "Near", text: "Narrative hardens" },
      { label: "Mid", text: "Institutional incentives consolidate" },
      { label: "Long", text: "Material future becomes infrastructure" },
      { label: "Branch", text: "Reform / escalation / rupture" }
    ],
    risks: [
      ["False certainty", scoreFromText(corpus || "certainty", 42, 36)],
      ["Conspiracy aesthetic", scoreFromText(`${corpus} conspiracy`, 28, 42)],
      ["Trauma spectacle", scoreFromText(`${corpus} trauma`, 18, 34)],
      ["Source overclaim", activeSources.length ? 46 : 72]
    ],
    widgets: ["intake", "outside", "triadic", "actors", "timeline", "risks", "render"]
  };
}

function wrapSvgText(text, x, y, width, className = "diagram-label") {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const trial = `${line} ${word}`.trim();
    if (trial.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3).map((item, index) => `<text class="${className}" x="${x}" y="${y + index * 17}" text-anchor="middle">${escapeHtml(item)}</text>`).join("");
}

function svgShell(title, body, width = 1120, height = 520) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
    <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#315f8f"></path></marker></defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,253,248,0.76)"></rect>
    <text class="diagram-title" x="36" y="45">${escapeHtml(title)}</text>
    ${body}
  </svg>`;
}

function meterHtml(value) {
  return `<div class="dash-meter"><span style="width:${Math.max(0, Math.min(100, Number(value) || 0))}%"></span></div>`;
}

function pillHtml(text, tone = "") {
  return `<span class="dash-pill ${tone}">${escapeHtml(text)}</span>`;
}

function dashboardSourceCard(source) {
  return `
    <article class="dash-source-card">
      <div class="dash-card-head">
        <div>
          <h3>${escapeHtml(source.title)}</h3>
          <p>${escapeHtml(source.type)}</p>
        </div>
        <span class="dash-icon">${icon("file-code")}</span>
      </div>
      <dl class="dash-meta">
        <div><dt>Date</dt><dd>${escapeHtml(source.date)}</dd></div>
        <div><dt>Tone</dt><dd>${escapeHtml(source.tone)}</dd></div>
        <div><dt>Region</dt><dd>${escapeHtml(source.region)}</dd></div>
      </dl>
      <div class="dash-confidence"><span>Confidence</span><strong>${source.confidence}%</strong></div>
      ${meterHtml(source.confidence)}
      <div class="dash-tags">${source.tags.map((tag) => pillHtml(tag)).join("")}</div>
    </article>
  `;
}

function dashboardSectionTitle(iconName, title, subtitle = "") {
  return `
    <div class="dash-section-title">
      <div>
        <h2><span class="dash-title-icon">${icon(iconName)}</span>${escapeHtml(title)}</h2>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderDashboard(spec) {
  if (!dashboardView) return;
  const activeLayer = spec.layers.game;
  dashboardView.innerHTML = `
    <div class="dashboard-shell">
      <header class="dash-header">
        <div class="dash-brand">
          <div class="dash-logo">${icon("image")}</div>
          <div>
            <h1>${escapeHtml(spec.title)}</h1>
            <p>${escapeHtml(spec.subtitle)}</p>
          </div>
        </div>
        <div class="dash-status-row">${spec.status.map((item, index) => pillHtml(item, index === 0 ? "green" : index === 1 ? "blue" : "amber")).join("")}</div>
      </header>

      <main class="dash-grid">
        <aside class="dash-panel">
          ${dashboardSectionTitle("link", dashboardWidgetNames.intake, "Imported media becomes classified signal for the reasoning layer.")}
          <button class="dash-import" type="button" data-dashboard-add-source>
            <span><strong>Import source</strong><small>HTML file, URL, report, transcript</small></span>
            ${icon("arrow-up")}
          </button>
          <div class="dash-stack">${spec.sources.map(dashboardSourceCard).join("")}</div>
        </aside>

        <section class="dash-main">
          <article class="dash-panel">
            ${dashboardSectionTitle("mic", dashboardWidgetNames.triadic, "The engine exposes the current framework before any final image is produced.")}
            <div class="dash-layer-tabs">
              ${Object.entries(spec.layers).map(([key, layer]) => `<button class="${key === "game" ? "active" : ""}" type="button" data-layer="${key}">${escapeHtml(layer.label.replace(" Model", "").replace(" Operating System", "").replace(" Map", ""))}</button>`).join("")}
            </div>
            <div class="dash-reasoning-map">
              <div class="dash-grid-bg"></div>
              <div class="dash-layer-readout" id="dashLayerReadout">
                <h3>${escapeHtml(activeLayer.label)}</h3>
                <p>${escapeHtml(activeLayer.headline)}</p>
                <ul>${activeLayer.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
              </div>
              <div class="dash-kernel">Mural<br>Kernel</div>
              ${spec.actors.map((actor, index) => `<div class="dash-actor actor-${index}">
                <strong>${escapeHtml(actor.name)}</strong>
                <span>${escapeHtml(actor.role)}</span>
                <p>${escapeHtml(actor.incentive)}</p>
              </div>`).join("")}
            </div>
          </article>

          <article class="dash-panel">
            ${dashboardSectionTitle("file-code", dashboardWidgetNames.outside, "What outside analysis currently supports, disputes, or fails to cover.")}
            <div class="dash-review-grid">
              <div><h3>Consensus</h3>${spec.outside.consensus.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>
              <div><h3>Disputed</h3>${spec.outside.disputed.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>
              <div><h3>Missing</h3>${spec.outside.missing.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>
            </div>
          </article>

          <article class="dash-panel">
            ${dashboardSectionTitle("link", dashboardWidgetNames.timeline, "Trigger, context, structure, historical echo, and future branch.")}
            <div class="dash-timeline">${spec.timeline.map((item) => `<div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.text)}</span></div>`).join("")}</div>
          </article>
        </section>

        <aside class="dash-panel">
          ${dashboardSectionTitle("file-code", dashboardWidgetNames.risks, "Safeguards shape the mural before generation.")}
          <div class="dash-risk-stack">
            ${spec.risks.map(([name, value]) => `<div class="dash-risk-row"><div><span>${escapeHtml(name)}</span><strong>${value}%</strong></div>${meterHtml(value)}</div>`).join("")}
          </div>
          <div class="dash-control-card">
            <h3>Dashboard widgets</h3>
            ${spec.widgets.map((widget) => pillHtml(dashboardWidgetNames[widget] || widget)).join("")}
          </div>
          <div class="dash-render-card">
            <h3>Render Control</h3>
            <p>Generate only after the reasoning model and safeguards are inspectable.</p>
            <button type="button" id="dashboardGenerateImage">${icon("image")} Generate final image</button>
            <button type="button" id="dashboardBackToChat">${icon("arrow-up")} Back to chat</button>
          </div>
        </aside>
      </main>
    </div>
  `;
}

function refreshDashboard() {
  dashboardSpec = buildDashboardSpec();
  renderDashboard(dashboardSpec);
}

function openDashboard() {
  refreshDashboard();
  setMode("dashboard");
  settingsPanel.classList.remove("open");
}

function rectNode(x, y, w, h, title, note = "", tone = "") {
  return `<g>
    <rect class="node-box ${tone}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"></rect>
    ${wrapSvgText(title, x + w / 2, y + 34, 18)}
    ${note ? wrapSvgText(note, x + w / 2, y + h - 25, 24, "diagram-small") : ""}
  </g>`;
}

function diagramModel() {
  const text = `${messages.map((message) => message.content).join("\n")}\n${lastConceptText}`;
  const keywords = extractKeywords(text, ["Power", "Narrative", "Institution", "Material pressure", "Contradiction", "Uncertainty"]);
  return {
    title: keywords.slice(0, 3).join(" / ") || "Visual system",
    keywords,
    systems: conceptBanks.systems,
    institutions: conceptBanks.institutions,
    characters: conceptBanks.characters,
    motifs: conceptBanks.motifs,
    ads: conceptBanks.ads
  };
}

function renderDiagram() {
  const model = diagramModel();
  const type = document.querySelector("#diagramType").value;
  const bodyByType = {
    triadic: `
      ${rectNode(455, 72, 210, 86, "Event Discipline", "define before interpreting", "primary")}
      ${rectNode(86, 218, 250, 104, "Strategic-Rational", "game, incentives, signals, constraints", "")}
      ${rectNode(435, 218, 250, 104, "Symbolic-Civilizational", "myth, legitimacy, ritual, spectacle", "soft")}
      ${rectNode(784, 218, 250, 104, "Materialist-Futurist", "labor, capital, tech, infrastructure, future", "")}
      ${rectNode(320, 388, 230, 82, "Contradiction", "where the visual gets sharp", "primary")}
      ${rectNode(600, 388, 230, 82, "Visual Translation", "diagram, map, mural, prompt", "primary")}
      <path class="diagram-line" d="M560 158 C430 195, 325 210, 250 218"></path>
      <path class="diagram-line" d="M560 158 C560 178, 560 198, 560 218"></path>
      <path class="diagram-line" d="M560 158 C690 195, 795 210, 910 218"></path>
      <path class="diagram-line dashed" d="M250 322 C295 364, 340 382, 385 388"></path>
      <path class="diagram-line dashed" d="M560 322 C530 354, 500 374, 465 388"></path>
      <path class="diagram-line dashed" d="M910 322 C805 372, 705 388, 600 408"></path>
      <path class="diagram-line" d="M550 430 C570 430, 580 430, 600 430"></path>`,
    causal: `
      ${rectNode(80, 105, 190, 86, "Central Engine", model.keywords[0], "primary")}
      ${rectNode(330, 105, 190, 86, "Institution", model.keywords[1], "")}
      ${rectNode(580, 105, 190, 86, "Incentive", model.keywords[2], "soft")}
      ${rectNode(830, 105, 190, 86, "Narrative", model.keywords[3], "")}
      ${rectNode(455, 315, 210, 86, "Feedback", model.keywords[4], "primary")}
      <path class="diagram-line" d="M270 148 C295 148, 305 148, 330 148"></path>
      <path class="diagram-line" d="M520 148 C545 148, 555 148, 580 148"></path>
      <path class="diagram-line" d="M770 148 C795 148, 805 148, 830 148"></path>
      <path class="diagram-line dashed" d="M925 192 C855 310, 735 350, 665 358"></path>
      <path class="diagram-line dashed" d="M455 358 C315 340, 210 260, 175 192"></path>`,
    actors: `
      ${rectNode(465, 210, 190, 92, "Mural World", model.keywords[0], "primary")}
      ${[[95,105],[465,80],[835,105],[95,330],[465,365],[835,330]].map(([x,y], index) => rectNode(x, y, 190, 82, model.institutions[index], model.characters[index], index === 2 ? "soft" : "")).join("")}`,
    scenario: `
      ${rectNode(70, 220, 210, 86, "Source Tension", model.keywords[0], "primary")}
      ${rectNode(380, 90, 220, 86, "Narrative Flow", model.ads[0], "")}
      ${rectNode(380, 220, 220, 86, "Material Flow", model.systems[0], "soft")}
      ${rectNode(380, 350, 220, 86, "Counter-Flow", model.motifs[0], "")}
      ${rectNode(750, 90, 250, 86, "Typography", "banners, stamps, graffiti", "soft")}
      ${rectNode(750, 220, 250, 86, "Micro-Scenes", "jokes, rituals, disputes", "")}
      ${rectNode(750, 350, 250, 86, "Uncertainty", "dotted lines, caveats", "primary")}`,
    matrix: `
      <text class="diagram-label" x="190" y="96" text-anchor="middle">Theme</text>
      <text class="diagram-label" x="440" y="96" text-anchor="middle">Character</text>
      <text class="diagram-label" x="650" y="96" text-anchor="middle">Machine</text>
      <text class="diagram-label" x="850" y="96" text-anchor="middle">Motif</text>
      <text class="diagram-label" x="1010" y="96" text-anchor="middle">Signage</text>
      ${model.keywords.slice(0, 6).map((item, index) => {
        const y = 125 + index * 58;
        return `<rect class="node-box ${index % 2 ? "soft" : ""}" x="72" y="${y}" width="240" height="44" rx="6"></rect>
        ${wrapSvgText(item, 192, y + 27, 20)}
        <text class="diagram-small" x="440" y="${y + 27}" text-anchor="middle">${escapeHtml(model.characters[index])}</text>
        <text class="diagram-small" x="650" y="${y + 27}" text-anchor="middle">${escapeHtml(model.systems[index])}</text>
        <text class="diagram-small" x="850" y="${y + 27}" text-anchor="middle">${escapeHtml(model.motifs[index])}</text>
        <text class="diagram-small" x="1010" y="${y + 27}" text-anchor="middle">${escapeHtml(model.ads[index] || "label")}</text>`;
      }).join("")}`
  };
  diagramCanvas.innerHTML = svgShell(`${model.title}: Composition Sketch`, bodyByType[type]);
  diagramCanvas.classList.add("has-diagram");
}

function exportMarkdown() {
  const sourceLines = activeSources.map((source) => `## Source: ${sourceLabel(source)}\n\n${source.url ? `${source.url}\n\n` : ""}${source.excerpt || ""}`).join("\n\n");
  const lines = [sourceLines, messages.map((message) => `## ${message.role === "user" ? "You" : "Visual Systems Analyst"}\n\n${message.content}`).join("\n\n")].filter(Boolean).join("\n\n");
  downloadFile("visual-systems-chat.md", lines || "No conversation yet.", "text/markdown");
}

function exportSvg() {
  const svg = diagramCanvas.querySelector("svg");
  if (!svg) renderDiagram();
  const rendered = diagramCanvas.querySelector("svg");
  if (!rendered) return;
  downloadFile("visual-systems-sketch.svg", rendered.outerHTML, "image/svg+xml");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function saveChat() {
  const storableMessages = messages.map((message) => ({
    ...message,
    attachments: (message.attachments || []).map((attachment) => ({
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      kind: attachment.kind,
      text: attachment.text
    }))
  }));

  try {
    if (!serverModeAvailable()) throw new Error("Server mode is not available.");
    const response = await fetch("/api/persist/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: storableMessages.find((message) => message.role === "user")?.content?.slice(0, 80) || "Visual Systems Chat",
        messages: storableMessages,
        sources: activeSources,
        steering: steeringOptions(),
        lastConceptText
      })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Supabase save failed.");
    document.querySelector("#saveProject").textContent = "Saved to Supabase";
  } catch (error) {
    localStorage.setItem("visualSystemsChat", JSON.stringify({ messages: storableMessages, sources: activeSources, steering: steeringOptions(), lastConceptText }));
    addMessage("system", `${error.message} I saved a local browser copy instead. Run the Supabase schema setup to enable database persistence.`, { skipStore: true });
    document.querySelector("#saveProject").textContent = "Saved locally";
  }

  window.setTimeout(() => {
    document.querySelector("#saveProject").textContent = "Save chat";
  }, 1400);
}

async function loadChat() {
  try {
    if (!serverModeAvailable()) throw new Error("Server mode is not available.");
    const response = await fetch("/api/persist/latest", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Supabase load failed.");
    if (!data.messages.length) throw new Error("No Supabase chat has been saved yet.");
    messages = [];
    activeSources = data.sources || [];
    lastConceptText = "";
    chatLog.innerHTML = "";
    (data.messages || []).forEach((message) => addMessage(message.role, message.content, { attachments: message.attachments || [] }));
    renderSources();
    document.querySelector("#loadProject").textContent = "Loaded";
  } catch (error) {
    const raw = localStorage.getItem("visualSystemsChat");
    if (!raw) {
      addMessage("system", `${error.message} No local browser copy was found either.`, { skipStore: true });
      return;
    }
    const saved = JSON.parse(raw);
    messages = [];
    activeSources = saved.sources || [];
    lastConceptText = saved.lastConceptText || "";
    chatLog.innerHTML = "";
    (saved.messages || []).forEach((message) => addMessage(message.role, message.content, { attachments: message.attachments || [] }));
    renderSources();
    if (!messages.length) newChat();
    addMessage("system", `${error.message} I loaded the local browser copy instead.`, { skipStore: true });
    document.querySelector("#loadProject").textContent = "Loaded local";
  }

  window.setTimeout(() => {
    document.querySelector("#loadProject").textContent = "Load chat";
  }, 1400);
}

async function syncProtocols() {
  const button = document.querySelector("#syncProtocols");
  button.textContent = "Syncing";
  try {
    if (!serverModeAvailable()) throw new Error("Server mode is not available.");
    const response = await fetch("/api/protocols/sync", { method: "POST" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Protocol sync failed.");
    addMessage("system", `Synced ${data.protocols.length} protocols and ${data.protocol_versions.length} protocol versions to Supabase.`, { skipStore: true });
    button.textContent = "Synced";
  } catch (error) {
    addMessage("system", `${error.message} Run the Supabase schema setup first, then try syncing protocols again.`, { skipStore: true });
    button.textContent = "Sync failed";
  }
  window.setTimeout(() => {
    button.textContent = "Sync protocols";
  }, 1500);
}

function newChat() {
  messages = [];
  lastConceptText = "";
  pendingAttachments = [];
  activeSources = [];
  chatLog.innerHTML = "";
  chatLog.classList.remove("has-messages");
  welcome.style.display = "";
  diagramCanvas.innerHTML = "";
  diagramCanvas.classList.remove("has-diagram");
  renderPendingAttachments();
  renderSources();
}

function insertIntoComposer(text) {
  chatInput.value = chatInput.value ? `${chatInput.value}\n\n${text}` : text;
  chatInput.focus();
  chatInput.selectionStart = chatInput.value.length;
  chatInput.selectionEnd = chatInput.value.length;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isTextLike(file) {
  return /text|json|csv|xml|html|markdown/i.test(file.type) || /\.(txt|md|markdown|csv|tsv|json|html|xml|js|ts|css)$/i.test(file.name);
}

function isImageLike(file) {
  return /^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type);
}

function cleanHtmlText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, noscript, template, svg, canvas, iframe").forEach((node) => node.remove());
  const title = (doc.querySelector("title")?.textContent || doc.querySelector("h1")?.textContent || "").trim();
  const description = (doc.querySelector('meta[name="description"]')?.getAttribute("content") || "").trim();
  const links = Array.from(doc.querySelectorAll("a[href]"))
    .map((link) => ({ text: link.textContent.trim().replace(/\s+/g, " "), href: link.href }))
    .filter((link) => link.text && link.href)
    .slice(0, 40);
  const text = (doc.body?.innerText || doc.body?.textContent || doc.documentElement.textContent || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return { title, description, text, links };
}

async function saveSource(source) {
  if (!serverModeAvailable()) return null;
  const response = await fetch("/api/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(source)
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Source save failed.");
  return data.source;
}

async function addHtmlSource({ html, name, url = "" }) {
  const parsed = cleanHtmlText(html);
  if (!parsed.text) throw new Error("I could not extract readable text from that HTML source.");
  const source = {
    title: parsed.title || name || url || "HTML source",
    name: name || "",
    url,
    sourceType: "html",
    mimeType: "text/html",
    size: html.length,
    excerpt: parsed.text.slice(0, 120000),
    metadata: {
      description: parsed.description,
      links: parsed.links,
      importedAt: new Date().toISOString()
    }
  };

  try {
    const saved = await saveSource(source);
    activeSources.unshift({ ...source, id: saved.id });
    addMessage("system", `Loaded HTML source: ${sourceLabel(source)}. It will be included in the next analysis.`, { skipStore: true });
  } catch (error) {
    activeSources.unshift(source);
    addMessage("system", `Loaded HTML source locally: ${sourceLabel(source)}. ${error.message}`, { skipStore: true });
  }
  activeSources = activeSources.slice(0, 5);
  if (document.querySelector("#emphasisProtocol")?.value === "auto") {
    selectedEmphasis = new Set();
  }
  renderSources();
  renderEmphasisList();
}

async function loadHtmlSourceFile(file) {
  if (!file) return;
  if (file.size > 5_000_000) {
    addMessage("system", `${file.name} is over 5 MB. Use a smaller HTML export for now.`, { skipStore: true });
    return;
  }
  await addHtmlSource({ html: await file.text(), name: file.name });
}

async function loadHtmlSourceUrl(urlOverride = "") {
  const url = String(urlOverride || sourceUrl?.value || composerSourceUrl?.value || "").trim();
  if (!url) return;
  try {
    if (!serverModeAvailable()) throw new Error("Open the app from http://127.0.0.1:5174 to load URL sources.");
    const response = await fetch("/api/sources/fetch-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Could not load that URL.");
    await addHtmlSource({ html: data.html, name: data.title || url, url: data.url || url });
    if (sourceUrl) sourceUrl.value = "";
    if (composerSourceUrl) composerSourceUrl.value = "";
    if (composerSourceBar) composerSourceBar.hidden = true;
  } catch (error) {
    addMessage("system", error.message, { skipStore: true });
  }
}

async function fileToAttachment(file) {
  const base = {
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size
  };

  if (isImageLike(file)) {
    return { ...base, kind: "image", dataUrl: await readAsDataUrl(file) };
  }

  if (isTextLike(file)) {
    const text = await file.text();
    return { ...base, kind: "text", text: text.slice(0, 120000) };
  }

  return { ...base, kind: "file", dataUrl: await readAsDataUrl(file) };
}

function renderPendingAttachments() {
  let tray = document.querySelector("#attachmentTray");
  if (!tray) {
    tray = document.createElement("div");
    tray.id = "attachmentTray";
    tray.className = "attachment-tray";
    document.querySelector(".composer-wrap").insertBefore(tray, document.querySelector(".composer"));
  }
  tray.innerHTML = pendingAttachments.map((file, index) => `
    <button type="button" data-remove-attachment="${index}" title="Remove ${escapeHtml(file.name)}">
      ${escapeHtml(attachmentLabel(file))}
      <span>×</span>
    </button>
  `).join("");
  tray.style.display = pendingAttachments.length ? "flex" : "none";
}

async function handleFileImport(files) {
  const list = Array.from(files || []);
  if (!list.length) return;

  const tooLarge = list.find((file) => file.size > 12_000_000);
  if (tooLarge) {
    addMessage("system", `${tooLarge.name} is over 12 MB. Use a smaller excerpt or compress it first.`, { skipStore: true });
    return;
  }

  for (const file of list) {
    pendingAttachments.push(await fileToAttachment(file));
  }
  renderPendingAttachments();
  chatInput.focus();
}

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMessage("system", "Voice input is not available in this browser. You can still paste or type normally.", { skipStore: true });
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      chatInput.value = transcript;
    };
    recognition.onend = () => {
      listening = false;
      document.querySelector("#voiceInput").classList.remove("active");
    };
    recognition.onerror = () => {
      listening = false;
      document.querySelector("#voiceInput").classList.remove("active");
      addMessage("system", "Voice input stopped. If the browser asked for microphone permission, allow it and try again.", { skipStore: true });
    };
  }

  if (listening) {
    recognition.stop();
    return;
  }

  listening = true;
  document.querySelector("#voiceInput").classList.add("active");
  recognition.start();
}

function renderCards() {
  const councilGrid = document.querySelector("#councilGrid");
  const doctrineGrid = document.querySelector("#doctrineGrid");
  if (councilGrid) councilGrid.innerHTML = councilSeats.map(([title, body]) => `<article class="council-card"><h3>${title}</h3><p>${body}</p></article>`).join("");
  if (doctrineGrid) doctrineGrid.innerHTML = doctrineCards.map(([title, body]) => `<article class="doctrine-card"><h3>${title}</h3><p>${body}</p></article>`).join("");
}

function renderTemplates() {
  const tabs = document.querySelector("#templateTabs");
  const box = document.querySelector("#templateBox");
  if (!tabs || !box) return;
  const names = Object.keys(templates);
  tabs.innerHTML = names.map((name, index) => `<button class="template-tab ${index === 0 ? "active" : ""}" type="button" data-template="${name}">${name}</button>`).join("");
  box.textContent = templates[names[0]];
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".template-tab");
    if (!button) return;
    document.querySelectorAll(".template-tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    box.textContent = templates[button.dataset.template];
  });
}

function setAddMenu(open) {
  if (!addMenu || !addMenuToggle) return;
  addMenu.hidden = !open;
  addMenuToggle.setAttribute("aria-expanded", String(open));
}

function handleAddAction(action) {
  setAddMenu(false);
  if (action === "file") {
    fileInput?.click();
    return;
  }
  if (action === "html") {
    sourceFileInput?.click();
    return;
  }
  if (action === "url") {
    if (composerSourceBar) composerSourceBar.hidden = false;
    composerSourceUrl?.focus();
  }
}

sendMessage.addEventListener("click", () => askAnalyst(chatInput.value));
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    askAnalyst(chatInput.value);
  }
});
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = chatInput.value ? `${chatInput.value}\n\n${button.dataset.prompt}` : button.dataset.prompt;
    chatInput.focus();
  });
});
document.querySelector("#clear")?.addEventListener("click", newChat);
document.querySelector("#titleMenu")?.addEventListener("click", () => settingsPanel.classList.toggle("open"));
document.querySelector("#settingsToggle")?.addEventListener("click", () => settingsPanel.classList.toggle("open"));
document.querySelector("#settingsClose")?.addEventListener("click", () => settingsPanel.classList.remove("open"));
document.querySelector("#dashboardToggle")?.addEventListener("click", () => {
  if (currentMode === "dashboard") setMode("chat");
  else openDashboard();
});
document.querySelector("#lockConcept")?.addEventListener("click", openDashboard);
document.querySelector("#attachFile")?.addEventListener("click", () => fileInput.click());
addMenuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setAddMenu(addMenu?.hidden !== false);
});
addMenu?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-action]");
  if (!button) return;
  handleAddAction(button.dataset.addAction);
});
fileInput.addEventListener("change", () => {
  handleFileImport(fileInput.files);
  fileInput.value = "";
});
document.querySelector("#loadSourceFile")?.addEventListener("click", () => sourceFileInput?.click());
sourceFileInput?.addEventListener("change", () => {
  loadHtmlSourceFile(sourceFileInput.files && sourceFileInput.files[0]);
  sourceFileInput.value = "";
});
document.querySelector("#loadSourceUrl")?.addEventListener("click", loadHtmlSourceUrl);
sourceUrl?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadHtmlSourceUrl();
});
document.querySelector("#composerLoadSourceUrl")?.addEventListener("click", () => loadHtmlSourceUrl(composerSourceUrl?.value));
composerSourceUrl?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadHtmlSourceUrl(composerSourceUrl.value);
  if (event.key === "Escape" && composerSourceBar) composerSourceBar.hidden = true;
});
document.querySelector("#emphasisProtocol")?.addEventListener("change", () => {
  selectedEmphasis = new Set();
  renderEmphasisList();
});
document.querySelector("#realityTilt")?.addEventListener("input", renderEmphasisList);
document.querySelector("#emphasisList")?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-emphasis]");
  if (!chip) return;
  const value = chip.dataset.emphasis;
  if (selectedEmphasis.has(value)) selectedEmphasis.delete(value);
  else selectedEmphasis.add(value);
  renderEmphasisList();
});
document.addEventListener("click", (event) => {
  if (addMenu && !addMenu.hidden && !event.target.closest(".composer-action-wrap")) {
    setAddMenu(false);
  }
  const remove = event.target.closest("[data-remove-attachment]");
  if (remove) {
    pendingAttachments.splice(Number(remove.dataset.removeAttachment), 1);
    renderPendingAttachments();
    return;
  }
  const removeSource = event.target.closest("[data-remove-source]");
  if (removeSource) {
    activeSources.splice(Number(removeSource.dataset.removeSource), 1);
    renderSources();
  }

  const layerButton = event.target.closest("[data-layer]");
  if (layerButton && dashboardSpec) {
    document.querySelectorAll("[data-layer]").forEach((button) => button.classList.remove("active"));
    layerButton.classList.add("active");
    const layer = dashboardSpec.layers[layerButton.dataset.layer];
    const readout = document.querySelector("#dashLayerReadout");
    if (layer && readout) {
      readout.innerHTML = `<h3>${escapeHtml(layer.label)}</h3><p>${escapeHtml(layer.headline)}</p><ul>${layer.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>`;
    }
  }

  if (event.target.closest("[data-dashboard-add-source]")) {
    setMode("chat");
    settingsPanel.classList.add("open");
    if (composerSourceBar) composerSourceBar.hidden = false;
    composerSourceUrl?.focus();
  }

  if (event.target.closest("#dashboardGenerateImage")) {
    setMode("chat");
    generateImage(dashboardSpec ? `${dashboardSpec.title}\n\n${dashboardSpec.layers.game.headline}\n${dashboardSpec.layers.myth.headline}\n${dashboardSpec.layers.material.headline}` : "");
  }

  if (event.target.closest("#dashboardBackToChat")) {
    setMode("chat");
  }
});
document.querySelector("#voiceInput")?.addEventListener("click", toggleVoiceInput);
document.querySelector("#renderDiagram")?.addEventListener("click", renderDiagram);
document.querySelector("#diagramType")?.addEventListener("change", renderDiagram);
document.querySelector("#saveProject")?.addEventListener("click", saveChat);
document.querySelector("#loadProject")?.addEventListener("click", loadChat);
document.querySelector("#syncProtocols")?.addEventListener("click", syncProtocols);
document.querySelector("#exportMarkdown")?.addEventListener("click", exportMarkdown);
document.querySelector("#exportSvg")?.addEventListener("click", exportSvg);
document.querySelector("#generateImage")?.addEventListener("click", generateImage);
document.querySelector("#quickImage")?.addEventListener("click", generateImage);
renderCards();
renderTemplates();
renderIcons();
renderEmphasisList();
renderSources();
checkServerHealth();
