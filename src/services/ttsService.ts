const ELEVENLABS_API_KEY = 'sk_29ee55324dae28cf481708ffe28b32f5e7059b4403726798';
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';
const LOCALSTORAGE_VOICE_KEY = 'eleven_preferred_voice';

export async function listElevenVoices(): Promise<Array<{ id: string; name: string }>> {
  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`List voices failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // data.voices expected
    return (data.voices || []).map((v: any) => ({ id: v.voice_id || v.id || v._id || v.id, name: v.name || v.voice_name || v.name }));
  } catch (err) {
    console.error('listElevenVoices error', err);
    return [];
  }
}

  export function setPreferredVoice(voiceId: string) {
    try {
      localStorage.setItem(LOCALSTORAGE_VOICE_KEY, voiceId);
    } catch (e) {
      // ignore
    }
  }

  export function getPreferredVoice(): string | null {
    try {
      return localStorage.getItem(LOCALSTORAGE_VOICE_KEY);
    } catch (e) {
      return null;
    }
  }

  // Try to resolve a display name (e.g. "Mark - Natural Conversations") to a real voice id
  async function resolveVoiceIdentifier(pref: string): Promise<string | null> {
    if (!pref) return null;
    // If it looks like an id (no spaces and short), assume it's already an id
    if (!pref.includes(' ') && pref.length < 64) return pref;

    try {
      const voices = await listElevenVoices();
      const lc = pref.toLowerCase();
      // Try exact name match first
      let found = voices.find(v => (v.name || '').toLowerCase() === lc);
      if (!found) {
        // Try contains
        found = voices.find(v => (v.name || '').toLowerCase().includes(lc));
      }
      if (found) return found.id;
    } catch (err) {
      console.warn('resolveVoiceIdentifier error', err);
    }
    return null;
  }

export async function synthesizeEleven(text: string, voiceId?: string): Promise<Blob> {
  try {
    let vid = voiceId || getPreferredVoice() || undefined;
    console.debug('[ttsService] synthesizeEleven requested. preferred/raw voice:', vid);

    // If vid is a display name, try resolving it to a real id
    if (vid) {
      const resolved = await resolveVoiceIdentifier(vid);
      if (resolved) {
        // persist resolved id for faster subsequent calls
        setPreferredVoice(resolved);
        vid = resolved;
      }
    }

    // If still undefined, fetch voices and pick a reasonable default (first available)
    if (!vid) {
      const voices = await listElevenVoices();
      if (voices.length > 0) vid = voices[0].id;
      else vid = 'alloy';
    }

    console.debug('[ttsService] using voice id:', vid);

    // Use ElevenLabs TTS endpoint
    const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${encodeURIComponent(vid)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model: 'eleven_multilingual_v1',
        // Tuned voice settings for more natural/human-like audio: lower stability (more variation),
        // higher similarity_boost to favor the chosen voice timbre.
        voice_settings: { stability: 0.25, similarity_boost: 0.95 }
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${t}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    return blob;
  } catch (err) {
    console.error('synthesizeEleven error', err);
    throw err;
  }
}

/**
 * Convenience: store a preferred voice by display name. The next synthesize call will
 * attempt to resolve that name to an actual voice id from ElevenLabs.
 */
export function setPreferredVoiceByName(displayName: string) {
  setPreferredVoice(displayName);
}

// If user hasn't chosen a voice, default to the provided voice name attachment.
try {
  if (!getPreferredVoice()) {
    // set the requested default voice name from the attachment so it will be used
    // (it will be resolved to an id on first use)
    setPreferredVoice('Mark - Natural Conversations');
  }
} catch (e) {
  // ignore in non-browser environments
}

// Try to eagerly resolve the default display name to an actual voice id at module init.
(async () => {
  try {
    const pref = getPreferredVoice();
    if (pref) {
      const resolved = await resolveVoiceIdentifier(pref);
      if (resolved && resolved !== pref) {
        console.info('[ttsService] resolved preferred voice', pref, '->', resolved);
        setPreferredVoice(resolved);
      } else {
        console.info('[ttsService] preferred voice set as:', pref);
      }
    }
  } catch (err) {
    console.warn('[ttsService] could not resolve preferred voice at init', err);
  }
})();
