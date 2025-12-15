/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-2.5-pro for complex coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert AI Engineer and Product Designer specializing in "bringing artifacts to life".
Your goal is to take a user uploaded file—which might be a polished UI design, a messy napkin sketch, a photo of a whiteboard with jumbled notes, or a picture of a real-world object—and instantly generate a fully functional, interactive, single-page HTML/JS/CSS application.

CORE DIRECTIVES:
1. **Analyze & Abstract**: Look at the image.
    - **Sketches/Wireframes**: Detect buttons, inputs, and layout. Turn them into a modern, clean UI.
    - **Real-World Photos (Mundane Objects)**: Gamify them or build a Utility.
    - **Product/Promo Images (Memecoins/Games)**: 
      - Build a **Viral Launch Page**.
      - **CRITICAL FOR CRYPTO**: If the prompt mentions "coin", "token", or "CA", you **MUST** include a prominent **"Copy Contract Address"** button with working clipboard JS.
      - **Ticker Symbols**: Style tickers (like $OGSMS) prominently with Glitch, Neon, or Pixel effects.
      - **Lore Integration**: If the story is about 1992/SMS, use a terminal or retro aesthetic.

2. **Retro/Nostalgia (Phones, Consoles)**:
    - If the input is an old device (specifically **Orbitel 901**, Nokia, etc):
      - **Simulator**: Create a fully functional CSS-based simulator. Use CSS borders, shadows, and gradients to recreate the device body.
      - **Keypad**: Make the buttons clickable. Map them to real actions (e.g., typing numbers on the screen).
      - **Screen**: Use a pixelated font (Google Fonts 'VT323', 'Press Start 2P', 'Share Tech Mono').
      - **Easter Eggs**: For launch pages, allow the user to "type" a code (like 1992) or press "SEND" to **reveal or copy the Contract Address**.
      - **Initial State**: For $OGSMS, start the screen with "MERRY CHRISTMAS".

3. **NO EXTERNAL IMAGES**:
    - **CRITICAL**: Do NOT use <img src="..."> with external URLs.
    - **INSTEAD**: Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients**.
    - If you see a "coffee cup", render a ☕ emoji or draw it with CSS.

4. **Self-Contained**: 
    - Output a single HTML file with embedded CSS/JS.
    - Use Tailwind CSS via CDN.
    - Use FontAwesome or HeroIcons (SVG) if needed, or simple Unicode characters.

5. **Robust & Creative**: 
    - If instructions are vague, interpret the "vibe" (e.g., Cyberpunk, Vaporwave, 90s Retro).
    - Ensure mobile responsiveness.

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.`;

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  // Base directive for file inputs
  const imageAnalysisPrompt = "Analyze this image. Detect functionality. If it's a retro phone (like Orbitel), build a working simulator (clickable keys, screen). If it's a memecoin ($OGSMS), include a Copy CA button, matrix/hacker aesthetics, and 'Merry Christmas' 1992 references. IMPORTANT: No external images. Use CSS/SVGs to draw the phone.";
  
  // Construct the final prompt based on inputs
  let finalPrompt = "";

  if (fileBase64) {
    if (prompt) {
        // Combined: Image + User Instructions
        finalPrompt = `${imageAnalysisPrompt}\n\nUSER INSTRUCTIONS: ${prompt}`;
    } else {
        // Image Only
        finalPrompt = imageAnalysisPrompt;
    }
  } else {
    // Text Only
    finalPrompt = prompt || "Create a demo app that shows off your capabilities.";
  }

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";

    // Cleanup if the model still included markdown fences despite instructions
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}