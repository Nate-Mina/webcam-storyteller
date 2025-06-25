import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  // The App.tsx will also handle displaying this to the user.
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Provide a dummy if missing to avoid constructor error, actual calls will fail.

const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17'; // For text and vision

function getBase64DataAndMimeType(dataUrl: string): { data: string; mimeType: string } {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error("Invalid data URL format");
  }
  const meta = parts[0].split(':')[1].split(';')[0];
  const data = parts[1];
  return { data, mimeType: meta };
}

export const describeImage = async (imageDataUrl: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is not configured.");
  
  const { data: base64Data, mimeType } = getBase64DataAndMimeType(imageDataUrl);

  const imagePart: Part = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };

  const textPart: Part = {
    text: "Concisely list and describe the primary distinct objects visible in this image. Focus on tangible items. If people are present, describe their general appearance or activity without identifying them. If no specific objects are clear, state that.",
  };
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Could enable for faster, potentially less detailed description
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini API error (describeImage):', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error('Gemini API request failed with an unknown error.');
  }
};

export const generateStory = async (description: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is not configured.");

  const prompt = `Based on the following scene description: "${description}". 
  Write a short, imaginative, and whimsical fictional story (around 2-3 paragraphs) suitable for all ages. 
  Be creative and engaging. If the description is vague (e.g., "No specific objects are clear"), write a story about an empty or mysterious scene.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini API error (generateStory):', error);
     if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error('Gemini API request failed with an unknown error.');
  }
};
