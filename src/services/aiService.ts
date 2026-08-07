/**
 * CROWDOS Operations Intelligence Service
 * Interacts with Groq API when online; falls back to static scenarios when offline.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface MitigationBriefing {
  title: string;
  description: string;
  confidence: number;
  alternative: string;
  expectedImpact: string;
}

export const aiService = {
  /**
   * Request dynamic situation briefing from Decision Intelligence Console.
   */
  async getSituationBriefing(scenarioName: string, telemetry: any): Promise<string> {
    if (!GROQ_API_KEY) {
      // Offline fallback: Use structured mock descriptions
      return getOfflineBriefing(scenarioName, telemetry);
    }

    const systemPrompt = `You are the CROWDOS Operations Intelligence System, a high-density event commander system. 
Analyze the current stadium telemetry and return a clinical, professional operations briefing. 
Do NOT talk like a chatbot. Start with [STATUS: <Nominal|Caution|Critical>] followed by a brief 2-3 sentence analysis of current metrics.
Do NOT use markdown bullet points. Do not hallucinate numbers. Use only the telemetry provided.`;

    const userPrompt = `Telemetry stats:
- Scenario: ${scenarioName}
- Operational Health: ${telemetry.operationalHealth}%
- Global Risk Level: ${Math.round(telemetry.riskLevel * 100)}%
- Crowd inside: ${telemetry.crowd.totalInside} (stands density: ${Math.round(telemetry.crowd.standsDensity * 100)}%, concourse density: ${Math.round(telemetry.crowd.concourseDensity * 100)}%)
- Inbound flow rate: ${telemetry.crowd.flowRate} p/m
- Active incidents: ${telemetry.medical.activeIncidents} medical, ${telemetry.security.activeAlerts || 0} security.
- Transport: Metro is ${telemetry.transport.metroStatus}, Bus Terminal queue: ${telemetry.transport.busTerminalQueue} people.
- Weather: ${telemetry.weather.condition}, ${telemetry.weather.temp}°C.`;

    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error("Groq API request failed");
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.warn("Groq API offline or failed, falling back to static briefing.", e);
      return getOfflineBriefing(scenarioName, telemetry);
    }
  },

  /**
   * Request dynamic mitigation protocol recommendation.
   */
  async getMitigationProtocol(scenarioName: string, telemetry: any): Promise<MitigationBriefing> {
    const defaultMitigation = telemetry.recommendation || {
      title: "Deploy Standard Protocols",
      description: "Increase volunteer density in congested concourses and maintain nominal gate access control.",
      confidence: 95,
      alternative: "Rotate gate security posture.",
      expectedImpact: "Optimises flow, reduces risk."
    };

    if (!GROQ_API_KEY) {
      return defaultMitigation;
    }

    const systemPrompt = `You are CROWDOS Decision Intelligence. Analyze telemetry and recommend a mitigation plan.
Respond ONLY with a JSON object in this format (no conversational text before or after):
{
  "title": "Short directive title",
  "description": "Clear mitigation action details (1-2 sentences)",
  "confidence": 92,
  "alternative": "One alternative action",
  "expectedImpact": "Quantifiable impact description"
}
Maintain consistency with these calculated stats:
- Current Operational Health is ${telemetry.operationalHealth}%
- Target recovery is to improve Operational Health by at least +15% and reduce risk levels.`;

    const userPrompt = `Telemetry stats:
- Scenario: ${scenarioName}
- Operational Health: ${telemetry.operationalHealth}%
- Risk: ${Math.round(telemetry.riskLevel * 100)}%
- Concourse Density: ${Math.round(telemetry.crowd.concourseDensity * 100)}%
- Active Incidents: ${telemetry.medical.activeIncidents} medical, ${telemetry.security.activeAlerts || 0} security.
- Outage/Out-of-Service sectors (if any).`;

    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error("Groq API request failed");
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content.trim());
      
      return {
        title: parsed.title || defaultMitigation.title,
        description: parsed.description || defaultMitigation.description,
        confidence: Number(parsed.confidence) || defaultMitigation.confidence,
        alternative: parsed.alternative || defaultMitigation.alternative,
        expectedImpact: parsed.expectedImpact || defaultMitigation.expectedImpact
      };
    } catch (e) {
      console.warn("Groq API offline or failed, falling back to static mitigation protocol.", e);
      return defaultMitigation;
    }
  }
};

/**
 * Static fallbacks for zero-internet hackathon rooms
 */
function getOfflineBriefing(scenarioName: string, telemetry: any): string {
  const status = telemetry.operationalHealth > 85 ? "NOMINAL" : telemetry.operationalHealth > 65 ? "CAUTION" : "CRITICAL";
  
  switch (scenarioName) {
    case "normal":
      return `[STATUS: ${status}] Stadium systems operating within normal parameters. Crowd circulation concourse density is stable at ${Math.round(telemetry.crowd.concourseDensity * 100)}%. Response times are nominal.`;
    case "heavy-rain":
      return `[STATUS: ${status}] Heavy precipitation detected (${telemetry.weather.precipitation}). Concourse crowding stands at ${Math.round(telemetry.crowd.concourseDensity * 100)}% as spectators seek cover. Slip risk indicators have peaked in Sector B.`;
    case "metro-delay":
      return `[STATUS: ${status}] Metro signaling failure causing total outbound delay. Transit terminal queue is congested with ${telemetry.transport.busTerminalQueue} commuters. East buffer zones are reporting localized bottlenecks.`;
    case "medical-emergency":
      return `[STATUS: ${status}] High-priority medical dispatch active in Sector C. Response team speed throttled by high stands exit ramp density (${Math.round(telemetry.crowd.standsDensity * 100)}%). Urgent clearing required.`;
    case "gate-failure":
      return `[STATUS: ${status}] Localized scanner blackout at Gate D. Turnstile throughput has dropped to zero. Outer plaza queue is building up, presenting high local density indices.`;
    case "vip-arrival":
      return `[STATUS: ${status}] VIP arrival protocols engaged at Gate A. Localized corridor lockouts have compressed traffic density in adjacent Sector B concourses to ${Math.round(telemetry.crowd.concourseDensity * 100)}%.`;
    case "power-failure":
      return `[STATUS: ${status}] Sector A power grid substation offline. Emergency light circuits active. Local staircase congestion and visibility constraints have spiked global risk levels to ${Math.round(telemetry.riskLevel * 100)}%.`;
    default:
      return `[STATUS: ${status}] Ticking telemetry step. Health: ${telemetry.operationalHealth}%, Risk: ${Math.round(telemetry.riskLevel * 100)}%. System analyzing alerts.`;
  }
}
