import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

function buildVoiceMetadata(role: 'question' | 'instruction', age: number): {
  voiceName: string;
  style: string;
} {
  if (role === 'instruction') {
    return {
      voiceName: 'Kore',
      style:
        'Warm, natural, encouraging children-game narrator speaking clearly at an approachable, conversational pace.',
    };
  }

  if (age <= 5) {
    return {
      voiceName: 'Zephyr',
      style:
        'Sweet, cheerful 4-to-5-year-old little child speaking clearly with bright playful curiosity and gentle pacing.',
    };
  }
  if (age <= 7) {
    return {
      voiceName: 'Puck',
      style:
        'Friendly, energetic 6-to-7-year-old child asking a puzzle question clearly with bright excitement.',
    };
  }
  if (age <= 10) {
    return {
      voiceName: 'Puck',
      style:
        'Lively, curious 9-year-old kid speaking clearly and enthusiastically as a quiz buddy.',
    };
  }
  if (age <= 13) {
    return {
      voiceName: 'Zephyr',
      style:
        'Friendly, upbeat 12-year-old young explorer speaking clearly and naturally.',
    };
  }
  return {
    voiceName: 'Zephyr',
    style:
      'Warm, articulate 15-year-old peer host speaking clearly and naturally.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/tts', async (req, res) => {
    const { text, role = 'question', age = 7 } = req.body || {};
    if (typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({ audioBase64: null, fallback: true });
      return;
    }

    try {
      const cleanText = text.trim().slice(0, 600);
      const safeRole = role === 'instruction' ? 'instruction' : 'question';
      const numericAge = Number.isFinite(Number(age)) ? Number(age) : 7;
      const { voiceName, style } = buildVoiceMetadata(safeRole, numericAge);

      const parts: Array<Record<string, unknown>> = [
        {
          text: cleanText,
          speechMetadata: { style },
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: parts as never,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;

      if (!base64Audio) {
        res.json({ audioBase64: null, fallback: true });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        fallback: false,
      });
    } catch {
      res.json({ audioBase64: null, fallback: true });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindQuest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
