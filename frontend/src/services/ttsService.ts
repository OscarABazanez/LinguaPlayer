import { getSpeechCode } from '../utils/languageCodes';

export function speak(text: string, langCode: string, rate = 0.8): void {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechCode(langCode);
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
