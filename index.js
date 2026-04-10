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

// const upload = multer(); 
const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const GEMINI_MODEL  = 'gemini-2.5-flash-lite';

app.use(express.json());
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
    console.log('req', conversation);  

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
        systemInstruction: 'Only respons in Indonesia Language',
        temperature: 2.0,
      }
    });

    res.status(200).json({ result: `Response for prompt: ${response.text}` });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: error.message });
  }
});

// app.post('/generate-text', async (req, res) => {
//   const { prompt } = req.body;

//   try {
//     const response = await genai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: prompt
//     //   input: {
//     //     content: [
//     //       {
//     //         type: 'input_text',
//     //         text: prompt,
//     //       },
//     //     ],
//     //   },

//     });

//     res.status(200).json({ result: response.text});
//     // const generatedText = response.candidates[0].content.text;
//     // res.json({ generatedText });
//   } catch (error) {
//     console.error('Error generating content:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/generate-from-image', upload.single('image'), async (req, res) => {
//   const { prompt } = req.body;
//   const imageBase64 = req.file.buffer.toString('base64');

//   try {
//     const response = await genai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         {
//           text: prompt, type: 'text',
//         },
//         {
//           inlineData: {
//             data: imageBase64,
//             mimeType: req.file.mimetype,
//           },
//         }
//       ]
//     });

//     res.status(200).json({ result: response.text });
//   } catch (error) {
//     console.error('Error generating content from image:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/generate-from-document', upload.single('document'), async (req, res) => {
//   const { prompt } = req.body;
//   const documentBase64 = req.file.buffer.toString('base64');

//   try {
//     const response = await genai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         {
//           text: prompt ?? "Tolong buat ringkasan dari dokumen berikut", type: 'text',
//         },
//         {
//           inlineData: {
//             data: documentBase64,
//             mimeType: req.file.mimetype,
//           },
//         }
//       ]
//     });

//     res.status(200).json({ result: response.text });
//   } catch (error) {
//     console.error('Error generating content from document:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
//   const { prompt } = req.body;
//   const audioBase64 = req.file.buffer.toString('base64');

//   try {
//     const response = await genai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         {
//           text: prompt ?? "Tolong buat ringkasan dari audio berikut", type: 'text',
//         },
//         {
//           inlineData: {
//             data: audioBase64,
//             mimeType: req.file.mimetype,
//           },
//         }
//       ]
//     });

//     res.status(200).json({ result: response.text });
//   } catch (error) {
//     console.error('Error generating content from audio:', error);
//     res.status(500).json({ message: error.message });
//   }
// });