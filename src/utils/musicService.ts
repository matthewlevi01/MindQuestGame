/**
 * Internet Song Loader & Playback Service for Musical Tone Matching ("Who Sang What?")
 * Fetches real 30-second song previews from the internet via public iTunes Search API
 * using rotating queries per login session so every login features fresh songs.
 * Falls back cleanly to public-domain Wikimedia Commons tracks & Web Audio riffs if offline.
 */

export interface InternetSongTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  source: 'itunes' | 'wikimedia' | 'synth';
}

// Rotating search genres so every login fetches completely different internet songs
const LOGIN_SONG_QUERIES = [
  'kids happy pop',
  'nursery rhymes instrumental',
  'disney soundtrack',
  'marimba acoustic happy',
  'playful jazz piano',
  'cartoon theme',
  'ukulele cheerful',
  'african kids music',
  'classical music box',
  'family sing along',
];

// Public-domain Wikimedia Commons fallback audio files
const WIKIMEDIA_FALLBACK_SONGS: InternetSongTrack[] = [
  {
    id: 'wm_alphabet',
    title: 'Alphabet Song',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Alphabet_song.ogg',
    source: 'wikimedia',
  },
  {
    id: 'wm_weasel',
    title: 'Pop Goes the Weasel',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Pop_Goes_the_Weasel.ogg',
    source: 'wikimedia',
  },
  {
    id: 'wm_buns',
    title: 'Hot Cross Buns',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Hot_Cross_Buns.ogg',
    source: 'wikimedia',
  },
  {
    id: 'wm_kittens',
    title: 'Three Little Kittens',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Three_Little_Kittens.ogg',
    source: 'wikimedia',
  },
  {
    id: 'wm_london',
    title: 'London Bridge',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/London_Bridge_is_Falling_Down.ogg',
    source: 'wikimedia',
  },
  {
    id: 'wm_lamb',
    title: 'Mary Had a Little Lamb',
    artist: 'Public Domain',
    previewUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Mary_Had_a_Little_Lamb.ogg',
    source: 'wikimedia',
  },
];

// Cache fetched tracks per loginSessionId so a login session stays consistent during a game
// while refreshing to a new internet song collection on every new login or restart
const sessionTrackCache = new Map<string, InternetSongTrack[]>();

let activeAudioEl: HTMLAudioElement | null = null;
let activeAudioTimeout: ReturnType<typeof setTimeout> | null = null;

export function stopCurrentSong(): void {
  if (activeAudioTimeout) {
    clearTimeout(activeAudioTimeout);
    activeAudioTimeout = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
      activeAudioEl.src = '';
    } catch {
      // Ignore cleanup errors
    }
    activeAudioEl = null;
  }
}

export async function fetchSongsForSession(
  loginSessionId: number,
  roundSeed: number = 0
): Promise<InternetSongTrack[]> {
  const cacheKey = `${loginSessionId}-${Math.floor(roundSeed / 4)}`;
  const cached = sessionTrackCache.get(cacheKey);
  if (cached && cached.length >= 6) {
    return [...cached].sort(() => Math.random() - 0.5);
  }

  // Pick a fresh genre query based on loginSessionId + roundSeed
  const queryIdx = Math.abs(loginSessionId * 3 + Math.floor(roundSeed / 4)) % LOGIN_SONG_QUERIES.length;
  const term = encodeURIComponent(LOGIN_SONG_QUERIES[queryIdx]);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=25`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const tracks: InternetSongTrack[] = results
        .filter((r: any) => typeof r.previewUrl === 'string' && r.previewUrl.startsWith('http'))
        .map((r: any) => ({
          id: `itunes_${r.trackId}`,
          title: String(r.trackName || 'Mystery Tune'),
          artist: String(r.artistName || 'Internet Artist'),
          previewUrl: String(r.previewUrl).replace(/^http:/, 'https:'),
          source: 'itunes' as const,
        }));

      // Deduplicate by previewUrl and shuffle so every login sounds completely fresh
      const uniqueMap = new Map<string, InternetSongTrack>();
      tracks.forEach((t) => {
        if (!uniqueMap.has(t.previewUrl)) uniqueMap.set(t.previewUrl, t);
      });
      const uniqueTracks = Array.from(uniqueMap.values()).sort(() => Math.random() - 0.5);

      if (uniqueTracks.length >= 6) {
        sessionTrackCache.set(cacheKey, uniqueTracks);
        return uniqueTracks;
      }
    }
  } catch {
    // Network offline or blocked -> fall back to Wikimedia Commons public-domain tracks
  }

  return [...WIKIMEDIA_FALLBACK_SONGS].sort(() => Math.random() - 0.5);
}

/**
 * Plays up to 5.5 seconds of a real internet song clip (pausing any prior clip first).
 * Falls back to the character's synthesized musical riff if the browser blocks or fails audio load.
 */
export async function playInternetSongClip(
  track: InternetSongTrack | undefined,
  fallbackRiff: number[],
  fallbackPlayFn: (freqs: number[]) => void,
  clipMs: number = 5500
): Promise<boolean> {
  stopCurrentSong();

  if (!track || !track.previewUrl) {
    fallbackPlayFn(fallbackRiff);
    return false;
  }

  return new Promise((resolve) => {
    try {
      const audio = new Audio(track.previewUrl);
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.85;
      activeAudioEl = audio;

      let settled = false;
      const fallback = () => {
        if (settled) return;
        settled = true;
        stopCurrentSong();
        fallbackPlayFn(fallbackRiff);
        resolve(false);
      };

      audio.onerror = fallback;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (settled) return;
            settled = true;
            activeAudioTimeout = setTimeout(() => {
              if (activeAudioEl === audio) {
                stopCurrentSong();
              }
            }, clipMs);
            resolve(true);
          })
          .catch(fallback);
      } else {
        settled = true;
        activeAudioTimeout = setTimeout(() => {
          if (activeAudioEl === audio) {
            stopCurrentSong();
          }
        }, clipMs);
        resolve(true);
      }
    } catch {
      fallbackPlayFn(fallbackRiff);
      resolve(false);
    }
  });
}
