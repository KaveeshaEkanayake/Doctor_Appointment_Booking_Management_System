import Groq from "groq-sdk";

// Fix: lazy initialization — don't crash if key missing at startup
let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const SPECIALISATIONS = [
  "General Surgery", "Cardiology", "Dermatology", "Neurology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Ophthalmology",
  "ENT", "Gynecology", "Urology", "Oncology", "Radiology",
  "Anesthesiology", "General Practice",
];

// POST /api/symptom-checker
export const analyseSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one symptom is required",
    });
  }

  if (symptoms.length > 20) {
    return res.status(400).json({
      success: false,
      message: "Maximum 20 symptoms allowed",
    });
  }

  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model:    "llama-3.3-70b-versatile",
      messages: [
        {
          role:    "system",
          content: `You are a medical AI assistant. Always respond with valid JSON only. No markdown, no backticks, no explanation. Use exactly this structure:
{
  "specialisation": "one of: General Surgery, Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, Psychiatry, Ophthalmology, ENT, Gynecology, Urology, Oncology, Radiology, Anesthesiology, General Practice",
  "confidence": "87%",
  "urgency": "one of: Low, Medium, High, Emergency",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "whatToExpect": "brief sentence about what the doctor will do",
  "dos": ["do1", "do2", "do3"],
  "donts": ["dont1", "dont2", "dont3"]
}`,
        },
        {
          role:    "user",
          content: `A patient has the following symptoms: ${symptoms.join(", ")}. Provide a medical analysis.`,
        },
      ],
      temperature:     0.2,
      max_tokens:      500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        success: false,
        message: "AI returned empty response",
      });
    }

    const parsed = JSON.parse(content);

    if (!SPECIALISATIONS.includes(parsed.specialisation)) {
      parsed.specialisation = "General Practice";
    }

    return res.status(200).json({
      success:  true,
      analysis: parsed,
    });

  } catch (err) {
    console.error("Groq error:", err.message);
    return res.status(500).json({
      success: false,
      message: "AI analysis failed. Please try again.",
    });
  }
};