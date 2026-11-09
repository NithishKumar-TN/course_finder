import { generateWithGranite } from "./graniteService.js";
import { AVAILABLE_TRACKS, buildRoadmap } from "../data/courses.js";
import { getSession, updateSession, appendMessage } from "./dbSessionService.js";
import { getDB } from "../db/database.js";

/**
 * Core agentic conversation loop.
 * Each stage handler returns { response, nextStage, updatedProfile, roadmap? }.
 * If the student goes off-topic the bot acknowledges their message AND
 * re-asks the pending question — it never advances without the answer.
 */
export async function processAgentMessage(sessionId, userMessage) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  appendMessage(sessionId, "user", userMessage);

  const { stage, studentProfile, conversationHistory } = session;
  let response = "";
  let nextStage = stage;
  let updatedProfile = { ...studentProfile };
  let roadmap = session.roadmap;

  switch (stage) {
    case "greeting":
      ({ response, nextStage, updatedProfile } = await handleGreeting(userMessage, studentProfile));
      break;
    case "interest_assessment":
      ({ response, nextStage, updatedProfile } = await handleInterestAssessment(userMessage, studentProfile));
      break;
    case "skill_assessment":
      ({ response, nextStage, updatedProfile } = await handleSkillAssessment(userMessage, studentProfile));
      break;
    case "goal_collection":
      ({ response, nextStage, updatedProfile } = await handleGoalCollection(userMessage, studentProfile));
      break;
    case "roadmap_generated":
    case "in_progress":
      ({ response, nextStage, updatedProfile, roadmap } = await handleOngoing(
        userMessage, studentProfile, session.roadmap, conversationHistory
      ));
      break;
    default:
      response = "Hi! I'm LearnMate. What would you like to learn today?";
  }

  if (nextStage === "roadmap_generated" && !roadmap && updatedProfile.interests.length > 0) {
    roadmap = buildRoadmap(updatedProfile);
  }

  updateSession(sessionId, { stage: nextStage, studentProfile: updatedProfile, roadmap });
  appendMessage(sessionId, "assistant", response);

  // ── Sync profile to student_profiles table so dashboard reflects reality ──
  if (nextStage === "roadmap_generated" || nextStage === "in_progress") {
    try {
      const db = getDB();
      const row = db.prepare("SELECT user_id FROM sessions WHERE id = ?").get(sessionId);
      if (row) {
        db.prepare(`
          INSERT INTO student_profiles (user_id, learning_tracks, skill_level, learning_goal, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(user_id) DO UPDATE SET
            learning_tracks = excluded.learning_tracks,
            skill_level     = excluded.skill_level,
            learning_goal   = CASE WHEN excluded.learning_goal IS NOT NULL THEN excluded.learning_goal ELSE learning_goal END,
            updated_at      = datetime('now')
        `).run(
          row.user_id,
          JSON.stringify(updatedProfile.interests || []),
          updatedProfile.skillLevel || null,
          updatedProfile.goals?.[0] || null
        );
      }
    } catch (_) { /* non-fatal */ }
  }

  return { message: response, stage: nextStage, studentProfile: updatedProfile, roadmap };
}

// ─── Pending questions (one per stage) ───────────────────────────────────────
// These are appended whenever the student hasn't answered the required question.

const PENDING_QUESTIONS = {
  greeting: "What's your name?",
  interest_assessment: (name) =>
    `Which area would you like to learn?\n\n${AVAILABLE_TRACKS.map((t, i) => `**${i + 1}.** ${t}`).join("\n")}`,
  skill_assessment: (interests) =>
    `What is your current skill level in **${interests}**?\n\n**1.** Beginner — just starting out\n**2.** Intermediate — know the basics\n**3.** Advanced — already experienced`,
  goal_collection: () =>
    `What is your main goal?\n\n**1.** Get a job in this field\n**2.** Build my own projects\n**3.** Upskill for career growth`,
};

/**
 * Build a reply that acknowledges whatever the student said, then re-asks
 * the pending question for this stage — using IBM Granite for a natural feel.
 */
async function reAskWithContext(userMessage, pendingQuestion, studentName) {
  const system = `You are LearnMate, a friendly AI learning coach.
The student said something that didn't answer your question.
Your job:
1. Acknowledge what they said in ONE short natural sentence (be warm, not robotic).
2. Then immediately ask the pending question again — copy it word for word after your acknowledgement.
Do NOT skip the question. Do NOT answer it yourself.`;

  const user = `Student said: "${userMessage}"
${studentName ? `Their name is ${studentName}.` : ""}
Pending question to re-ask: "${pendingQuestion}"`;

  const raw = await generateWithGranite(system, user, { max_new_tokens: 150, temperature: 0.7 });
  return raw || `Got it! But let me ask again — ${pendingQuestion}`;
}

/**
 * Silent extractor — ask Granite to pull a specific value from a message.
 * Returns null when the value is not present.
 */
async function extract(task, userMessage) {
  const system = `You are a silent data extractor.
Output ONLY the extracted value — no explanation, no extra words.
If the value is not present in the message, output exactly: none`;

  const raw = await generateWithGranite(system, `Task: ${task}\nMessage: "${userMessage}"`, {
    max_new_tokens: 30,
    temperature: 0.1,
  });
  const result = raw.trim().toLowerCase();
  return result === "none" || result === "" ? null : raw.trim();
}

// ─── Stage Handlers ───────────────────────────────────────────────────────────

async function handleGreeting(userMessage, profile) {
  const extractedName = await extract(
    "Extract the person's first name only (e.g. 'Alex'). If no name is mentioned, output: none",
    userMessage
  );
  const name = extractedName || profile.name;

  if (!name) {
    // No name detected — acknowledge + re-ask
    const response = await reAskWithContext(
      userMessage,
      PENDING_QUESTIONS.greeting,
      null
    );
    return { response, nextStage: "greeting", updatedProfile: profile };
  }

  // Name captured — greet and show track list
  const tracksFormatted = AVAILABLE_TRACKS.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const system = `You are LearnMate, a friendly AI learning coach.
The student's name is ${name}. Greet them by name in ONE warm sentence.
Then show this exact numbered list and ask which track interests them:

${tracksFormatted}

Keep total reply under 8 lines.`;

  const response = await generateWithGranite(
    system,
    `Student said: "${userMessage}". Their name is ${name}.`,
    { max_new_tokens: 200 }
  );

  return {
    response: response || `Nice to meet you, **${name}**! 🎉\n\nWhich area would you like to learn?\n\n${AVAILABLE_TRACKS.map((t, i) => `**${i + 1}.** ${t}`).join("\n")}`,
    nextStage: "interest_assessment",
    updatedProfile: { ...profile, name },
  };
}

async function handleInterestAssessment(userMessage, profile) {
  const tracksFormatted = AVAILABLE_TRACKS.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const numberMap = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5 };

  // 1. Granite extraction
  const extractedRaw = await extract(
    `Which of these tracks is the student choosing? Output ONLY the matching track name(s) separated by commas. Numbers map as: 1=Frontend Development, 2=Cybersecurity, 3=UI/UX Design, 4=Data Science, 5=Cloud Computing, 6=Backend Development.\nIf none match, output: none\nTracks:\n${tracksFormatted}`,
    userMessage
  );

  let detectedInterests = [];

  if (extractedRaw) {
    const parts = extractedRaw.split(",").map((s) => s.trim());
    detectedInterests = parts.flatMap((part) => {
      const byName = AVAILABLE_TRACKS.find(
        (t) =>
          t.toLowerCase().includes(part.toLowerCase()) ||
          part.toLowerCase().includes(t.toLowerCase().split(" ")[0])
      );
      const byNum = numberMap[part] !== undefined ? AVAILABLE_TRACKS[numberMap[part]] : null;
      return [byName, byNum].filter(Boolean);
    });
    detectedInterests = [...new Set(detectedInterests)];
  }

  // 2. Fallback: number or keyword scan
  if (detectedInterests.length === 0) {
    for (const [num, idx] of Object.entries(numberMap)) {
      if (new RegExp(`\\b${num}\\b`).test(userMessage)) {
        detectedInterests.push(AVAILABLE_TRACKS[idx]);
      }
    }
    const fromText = AVAILABLE_TRACKS.filter(
      (t) =>
        userMessage.toLowerCase().includes(t.toLowerCase()) ||
        userMessage.toLowerCase().includes(t.toLowerCase().split(" ")[0])
    );
    detectedInterests = [...new Set([...detectedInterests, ...fromText])];
  }

  if (detectedInterests.length === 0) {
    // Didn't get a track — acknowledge + re-ask
    const response = await reAskWithContext(
      userMessage,
      PENDING_QUESTIONS.interest_assessment(profile.name),
      profile.name
    );
    return { response, nextStage: "interest_assessment", updatedProfile: profile };
  }

  // Track detected — confirm + ask skill level
  const system = `You are LearnMate, an AI learning coach.
The student chose: ${detectedInterests.join(", ")}.
Confirm their choice in ONE enthusiastic sentence using their name if available: ${profile.name || "not given"}.
Then ask their skill level with exactly these options:

1. Beginner — just starting out
2. Intermediate — know the basics
3. Advanced — already experienced

Keep total reply under 5 lines.`;

  const response = await generateWithGranite(
    system,
    `Student said: "${userMessage}". They picked: ${detectedInterests.join(", ")}.`,
    { max_new_tokens: 160 }
  );

  return {
    response: response || `Great choice — **${detectedInterests.join(", ")}**! 🙌\n\nWhat's your current skill level?\n\n**1.** Beginner — just starting out\n**2.** Intermediate — know the basics\n**3.** Advanced — already experienced`,
    nextStage: "skill_assessment",
    updatedProfile: { ...profile, interests: detectedInterests },
  };
}

async function handleSkillAssessment(userMessage, profile) {
  // 1. Granite extraction
  const extractedLevel = await extract(
    "Identify the skill level. Output ONLY one word: beginner, intermediate, or advanced. Numbers: 1=beginner, 2=intermediate, 3=advanced. If not present, output: none",
    userMessage
  );

  const levelMap = { "1": "beginner", "2": "intermediate", "3": "advanced" };
  let skillLevel = null;

  if (extractedLevel) {
    const el = extractedLevel.toLowerCase().trim();
    skillLevel =
      levelMap[el] ||
      (["beginner", "intermediate", "advanced"].includes(el) ? el : null);
  }

  // 2. Fallback regex
  if (!skillLevel) {
    const msg = userMessage.toLowerCase();
    if (msg.match(/\b(beginner|newbie|new|start|never|no experience|zero|fresh)\b/) || msg.trim() === "1")
      skillLevel = "beginner";
    else if (msg.match(/\b(intermediate|some|basics|little|bit|familiar|okay|average)\b/) || msg.trim() === "2")
      skillLevel = "intermediate";
    else if (msg.match(/\b(advanced|expert|experienced|professional|senior|pro|strong)\b/) || msg.trim() === "3")
      skillLevel = "advanced";
  }

  if (!skillLevel) {
    // Didn't get a skill level — acknowledge + re-ask
    const response = await reAskWithContext(
      userMessage,
      PENDING_QUESTIONS.skill_assessment(profile.interests.join(" / ")),
      profile.name
    );
    return { response, nextStage: "skill_assessment", updatedProfile: profile };
  }

  // Skill captured — confirm + ask goal
  const system = `You are LearnMate, an AI learning coach.
The student is a ${skillLevel} in ${profile.interests.join(", ")}.
${profile.name ? `Their name is ${profile.name}.` : ""}
Confirm their skill level naturally in ONE sentence.
Then ask their main goal with exactly these options:

1. Get a job in this field
2. Build my own projects
3. Upskill for career growth

Keep total reply under 5 lines.`;

  const response = await generateWithGranite(
    system,
    `Student said: "${userMessage}". Detected skill level: ${skillLevel}.`,
    { max_new_tokens: 140 }
  );

  return {
    response: response || `Got it — **${skillLevel}**! 👍\n\nWhat's your main goal?\n\n**1.** Get a job in this field\n**2.** Build my own projects\n**3.** Upskill for career growth`,
    nextStage: "goal_collection",
    updatedProfile: { ...profile, skillLevel },
  };
}

async function handleGoalCollection(userMessage, profile) {
  // Check if it's just noise (too short / unrelated)
  const seemsOffTopic = userMessage.trim().split(" ").length <= 2 &&
    !userMessage.match(/job|work|project|build|upskill|career|learn|grow|develop|freelance|salary|hire/i);

  if (seemsOffTopic) {
    const response = await reAskWithContext(
      userMessage,
      PENDING_QUESTIONS.goal_collection(),
      profile.name
    );
    return { response, nextStage: "goal_collection", updatedProfile: profile };
  }

  // Any meaningful reply counts as a goal — confirm + announce roadmap
  const system = `You are LearnMate, an AI learning coach.
The student shared their goal. 
${profile.name ? `Their name is ${profile.name}.` : ""}
1. Acknowledge their goal in ONE personalized sentence that references their exact words.
2. Tell them their roadmap for ${profile.interests.join(", ")} is ready.
3. End with exactly: "Click the 🗺️ Roadmap tab to see your full path!"
Max 3 lines. Be enthusiastic.`;

  const response = await generateWithGranite(
    system,
    `Student's goal: "${userMessage}". Track: ${profile.interests.join(", ")}, Level: ${profile.skillLevel}.`,
    { max_new_tokens: 130 }
  );

  return {
    response: response || `Love that goal! 🎯 Your personalized **${profile.interests.join(" + ")}** roadmap is ready!\n\nClick the **🗺️ Roadmap** tab to see your full learning path!`,
    nextStage: "roadmap_generated",
    updatedProfile: { ...profile, goals: [userMessage] },
  };
}

async function handleOngoing(userMessage, profile, roadmap, history) {
  const recentHistory = history.slice(-8).map((m) => `${m.role}: ${m.content}`).join("\n");

  // Track addition detection
  const wantsNewTrack = AVAILABLE_TRACKS.find(
    (t) =>
      userMessage.toLowerCase().includes("add " + t.toLowerCase()) ||
      userMessage.toLowerCase().includes("include " + t.toLowerCase()) ||
      userMessage.toLowerCase().includes("also " + t.toLowerCase().split(" ")[0])
  );

  let updatedProfile = { ...profile };
  let updatedRoadmap = roadmap;

  if (wantsNewTrack && !profile.interests.includes(wantsNewTrack)) {
    updatedProfile.interests = [...profile.interests, wantsNewTrack];
    updatedRoadmap = buildRoadmap(updatedProfile);
  }

  const system = `You are LearnMate, a personal AI learning coach.
Student profile:
- Name: ${updatedProfile.name || "not given"}
- Learning tracks: ${updatedProfile.interests.join(", ")}
- Skill level: ${updatedProfile.skillLevel}
- Goals: ${updatedProfile.goals?.join(", ") || "not set"}

Conversation so far:
${recentHistory}

Rules:
- Read what the student JUST said and respond to it directly and specifically.
- If they asked a question → answer it clearly.
- If they shared progress → celebrate it and suggest the NEXT specific step.
- If they said something unrelated to learning → respond briefly and bring them back to their path.
- Use their name occasionally.
- Keep replies under 6 lines unless detail was requested.
- Never repeat something already said in the conversation history.`;

  const response = await generateWithGranite(
    system,
    `Student just said: "${userMessage}"`,
    { max_new_tokens: 400 }
  );

  return {
    response: response || "Tell me more — I'm here to help with your learning journey!",
    nextStage: "in_progress",
    updatedProfile,
    roadmap: updatedRoadmap,
  };
}
