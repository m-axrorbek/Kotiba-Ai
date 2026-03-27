let activeAudio = null;

const stopActiveAudio = () => {
  if (!activeAudio) {
    return;
  }

  activeAudio.pause();
  activeAudio.currentTime = 0;
  if (activeAudio.dataset.objectUrl === "true") {
    URL.revokeObjectURL(activeAudio.src);
  }
  activeAudio = null;
};

export const playAudioSource = async (source) => {
  if (!source) {
    return false;
  }

  stopActiveAudio();
  window.speechSynthesis?.cancel?.();

  const audio = new Audio();
  if (typeof source === "string") {
    audio.src = source;
  } else {
    audio.src = URL.createObjectURL(source);
    audio.dataset.objectUrl = "true";
  }

  activeAudio = audio;

  await audio.play();

  audio.onended = () => {
    if (audio.dataset.objectUrl === "true") {
      URL.revokeObjectURL(audio.src);
    }
    if (activeAudio === audio) {
      activeAudio = null;
    }
  };

  return true;
};

export const speakWithWebApi = (text, lang = "uz-UZ") => {
  if (!("speechSynthesis" in window) || !text?.trim()) {
    return false;
  }

  stopActiveAudio();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeaking = () => {
  stopActiveAudio();
  window.speechSynthesis?.cancel?.();
};
