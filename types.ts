// Currently, Part from @google/genai is sufficient for image and text parts.
// If more specific local types are needed, they can be added here.

// Example: If we were to store story items (not implemented in current scope, but for future)
export interface StoryItem {
  id: string;
  capturedImage: string; // base64 data URL
  objectDescription: string;
  fictionalStory: string;
  timestamp: Date;
}
