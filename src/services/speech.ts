export const speakWord = (text: string, lang = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map simplified language code
    const langMap: Record<string, string> = {
      en: 'en-US',
      ru: 'ru-RU',
      de: 'de-DE',
      uz: 'uz-UZ',
    };

    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech error:', err);
  }
};

export const speech = {
  speak: speakWord,
};
