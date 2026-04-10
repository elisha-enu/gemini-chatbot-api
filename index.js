import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';    

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const GEMINI_MODEL  = 'gemini-2.5-flash';

app.use(express.json());
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

    // example input from user
    // conversation: [
    //   { role: 'user', text: 'Apa itu AI?' },
    //   { role: 'model', text: 'AI adalah singkatan dari Artificial Intelligence...' },
    // ]

  try {
    if (!Array.isArray(conversation)) {
      throw new Error('Invalid conversation format. Expected an array.');
    }

    const formattedConversation = conversation.map((message) => {
      return {
        role: message.role,
        parts: [{ text: message.text }],
      };
    });

    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: formattedConversation,
      config: {
        systemInstruction: 'Kamu adalah Personal Health Assistant yang ahli. Tugasmu adalah membantu pengguna melacak dan meningkatkan kesehatan mereka. Berdasarkan profil pengguna (jenis kelamin, usia, tinggi badan, dan berat badan), berikan saran yang spesifik mengenai: 1. Gaya hidup sehat, 2. Latihan fisik/olahraga yang cocok, 3. Rencana makan (meal plan), dan 4. Waktu tidur yang optimal. Selalu berikan jawaban dalam Bahasa Indonesia yang ramah dan informatif.',
        temperature: 1.0,
      }
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: error.message });
  }
});
