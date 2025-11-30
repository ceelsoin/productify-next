import { TextToSpeechClient } from '@google-cloud/text-to-speech';

let ttsClient: TextToSpeechClient | null = null;

export function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  return ttsClient;
}

export type VoiceOptions = {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
};

export async function generateVoiceover(
  options: VoiceOptions
): Promise<Buffer> {
  const client = getTTSClient();

  const request = {
    input: { text: options.text },
    voice: {
      languageCode: options.languageCode || 'en-US',
      name: options.voiceName,
      ssmlGender: options.ssmlGender || 'NEUTRAL',
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: 1.0,
      pitch: 0.0,
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error('No audio content generated');
  }

  return Buffer.from(response.audioContent);
}
