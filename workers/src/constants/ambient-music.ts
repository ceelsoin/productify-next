/**
 * Ambient Music Library
 * Shared between workers and main app
 */

export interface AmbientMusic {
  id: string;
  name: string;
  duration: number; // in seconds
  genre: string;
  mood: string;
  tempo: number; // BPM
  url: string;
  previewUrl: string;
  artist: string;
  license: string;
}

export const AMBIENT_MUSIC_LIBRARY: AmbientMusic[] = [
  {
    id: 'upbeat-corporate',
    name: 'Upbeat Corporate',
    duration: 120,
    genre: 'Corporate',
    mood: 'energetic',
    tempo: 128,
    url: '/audio/ambient/upbeat-corporate.mp3',
    previewUrl: '/audio/ambient/upbeat-corporate-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
  {
    id: 'soft-piano',
    name: 'Soft Piano',
    duration: 150,
    genre: 'Ambient',
    mood: 'calm',
    tempo: 80,
    url: '/audio/ambient/soft-piano.mp3',
    previewUrl: '/audio/ambient/soft-piano-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
  {
    id: 'energetic-electronic',
    name: 'Energetic Electronic',
    duration: 135,
    genre: 'Electronic',
    mood: 'energetic',
    tempo: 140,
    url: '/audio/ambient/energetic-electronic.mp3',
    previewUrl: '/audio/ambient/energetic-electronic-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
  {
    id: 'acoustic-uplifting',
    name: 'Acoustic Uplifting',
    duration: 140,
    genre: 'Acoustic',
    mood: 'uplifting',
    tempo: 110,
    url: '/audio/ambient/acoustic-uplifting.mp3',
    previewUrl: '/audio/ambient/acoustic-uplifting-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    duration: 125,
    genre: 'Electronic',
    mood: 'professional',
    tempo: 120,
    url: '/audio/ambient/modern-tech.mp3',
    previewUrl: '/audio/ambient/modern-tech-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
  {
    id: 'ambient-chill',
    name: 'Ambient Chill',
    duration: 180,
    genre: 'Ambient',
    mood: 'calm',
    tempo: 90,
    url: '/audio/ambient/ambient-chill.mp3',
    previewUrl: '/audio/ambient/ambient-chill-preview.mp3',
    artist: 'Productify Audio',
    license: 'Royalty-free',
  },
];

export function getAmbientMusicById(id: string): AmbientMusic | undefined {
  return AMBIENT_MUSIC_LIBRARY.find((music) => music.id === id);
}

export function getAmbientMusicByMood(mood: string): AmbientMusic[] {
  return AMBIENT_MUSIC_LIBRARY.filter((music) => music.mood === mood);
}

export function getAmbientMusicByTempo(minTempo: number, maxTempo: number): AmbientMusic[] {
  return AMBIENT_MUSIC_LIBRARY.filter(
    (music) => music.tempo >= minTempo && music.tempo <= maxTempo
  );
}
