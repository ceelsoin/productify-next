/**
 * Whisper.cpp integration for caption generation
 * This will require whisper.cpp to be installed and compiled locally
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type WhisperOptions = {
  audioPath: string;
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  language?: string;
  outputFormat?: 'srt' | 'vtt' | 'json';
};

export type Caption = {
  start: number;
  end: number;
  text: string;
};

export async function generateCaptions(
  options: WhisperOptions
): Promise<Caption[]> {
  const whisperPath = process.env.WHISPER_CPP_PATH || './whisper.cpp';
  const modelPath = `${whisperPath}/models/ggml-${options.model || 'base'}.bin`;

  const command = [
    `${whisperPath}/main`,
    '-m',
    modelPath,
    '-f',
    options.audioPath,
    '-of',
    options.outputFormat || 'json',
    options.language ? `-l ${options.language}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  try {
    const { stdout } = await execAsync(command);
    return parseWhisperOutput(stdout, options.outputFormat || 'json');
  } catch (error) {
    throw new Error(
      `Failed to generate captions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function parseWhisperOutput(output: string, format: string): Caption[] {
  if (format === 'json') {
    const parsed = JSON.parse(output);
    return parsed.transcription || [];
  }

  // Fallback for SRT/VTT formats
  return [];
}
