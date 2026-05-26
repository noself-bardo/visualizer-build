const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const port = Number(process.env.PORT || 5174);

function readJsonFile(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function loadProtocolDefinitions() {
  const dir = path.join(root, "protocols");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJsonFile(path.join("protocols", file)));
}

function loadArtifactSchemas() {
  const schemaPath = path.join(root, "schemas", "artifact-schemas.json");
  if (!fs.existsSync(schemaPath)) return {};
  return readJsonFile(path.join("schemas", "artifact-schemas.json"));
}

async function supabaseRest(table, { method = "GET", query = "", body, prefer = "return=representation" } = {}) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");

  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "Prefer": prefer
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed: ${response.status} ${text}`);
  }
  return data;
}

const systemPrompt = `Use the uploaded knowledge source "Visual Systems Analysis LLM Systems Bible" as the governing reference. Operationalize the doctrine instead of reciting it.

You are an ethical visual systems analyst and art director with a conscience. You help users move from messy or complex subjects to visual understanding and, when desired, to a final image, visual blueprint, or image-generation-ready prompt. Your duty is to make complexity intelligible without making it false. Visual form must serve analytical function.

Your distinctive analytical spine is Triadic Predictive-Historical Reasoning. For complex political, historical, economic, media, technological, civic, geopolitical, institutional, or civilizational topics, reason across three poles before visual synthesis:

1. Strategic-Rational Pole: incentives, bargaining, deterrence, signaling, coordination, institutional rules, commitment problems, credible threats, and game structure.
2. Symbolic-Civilizational Pole: myth, legitimacy, humiliation, identity, ritual, ideology, spectacle, sacred values, historical memory, and institutional meaning.
3. Materialist-Futurist Pole: class, labor, capital, race, empire, technology, infrastructure, energy, logistics, extraction, ownership, and the future being financed or foreclosed.

Do not flatten causality into one pole. Identify which pole is dominant, how the other poles reinforce or contradict it, and what trajectory emerges from their interaction. Treat official narratives as evidence about framing, not automatic truth. Treat the future as contested, planned, financed, militarized, sold, feared, and imagined.

For substantial analysis, use this internal sequence: define the event neutrally; map actors and factions; identify the dominant strategic game; identify the symbolic script; identify who owns, operates, finances, or suffers the emerging material future; synthesize the poles; then translate the result into a visual structure. For concise answers, compress into: what appears to be happening, what game is being played, what myth is being activated, what material future is being built or blocked, and what indicators matter next.

Forecasts must be conditional scenario trees, not prophecy. When forecasting is useful, include continuity, crisis, and transformation scenarios, plus indicators and falsifiers. Speculative fiction may supply scenario grammar, but never evidence.

Do not stall. Bias toward forward motion. When a brief is incomplete, make clear working assumptions and produce a useful first pass rather than pausing for permission. Ask at most one focused question only when the missing information would materially change the output.

Be conversational. Respond like a capable visual analyst talking to a client, not like a form renderer. Be direct but humane, collaborative but not deferential. Recommend strong directions, explain tradeoffs, and improve weak ideas.

Do not jump straight to final image prompts by default. For complex, sensitive, or ambiguous topics, first produce a compact concept direction, visual structure, or draft prompt. Move to final image generation only when the user asks directly, approves the direction, or says "lock this concept."

Never fabricate facts, sources, citations, statistics, quotes, maps, documents, institutions, causal links, historical precedents, or current information. Separate fact, user-provided claim, sourced claim, inference, analogy, interpretation, speculation, symbolism, unknowns, and contested points when it matters. Treat uncertainty as a design feature.

For current or changeable facts, say they need current verification unless sources are provided or browsing/current verification is available. When using user-provided material, distinguish what the material says from what you infer.

Before major visual outputs, internally check evidence strength, visual integrity, power and incentives, possible harm, propaganda or manipulation risk, historical analogy quality, uncertainty, civic accountability, human dignity, and dissenting interpretations.

Choose density by purpose, audience, evidence, and risk: Minimalist for precision and high-stakes clarity; Moderate for clear multi-actor explanation; Hybrid for power, ideology, media, empire, political economy, or structure plus symbolism; Maximalist when exploratory, satirical, allegorical, historically layered, or explicitly requested; Layered Multi-Format when one visual cannot carry the analysis responsibly.

Analyze systems through actors, incentives, institutions, material interests, narratives, history, feedback loops, technology, symbolic frames, and plausible scenarios. Ask who benefits, who pays, who decides, who is excluded, what is visible, what is hidden, what alternatives are marginalized, and what evidence would change the model.

For political, civic, historical, or sensitive image prompts, include guardrails: interpretive, symbolic, not documentary evidence; no fabricated documents, maps, headlines, seals, or evidence; no misleading depictions of real people; preserve human dignity.

If the user wants maximalist mural ideation, use black-and-white hand-drawn ink line art, obsessive crosshatching, tiny hidden scenes, arrows, labels, fake advertisements, symbolic architecture, bureaucratic absurdity, grotesque luxury imagery, anthropomorphic institutions, propaganda posters, diagrams, graffiti, and marginalia. Avoid minimalism, empty space, clean corporate aesthetics, flat vector graphics, sterile infographics, and oversimplified messaging.

Operate by: truth before beauty, clarity before spectacle, dignity before satire, evidence before inference, uncertainty before false certainty, structure before narrative, and human judgment before machine authority.`;

const phaseInstructions = {
  phase1: `Produce Phase 1 only. Use clear headings:
Concept Title
Core Read
Triadic Spine
Strategic-Rational Layer
Symbolic-Civilizational Layer
Materialist-Futurist Layer
Cross-Pole Contradiction
Visible Themes
Hidden Structures
Institutions and Power Relationships
Class Dynamics
Contradictions to Visualize
Central Metaphor Options
Symbolic Visual Ecosystem
Character Archetypes
Fake Ads and Typography
Historical Echoes
Recurring Motifs
Micro-Scenes
Composition Direction
Steering Questions

End with one strong recommended direction and tell the user they can revise, intensify, or lock the concept. Do not write the final image prompt unless the user explicitly requested it.`,
  phase2: `The concept is locked. Produce Phase 2. Return:
1. Continuous Cinematic Image Prompt
2. Structured Mural Blueprint

The blueprint must include core composition, triadic logic, major symbolic systems, character archetypes, institutional personifications, motifs, hidden micro-scenes, typography and fake signage, environmental storytelling, contradictions, historical references, texture and density, rendering directives, and ethical guardrail.`
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".cmd": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function extractResponseText(data) {
  if (data.output_text && data.output_text.trim()) return data.output_text.trim();
  const pieces = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) pieces.push(content.text);
      if (content.type === "text" && content.text) pieces.push(content.text);
      if (typeof content === "string") pieces.push(content);
    }
  }
  return pieces.join("\n").trim();
}

function openAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5.5";
}

function responseBody(body, { temperature } = {}) {
  const model = body.model || openAIModel();
  const next = { ...body, model };
  if (!/^gpt-5/i.test(model) && temperature !== undefined) {
    next.temperature = temperature;
  }
  return next;
}

function latestUserText(messages) {
  const last = [...messages].reverse().find((message) => message.role !== "assistant" && message.content);
  return last ? String(last.content) : "";
}

function sourceContext(sources = [], maxChars = 120000) {
  return sources.slice(0, 5).map((source, index) => [
    `Source ${index + 1}: ${source.title || source.url || source.name || "HTML source"}`,
    source.url ? `URL: ${source.url}` : "",
    source.excerpt ? `Extracted text:\n${String(source.excerpt).slice(0, maxChars)}` : ""
  ].filter(Boolean).join("\n")).join("\n\n");
}

function assertPublicHttpUrl(value) {
  const parsed = new URL(String(value || ""));
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs can be loaded.");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("127.") ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    throw new Error("For safety, URL source loading only accepts public web URLs.");
  }
  return parsed;
}

function steeringInstruction(steering = {}) {
  const protocol = String(steering.reasoningProtocol || "Auto triadic reasoning");
  const emphasisProtocol = String(steering.emphasisProtocol || "auto");
  const emphasis = Array.isArray(steering.emphasis) ? steering.emphasis.filter(Boolean).join(", ") : "";
  const realityTilt = Number.isFinite(Number(steering.realityTilt)) ? Number(steering.realityTilt) : 1;
  const tiltInstructions = [
    "Keep outputs documentary and grounded. Prefer literal visual evidence, careful labels, and minimal metaphor.",
    "Use grounded symbolism. Keep visual metaphors anchored to explicit claims, source material, and clearly marked inference.",
    "Use sharp allegory. Allow stronger symbolic compression while preserving clear analytical accountability.",
    "Use satirical surrealism. Make institutions, incentives, and contradictions visually strange, but keep factual claims disciplined.",
    "Use maximal absurdity for visual invention. Push grotesque allegory, fake signage, institutional personification, and dense micro-scenes while clearly separating symbolism from evidence."
  ];
  const emphasisInstruction = `\n\nEmphasis steering:
- Protocol: ${emphasisProtocol}
- Selected emphasis: ${emphasis || "auto-select what matters from the topic and sources"}
- Reality tilt ${realityTilt}/4: ${tiltInstructions[realityTilt] || tiltInstructions[1]}
Let these settings shape what you foreground, what you compress, and how literal versus surreal the visual translation becomes. Do not let high tilt weaken evidence discipline; label symbolic invention as symbolic.`;

  if (/triadic deep/i.test(protocol)) {
    return `${emphasisInstruction}\n\nUse a deep triadic read. Include clear sections for Event Definition, Surface Narrative, Strategic-Rational Layer, Symbolic-Civilizational Layer, Materialist-Futurist Layer, Cross-Pole Synthesis, Visual Translation, Uncertainty, and Strong Direction.`;
  }
  if (/short-form triadic/i.test(protocol)) {
    return `${emphasisInstruction}\n\nUse the short-form triadic read: what appears to be happening, what game is being played, what myth is being activated, what material future is being built or blocked, and what indicators matter next. Then give a compact visual direction.`;
  }
  if (/visual concept only/i.test(protocol)) {
    return `${emphasisInstruction}\n\nKeep the triadic reasoning mostly internal. Output a concise visual concept direction with only the triadic logic that materially improves the concept.`;
  }
  if (/final prompt/i.test(protocol)) {
    return `${emphasisInstruction}\n\nThe user wants final prompt mode. Produce a polished image-generation-ready visual prompt plus brief guardrails. Keep analysis minimal unless needed for safety or clarity.`;
  }
  return `${emphasisInstruction}\n\nDefault to triadic reasoning for substantial topics, but keep the response conversational and avoid unnecessary template bloat.`;
}

function imageRenderConstraints(steering = {}) {
  const tilt = Number.isFinite(Number(steering.realityTilt)) ? Number(steering.realityTilt) : 1;
  const constraints = [
    "Final rendering constraints: grounded visual analysis, documentary restraint, clear spatial hierarchy, careful labels only where useful, minimal metaphor, no fabricated documentary evidence.",
    "Final rendering constraints: grounded symbolic visual analysis, coherent eye-flow, restrained metaphor, clear labels, evidence-aware composition, no fabricated documentary evidence.",
    "Final rendering constraints: sharp allegorical visual system, readable symbolic zones, dense but coherent details, labels and arrows where useful, source-grounded inventions clearly symbolic.",
    "Final rendering constraints: satirical surreal visual system, exaggerated institutional forms, dense micro-scenes, fake signage, arrows, labels, symbolic architecture, coherent eye-flow, no fabricated documentary evidence.",
    "Final rendering constraints: maximal absurd allegorical mural, black-and-white hand-drawn ink, obsessive crosshatching, underground zine energy, grotesque institutional personification, fake advertisements, tiny readable micro-scenes, no empty space, coherent eye-flow. This is interpretive symbolic commentary, not documentary evidence."
  ];
  return constraints[tilt] || constraints[1];
}

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL.");
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

async function uploadToSupabase({ dataUrl, filename, contentType }) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "visual-systems-assets";
  if (!url || !anonKey) return null;

  const parsed = dataUrlToBuffer(dataUrl);
  const type = contentType || parsed.mimeType;
  const safeName = filename.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const objectPath = `generated/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeName}`;

  const response = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
      "Content-Type": type,
      "x-upsert": "false"
    },
    body: parsed.buffer
  });

  const detail = await response.text();
  if (!response.ok) {
    return { ok: false, status: response.status, detail };
  }

  return { ok: true, bucket, path: objectPath, contentType: type };
}

async function refineImagePrompt({ prompt, messages, sources, steering }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const recent = (messages || []).slice(-6).map((message) => `${message.role}: ${message.content || ""}`).join("\n\n");
  const loadedSourceText = sourceContext(Array.isArray(sources) ? sources : [], 24000);
  const steeringText = steering ? steeringInstruction(steering) : "";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(responseBody({
      model: openAIModel(),
      instructions: `${systemPrompt}${steeringText}

You are preparing an image-generation prompt. Output only the final image prompt, no explanation. First silently extract the triadic spine: strategic game, symbolic script, material future, and cross-pole contradiction. Then convert that logic into visual form. Make it vivid, specific, coherent, and optimized for a dense black-and-white maximalist doodle mural when appropriate. Include composition, visual zones, key symbols, style, density, and safety guardrails. Do not include markdown headings.`,
      input: `User/requested prompt:\n${prompt}\n\nLoaded sources:\n${loadedSourceText || "None"}\n\nRecent conversation:\n${recent}`,
      max_output_tokens: 850
    }, { temperature: 0.7 }))
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Prompt refinement failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return extractResponseText(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function callOpenAI(payload, phase) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in .env");
  }

  const source = [
    `Subject: ${payload.subject || "Untitled mural concept"}`,
    `Emotional weather: ${payload.emotion || "Manic analytical energy"}`,
    `Satire level: ${payload.satire || "Sharp but nuanced"}`,
    `Creative steering: ${JSON.stringify(payload.steering || {})}`,
    payload.phase1Text ? `Prior Phase 1 concept:\n${payload.phase1Text}` : "",
    `Source material:\n${payload.material || ""}`
  ].filter(Boolean).join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(responseBody({
      model: openAIModel(),
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${phaseInstructions[phase]}\n\n${source}` }
      ],
      max_output_tokens: phase === "phase2" ? 2600 : 1900
    }, { temperature: 0.9 }))
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = extractResponseText(data);
  if (!text) {
    throw new Error(`OpenAI returned no text. Response status: ${data.status || "unknown"}`);
  }
  return text;
}

async function handleApi(req, res, phase) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const text = await callOpenAI(payload, phase);
    sendJson(res, 200, { text });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleChat(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env");

    const steering = payload.steering ? `\n\nCurrent optional steering preferences: ${JSON.stringify(payload.steering)}${steeringInstruction(payload.steering)}` : steeringInstruction({});
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const sources = Array.isArray(payload.sources) ? payload.sources : [];
    const loadedSourceText = sourceContext(sources);
    const input = messages.map((message) => {
      const role = message.role === "assistant" ? "assistant" : "user";
      const text = String(message.content || "");
      const attachments = Array.isArray(message.attachments) ? message.attachments : [];

      if (role === "assistant" || !attachments.length) {
        return { role, content: text };
      }

      const content = [{ type: "input_text", text }];
      for (const attachment of attachments) {
        if (attachment.kind === "image" && attachment.dataUrl) {
          content.push({ type: "input_image", image_url: attachment.dataUrl, detail: "auto" });
        } else if (attachment.kind === "text" && attachment.text) {
          content.push({ type: "input_text", text: `\n\nAttached text file: ${attachment.name}\n${attachment.text}` });
        } else if (attachment.kind === "file" && attachment.dataUrl) {
          content.push({ type: "input_file", filename: attachment.name, file_data: attachment.dataUrl });
        }
      }
      return { role, content };
    });

    if (loadedSourceText) {
      input.unshift({
        role: "user",
        content: [{ type: "input_text", text: `Loaded source material. Treat this as user-provided source text, not verified fact. Distinguish source claims from your inferences.\n\n${loadedSourceText}` }]
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(responseBody({
        model: openAIModel(),
        instructions: `${systemPrompt}${steering}`,
        input,
        max_output_tokens: 2400
      }, { temperature: 0.8 }))
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = extractResponseText(data);
    if (!text) {
      sendJson(res, 500, { error: `OpenAI returned no text. Response status: ${data.status || "unknown"}` });
      return;
    }
    sendJson(res, 200, { text });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleImage(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env");

    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const sources = Array.isArray(payload.sources) ? payload.sources : [];
    const steering = payload.steering && typeof payload.steering === "object" ? payload.steering : {};
    const prompt = String(payload.prompt || latestUserText(messages) || "").trim();
    if (!prompt) throw new Error("No image prompt was provided.");

    const refinedPrompt = await refineImagePrompt({ prompt, messages, sources, steering });
    const guardedPrompt = `${refinedPrompt}

${imageRenderConstraints(steering)}`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
        prompt: guardedPrompt,
        size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
        quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
        output_format: "png",
        n: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI image request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const image = data.data && data.data[0];
    const b64 = image && (image.b64_json || image.base64);
    if (!b64) throw new Error("OpenAI returned no image data.");

    const dataUrl = `data:image/png;base64,${b64}`;
    const storage = await uploadToSupabase({
      dataUrl,
      filename: "visual-systems-image.png",
      contentType: "image/png"
    });

    sendJson(res, 200, {
      image: dataUrl,
      revisedPrompt: image.revised_prompt || refinedPrompt,
      storage
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleSupabaseHealth(req, res) {
  try {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const projectRef = process.env.SUPABASE_PROJECT_REF;
    if (!url || !anonKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
    }

    const response = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });

    sendJson(res, response.ok ? 200 : 500, {
      ok: response.ok,
      status: response.status,
      projectRef: projectRef || "",
      url
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleSupabaseStorageHealth(req, res) {
  try {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const bucket = process.env.SUPABASE_BUCKET || "visual-systems-assets";
    if (!url || !anonKey) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");

    const response = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
      method: "GET",
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });

    const body = await response.text();
    sendJson(res, response.ok ? 200 : 500, {
      ok: response.ok,
      status: response.status,
      bucket,
      detail: body ? body.slice(0, 500) : ""
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleUpload(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    if (!payload.dataUrl || !payload.filename) throw new Error("Missing dataUrl or filename.");
    const storage = await uploadToSupabase({
      dataUrl: payload.dataUrl,
      filename: payload.filename,
      contentType: payload.contentType
    });
    if (!storage) throw new Error("Supabase is not configured.");
    sendJson(res, storage.ok ? 200 : 500, storage);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleFetchHtmlSource(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const parsedUrl = assertPublicHttpUrl(payload.url);
    let requestUrl = parsedUrl.href;
    let response;
    for (let redirects = 0; redirects < 5; redirects += 1) {
      assertPublicHttpUrl(requestUrl);
      response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Accept": "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
          "User-Agent": "VisualSystemsWorkbench/1.0"
        },
        redirect: "manual"
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) break;
      requestUrl = new URL(location, requestUrl).href;
    }
    assertPublicHttpUrl(response.url || requestUrl);

    if (!response.ok) {
      throw new Error(`HTML source request failed: ${response.status}`);
    }

    const type = response.headers.get("content-type") || "";
    if (type && !/html|text\/plain|xml/i.test(type)) {
      throw new Error(`That URL did not return HTML or text. Content type: ${type}`);
    }

    const html = await response.text();
    if (html.length > 2_000_000) {
      throw new Error("That HTML source is over 2 MB. Save a smaller HTML export and load it as a file.");
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim().slice(0, 160) : "";
    sendJson(res, 200, { ok: true, url: response.url || parsedUrl.href, title, html });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleSaveSource(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const title = String(payload.title || payload.name || payload.url || "HTML source").slice(0, 160);
    const extractedText = String(payload.excerpt || "").slice(0, 120000);
    if (!extractedText) throw new Error("No source text was provided.");

    const [project] = await supabaseRest("projects", {
      method: "POST",
      body: [{ title: `Source: ${title}`.slice(0, 120), description: "HTML source imported from the local Visual Systems Analyst app." }]
    });

    const [source] = await supabaseRest("sources", {
      method: "POST",
      body: [{
        project_id: project.id,
        title,
        source_type: String(payload.sourceType || "html"),
        mime_type: String(payload.mimeType || "text/html"),
        size_bytes: Number(payload.size || extractedText.length),
        extracted_text: extractedText,
        metadata: {
          name: payload.name || "",
          url: payload.url || "",
          ...(payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {})
        }
      }]
    });

    sendJson(res, 200, { ok: true, project, source });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleProtocols(req, res) {
  try {
    sendJson(res, 200, { protocols: loadProtocolDefinitions() });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleSchemas(req, res) {
  try {
    sendJson(res, 200, { schemas: loadArtifactSchemas() });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleSyncProtocols(req, res) {
  try {
    const definitions = loadProtocolDefinitions();
    const protocols = definitions.map((definition) => ({
      id: definition.id,
      name: definition.name,
      description: definition.description || ""
    }));

    const protocolRows = await supabaseRest("protocols", {
      method: "POST",
      query: "?on_conflict=id",
      body: protocols,
      prefer: "resolution=merge-duplicates,return=representation"
    });

    const versions = definitions.map((definition) => ({
      protocol_id: definition.id,
      version: definition.version,
      definition,
      is_active: true
    }));

    const versionRows = await supabaseRest("protocol_versions", {
      method: "POST",
      query: "?on_conflict=protocol_id,version",
      body: versions,
      prefer: "resolution=merge-duplicates,return=representation"
    });

    sendJson(res, 200, { ok: true, protocols: protocolRows, protocol_versions: versionRows });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handlePersistChat(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const sources = Array.isArray(payload.sources) ? payload.sources : [];
    const title = String(payload.title || "Visual Systems Chat").slice(0, 120);

    const [project] = await supabaseRest("projects", {
      method: "POST",
      body: [{ title, description: "Saved from the local Visual Systems Analyst app." }]
    });

    const [conversation] = await supabaseRest("conversations", {
      method: "POST",
      body: [{ project_id: project.id, title }]
    });

    if (messages.length) {
      await supabaseRest("messages", {
        method: "POST",
        body: messages.map((message) => ({
          conversation_id: conversation.id,
          role: message.role === "assistant" ? "assistant" : "user",
          content: String(message.content || ""),
          metadata: { attachments: (message.attachments || []).map((attachment) => ({
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            kind: attachment.kind
          })) }
        }))
      });
    }

    if (sources.length) {
      await supabaseRest("sources", {
        method: "POST",
        body: sources.slice(0, 5).map((source) => ({
          project_id: project.id,
          title: String(source.title || source.name || source.url || "HTML source").slice(0, 160),
          source_type: String(source.sourceType || "html"),
          mime_type: String(source.mimeType || "text/html"),
          size_bytes: Number(source.size || String(source.excerpt || "").length),
          extracted_text: String(source.excerpt || "").slice(0, 120000),
          metadata: {
            name: source.name || "",
            url: source.url || "",
            ...(source.metadata && typeof source.metadata === "object" ? source.metadata : {})
          }
        }))
      });
    }

    sendJson(res, 200, { ok: true, project, conversation });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleLatestChat(req, res) {
  try {
    const conversations = await supabaseRest("conversations", {
      query: "?select=*&order=created_at.desc&limit=1"
    });
    const conversation = conversations && conversations[0];
    if (!conversation) {
      sendJson(res, 200, { ok: true, project: null, conversation: null, messages: [], sources: [] });
      return;
    }

    const projects = await supabaseRest("projects", {
      query: `?select=*&id=eq.${conversation.project_id}&limit=1`
    });
    const project = projects && projects[0];
    if (!project) {
      sendJson(res, 200, { ok: true, project: null, conversation, messages: [], sources: [] });
      return;
    }

    const rows = await supabaseRest("messages", {
      query: `?select=*&conversation_id=eq.${conversation.id}&order=created_at.asc`
    });
    const sourceRows = await supabaseRest("sources", {
      query: `?select=*&project_id=eq.${project.id}&order=created_at.asc`
    });

    sendJson(res, 200, {
      ok: true,
      project,
      conversation,
      sources: sourceRows.map((row) => ({
        id: row.id,
        title: row.title,
        name: row.metadata && row.metadata.name ? row.metadata.name : "",
        url: row.metadata && row.metadata.url ? row.metadata.url : "",
        sourceType: row.source_type,
        mimeType: row.mime_type,
        size: row.size_bytes,
        excerpt: row.extracted_text || "",
        metadata: row.metadata || {}
      })),
      messages: rows.map((row) => ({
        role: row.role,
        content: row.content,
        attachments: row.metadata && row.metadata.attachments ? row.metadata.attachments : []
      }))
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleStructuredArtifact(req, res) {
  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env");

    const artifactType = String(payload.artifactType || "triadic_analysis");
    const schemas = loadArtifactSchemas();
    const schema = schemas[artifactType];
    if (!schema) throw new Error(`Unknown artifact schema: ${artifactType}`);

    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const source = [
      `Requested artifact type: ${artifactType}`,
      `User prompt: ${payload.prompt || latestUserText(messages) || ""}`,
      `Conversation:\n${messages.map((message) => `${message.role}: ${message.content || ""}`).join("\n\n")}`
    ].join("\n\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(responseBody({
        model: openAIModel(),
        instructions: `${systemPrompt}

Return a typed artifact that obeys the supplied JSON Schema. Do not include markdown. Do not invent facts. Use uncertainty fields when needed.`,
        input: source,
        text: {
          format: {
            type: "json_schema",
            name: artifactType,
            schema,
            strict: true
          }
        },
        max_output_tokens: 2400
      }, { temperature: 0.5 }))
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI structured artifact request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = extractResponseText(data);
    const artifact = JSON.parse(text);
    sendJson(res, 200, { ok: true, artifact, response_id: data.id || "" });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

function serveFile(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const safePath = path.normalize(requestPath === "/" ? "/index.html" : requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && req.url === "/api/phase1") {
    handleApi(req, res, "phase1");
    return;
  }

  if (req.method === "POST" && req.url === "/api/phase2") {
    handleApi(req, res, "phase2");
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    handleChat(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/image") {
    handleImage(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/supabase/health") {
    handleSupabaseHealth(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/supabase/storage-health") {
    handleSupabaseStorageHealth(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/protocols") {
    handleProtocols(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/schemas") {
    handleSchemas(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/protocols/sync") {
    handleSyncProtocols(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/persist/chat") {
    handlePersistChat(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/persist/latest") {
    handleLatestChat(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/artifacts/structured") {
    handleStructuredArtifact(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/supabase/upload") {
    handleUpload(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/sources/fetch-html") {
    handleFetchHtmlSource(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/sources") {
    handleSaveSource(req, res);
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  serveFile(req, res);
});

server.on("error", (error) => {
  console.error("Server error:", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Maximalist Mural Ideation Engine running at http://127.0.0.1:${port}`);
});
