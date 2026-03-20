import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Insufficient text content extracted from PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a LinkedIn profile parser. Extract structured data from the provided LinkedIn PDF text content.

Return a JSON object using the tool provided with:
- experiences: array of work experiences with company_name, role_title, employment_type (full-time/part-time/internship/freelance/contract), start_date (YYYY-MM format or empty), end_date (YYYY-MM format or empty), is_current (boolean), description
- skills: array of skill names (strings)  
- headline: professional headline if found
- summary: bio/about section if found
- location: current location if found
- contact: object with any clearly present contact/profile links using only email, phone, linkedin_url, website_url, twitter_url, github_url
- education: array of education entries with institution, degree, field_of_study, graduation_year, description
- certifications: array of certifications/licenses with name, issuer, issue_date (YYYY-MM format or empty), expiry_date (YYYY-MM format or empty), credential_url, description

Rules:
- Extract ALL experiences listed
- Extract ALL education entries listed
- Extract ALL certifications/licenses listed
- For dates, use YYYY-MM format (e.g., "2023-01")
- If only year is given, use January (e.g., "2023-01")
- Mark the most recent role as is_current if no end date
- Extract skills from the Skills section
- Use only links or contact values that are explicitly present in the PDF text
- Keep descriptions concise, preserving key achievements
- Do not fabricate data not present in the text`;

    const modelInput =
      text.length <= 24000
        ? text
        : `${text.slice(0, 14000)}\n\n[... middle content omitted for length ...]\n\n${text.slice(-10000)}`;

    const prompt = `${systemPrompt}

Parse this LinkedIn profile text and return only valid JSON matching the requested schema.

${modelInput}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2200,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                headline: { type: "string" },
                summary: { type: "string" },
                location: { type: "string" },
                contact: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    phone: { type: "string" },
                    linkedin_url: { type: "string" },
                    website_url: { type: "string" },
                    twitter_url: { type: "string" },
                    github_url: { type: "string" },
                  },
                },
                experiences: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company_name: { type: "string" },
                      role_title: { type: "string" },
                      employment_type: { type: "string" },
                      start_date: { type: "string" },
                      end_date: { type: "string" },
                      is_current: { type: "boolean" },
                      description: { type: "string" },
                    },
                    required: ["company_name", "role_title"],
                  },
                },
                skills: {
                  type: "array",
                  items: { type: "string" },
                },
                education: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      institution: { type: "string" },
                      degree: { type: "string" },
                      field_of_study: { type: "string" },
                      graduation_year: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["institution"],
                  },
                },
                certifications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      issuer: { type: "string" },
                      issue_date: { type: "string" },
                      expiry_date: { type: "string" },
                      credential_url: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["name"],
                  },
                },
              },
              required: ["experiences", "skills", "education", "certifications"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      throw new Error("Failed to parse LinkedIn profile");
    }

    const parsed = JSON.parse(rawText);

    return new Response(
      JSON.stringify({ parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("LinkedIn parse error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
