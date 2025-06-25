import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { MagnifyingGlassIcon, StoryIcon, ImageIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '../constants';

interface CurrentAnalysisDisplayProps {
  capturedImage: string | null;
  description: string | null;
  story: string | null;
  isLoadingDescription: boolean;
  isLoadingStory: boolean;
  isWebcamReady: boolean;
  hasCaptureError: boolean;
}

const Placeholder: React.FC<{ icon: React.ReactNode; text: string; heightClass?: string }> = ({ icon, text, heightClass = "min-h-[100px] sm:min-h-[120px]" }) => (
  <div className={`flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg ${heightClass} text-slate-400 text-center`}>
    <span className="mb-2 opacity-70">{icon}</span>
    <p className="text-sm">{text}</p>
  </div>
);

const CurrentAnalysisDisplay: React.FC<CurrentAnalysisDisplayProps> = ({
  capturedImage,
  description,
  story,
  isLoadingDescription,
  isLoadingStory,
  isWebcamReady,
  hasCaptureError
}) => {
  const showInitialPlaceholder = !capturedImage && !isLoadingDescription && !isLoadingStory && isWebcamReady && !hasCaptureError;

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [canSpeak, setCanSpeak] = useState<boolean>(false);

  // Effect for speech synthesis availability and cleanup on unmount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setCanSpeak(true);
    } else {
      console.warn("Speech synthesis not supported by this browser.");
      setCanSpeak(false);
    }

    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effect to manage story speech: auto-play, stop on story clear, or restart on new story.
  useEffect(() => {
    if (!canSpeak || !window.speechSynthesis) {
      // If speech synthesis is not available, ensure any (unlikely) active speech is stopped.
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
      }
      return;
    }

    if (story && !isLoadingStory) {
      // A story is present and not loading.
      // Cancel any existing speech first (e.g., from a previous story or manual play).
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        // The 'onend' or 'onerror' of the cancelled utterance will set isSpeaking to false.
        // setIsSpeaking(false) // Avoid setting here to let utterance events handle it.
      }

      // Speak the new story.
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error("Speech synthesis error (auto-play/story update):", event.error, event);
        }
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);

    } else if (!story && window.speechSynthesis.speaking) {
      // No story present (e.g., it was cleared), but speech is active. Stop it.
      window.speechSynthesis.cancel();
      setIsSpeaking(false); // Explicitly set, as there's no new utterance to manage state.
    }
    // If isLoadingStory is true, or no story & not speaking, this effect does nothing further.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, isLoadingStory, canSpeak]);


  const handleToggleSpeech = useCallback(() => {
    if (!canSpeak || !story) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false); // Update React state immediately. Utterance's onend/onerror will also fire.
    } else {
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error("Speech synthesis error (manual toggle):", event.error, event);
        }
        setIsSpeaking(false); 
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [canSpeak, story]);


  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-sky-300 mb-1">Scene Analysis</h2>
      
      <div className="flex-grow space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sky-400 scrollbar-track-slate-700">
        {/* Captured Image Section */}
        <div className="bg-slate-700/50 p-3 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-sky-400 mb-2 flex items-center">
            <span className="mr-2">{ImageIcon}</span>Captured Scene
          </h3>
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured scene" 
              className="w-full h-auto rounded-md shadow-inner aspect-video object-cover" 
            />
          ) : (
            <Placeholder icon={ImageIcon} text={
              hasCaptureError ? "Waiting for successful capture." :
              isWebcamReady ? "Capture a scene from your webcam to begin." : 
              "Initializing webcam..."
            } heightClass="min-h-[150px] sm:min-h-[200px]" />
          )}
        </div>

        {/* Object Description Section */}
        {(capturedImage || isLoadingDescription || description) && (
          <div className="bg-slate-700/50 p-3 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-sky-400 mb-2 flex items-center">
              <span className="mr-2">{MagnifyingGlassIcon}</span>Object Description
            </h3>
            {isLoadingDescription ? (
              <div className="flex items-center justify-center min-h-[80px] sm:min-h-[100px]">
                <LoadingSpinner /> 
                <span className="ml-3 text-slate-300">Describing objects...</span>
              </div>
            ) : description ? (
              <p className="text-slate-200 whitespace-pre-wrap p-2 bg-slate-900/30 rounded text-sm sm:text-base min-h-[80px] sm:min-h-[100px]">{description}</p>
            ) : capturedImage && !hasCaptureError ? ( 
                <Placeholder icon={MagnifyingGlassIcon} text="Objects will be described here." heightClass="min-h-[80px] sm:min-h-[100px]" />
            ) : null }
             {capturedImage && !isLoadingDescription && !description && hasCaptureError && (
                 <Placeholder icon={MagnifyingGlassIcon} text="Could not generate description due to an error." heightClass="min-h-[80px] sm:min-h-[100px]" />
            )}
          </div>
        )}
        
        {/* Fictional Story Section */}
        {(description || isLoadingStory || story) && (
           <div className="bg-slate-700/50 p-3 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-sky-400 mb-2 flex items-center">
              <span className="mr-2">{StoryIcon}</span>Fictional Story
            </h3>
            {isLoadingStory ? (
              <div className="flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
                <LoadingSpinner />
                <span className="ml-3 text-slate-300">Weaving a tale...</span>
              </div>
            ) : story ? (
              <>
                <p className="text-slate-200 whitespace-pre-wrap p-2 bg-slate-900/30 rounded text-sm sm:text-base min-h-[100px] sm:min-h-[120px]">{story}</p>
                {canSpeak && (
                  <button
                    onClick={handleToggleSpeech}
                    disabled={!story} // Enable button as long as there's a story, even if loading new one (to stop current)
                    className="mt-3 flex items-center justify-center px-3 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
                    aria-live="polite"
                    aria-label={isSpeaking ? "Stop reading story" : "Read story aloud"}
                  >
                    {isSpeaking ? <span className="h-5 w-5">{SpeakerXMarkIcon}</span> : <span className="h-5 w-5">{SpeakerWaveIcon}</span>}
                    <span className="ml-2">{isSpeaking ? 'Stop Reading' : 'Read Story Aloud'}</span>
                  </button>
                )}
                {!canSpeak && story && (
                  <p className="text-xs text-amber-400 mt-2 italic">
                    Text-to-speech is not supported by your browser.
                  </p>
                )}
              </>
            ) : description && !hasCaptureError ? ( 
                 <Placeholder icon={StoryIcon} text="A story will be woven here." heightClass="min-h-[100px] sm:min-h-[120px]" />
            ) : null}
            {description && !isLoadingStory && !story && hasCaptureError && (
                <Placeholder icon={StoryIcon} text="Could not generate story due to an error." heightClass="min-h-[100px] sm:min-h-[120px]" />
            )}
          </div>
        )}
        
        {showInitialPlaceholder && (
          <div className="text-center text-slate-400 p-4 rounded-lg bg-slate-700/30">
            <p>Point your webcam at interesting objects and click "Capture & Analyze Scene" to begin the magic!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentAnalysisDisplay;
