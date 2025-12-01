/**
 * Músicas ambiente disponíveis para vídeos promocionais
 */

export interface AmbientMusic {
  id: string;
  name: string;
  duration: number; // em segundos
  genre: string;
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  url: string; // URL do arquivo de áudio
  previewUrl?: string; // URL para preview de 30s
  artist?: string;
  license: string;
}

export const AMBIENT_MUSIC_LIBRARY: AmbientMusic[] = [
  {
    id: 'upbeat-corporate',
    name: 'Upbeat Corporate',
    duration: 120,
    genre: 'Corporate',
    mood: 'Motivacional',
    tempo: 'medium',
    url: '/audio/ambient/upbeat-corporate.mp3',
    previewUrl: '/audio/ambient/upbeat-corporate-preview.mp3',
    license: 'Royalty-free',
  },
  {
    id: 'soft-piano',
    name: 'Soft Piano',
    duration: 150,
    genre: 'Instrumental',
    mood: 'Calmo',
    tempo: 'slow',
    url: '/audio/ambient/soft-piano.mp3',
    previewUrl: '/audio/ambient/soft-piano-preview.mp3',
    license: 'Royalty-free',
  },
  {
    id: 'energetic-electronic',
    name: 'Energetic Electronic',
    duration: 135,
    genre: 'Electronic',
    mood: 'Energético',
    tempo: 'fast',
    url: '/audio/ambient/energetic-electronic.mp3',
    previewUrl: '/audio/ambient/energetic-electronic-preview.mp3',
    license: 'Royalty-free',
  },
  {
    id: 'acoustic-uplifting',
    name: 'Acoustic Uplifting',
    duration: 140,
    genre: 'Acoustic',
    mood: 'Inspirador',
    tempo: 'medium',
    url: '/audio/ambient/acoustic-uplifting.mp3',
    previewUrl: '/audio/ambient/acoustic-uplifting-preview.mp3',
    license: 'Royalty-free',
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    duration: 125,
    genre: 'Tech',
    mood: 'Moderno',
    tempo: 'medium',
    url: '/audio/ambient/modern-tech.mp3',
    previewUrl: '/audio/ambient/modern-tech-preview.mp3',
    license: 'Royalty-free',
  },
  {
    id: 'ambient-chill',
    name: 'Ambient Chill',
    duration: 180,
    genre: 'Ambient',
    mood: 'Relaxante',
    tempo: 'slow',
    url: '/audio/ambient/ambient-chill.mp3',
    previewUrl: '/audio/ambient/ambient-chill-preview.mp3',
    license: 'Royalty-free',
  },
];

/**
 * Get ambient music by ID
 */
export function getAmbientMusicById(id: string): AmbientMusic | undefined {
  return AMBIENT_MUSIC_LIBRARY.find((music) => music.id === id);
}

/**
 * Get ambient music by mood
 */
export function getAmbientMusicByMood(mood: string): AmbientMusic[] {
  return AMBIENT_MUSIC_LIBRARY.filter((music) => 
    music.mood.toLowerCase() === mood.toLowerCase()
  );
}

/**
 * Get ambient music by tempo
 */
export function getAmbientMusicByTempo(tempo: 'slow' | 'medium' | 'fast'): AmbientMusic[] {
  return AMBIENT_MUSIC_LIBRARY.filter((music) => music.tempo === tempo);
}
