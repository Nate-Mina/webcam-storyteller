import React, { useState, useCallback, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import CurrentAnalysisDisplay from './components/CurrentAnalysisDisplay';
import ApiKeyMissingBanner from './components/ApiKeyMissingBanner';
import ErrorDisplay from './components/ErrorDisplay';
import { describeImage, generateStory } from './services/geminiService';
import { VisionWeaverIcon } from './constants'; // Using VisionWeaverIcon as main app icon/logo

const App: React.FC = () => {
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [objectDescription, setObjectDescription] = useState<string | null>(null);
  const [fictionalStory, setFictionalStory] = useState<string | null>(null);
  
  const [isProcessingDescription, setIsProcessingDescription] = useState<boolean>(false);
  const [isProcessingStory, setIsProcessingStory] = useState<boolean>(false);
  const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      setError("Gemini API Key is not configured. Please set the API_KEY environment variable.");
    }
  }, []);

  const handleImageCapture = useCallback(async (imageDataUrl: string) => {
    if (apiKeyMissing) return;
    setError(null);
    setWebcamError(null);
    setCapturedImage(imageDataUrl);
    setObjectDescription(null);
    setFictionalStory(null);
    setIsProcessingDescription(true);

    try {
      const description = await describeImage(imageDataUrl);
      setObjectDescription(description);
    } catch (e: any) {
      console.error("Error describing image:", e);
      setError(`Failed to describe image: ${e.message}`);
      setObjectDescription(null); // Clear description on error
    } finally {
      setIsProcessingDescription(false);
    }
  }, [apiKeyMissing]);

  useEffect(() => {
    if (objectDescription && !apiKeyMissing) {
      const generate = async () => {
        setIsProcessingStory(true);
        setError(null); 
        try {
          const story = await generateStory(objectDescription);
          setFictionalStory(story);
        } catch (e: any) {
          console.error("Error generating story:", e);
          setError(`Failed to generate story: ${e.message}`);
          setFictionalStory(null); // Clear story on error
        } finally {
          setIsProcessingStory(false);
        }
      };
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectDescription, apiKeyMissing]); // apiKeyMissing added for safety, generateStory depends on it indirectly.

  const handleWebcamError = useCallback((message: string) => {
    setWebcamError(message);
    setError(null); // Clear general error if webcam specific error occurs
  }, []);

  const handleWebcamReady = useCallback(() => {
    setIsWebcamReady(true);
    setWebcamError(null);
  }, []);

  const isProcessing = isProcessingDescription || isProcessingStory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      {apiKeyMissing && <ApiKeyMissingBanner />}
      
      <header className="w-full max-w-6xl mb-6 md:mb-10 text-center">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-sky-400">{VisionWeaverIcon}</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Vision Weaver
          </h1>
        </div>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">Capture your world, discover its story.</p>
      </header>

      {error && !webcamError && <ErrorDisplay message={error} className="w-full max-w-4xl mb-4" />}
      
      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="lg:w-1/2 flex flex-col bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-4 sm:p-6">
          <WebcamCapture 
            onImageCapture={handleImageCapture} 
            isProcessing={isProcessing}
            onWebcamError={handleWebcamError}
            onWebcamReady={handleWebcamReady}
            webcamError={webcamError}
          />
        </div>
        
        <div className="lg:w-1/2 flex flex-col bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-4 sm:p-6">
          <CurrentAnalysisDisplay
            capturedImage={capturedImage}
            description={objectDescription}
            story={fictionalStory}
            isLoadingDescription={isProcessingDescription}
            isLoadingStory={isProcessingStory}
            isWebcamReady={isWebcamReady}
            hasCaptureError={!!webcamError || (!!error && !objectDescription && !capturedImage)}
          />
        </div>
      </main>
      
      <footer className="w-full max-w-6xl mt-8 md:mt-12 text-center text-slate-500 text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Vision Weaver. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
