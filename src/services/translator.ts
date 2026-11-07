// Free translation services with fallback
export const translateSingleWord = async (
  word: string,
  from = 'auto',
  to = 'uz'
): Promise<{ translation: string; detectedLang: string }> => {
  const clean = word.trim();
  if (!clean) return { translation: '', detectedLang: from };

  // 1. Google Translate Single API
  try {
    const sl = from === 'auto' ? 'auto' : from;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${to}&dt=t&q=${encodeURIComponent(
      clean
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const translation = data[0]?.map((p: any) => p[0]).join('').trim();
      const detectedLang = data[2] || from;
      if (translation && translation.toLowerCase() !== clean.toLowerCase()) {
        return { translation, detectedLang };
      }
    }
  } catch (err) {
    // fallback
  }

  // 2. MyMemory API fallback
  try {
    const sl = from === 'auto' ? 'en' : from;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      clean
    )}&langpair=${sl}|${to}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const text = data.responseData?.translatedText;
      if (text && text.toLowerCase() !== clean.toLowerCase()) {
        return { translation: text.trim(), detectedLang: sl };
      }
    }
  } catch (err) {
    // fallback
  }

  return { translation: '', detectedLang: from };
};
