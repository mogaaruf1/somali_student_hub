require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Config
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Routes
app.get('/', (req, res) => {
    res.send('Somali Student Hub API is running...');
});

// Notifications Endpoint
app.post('/api/notify', async (req, res) => {
    try {
        const { studentName, studentEmail, resourceTitle } = req.body;

        console.log(`[EMAIL NOTIFICATION]: Cusub! ${studentName} (${studentEmail}) ayaa is-diiwaangeliyay koorsada ${resourceTitle}.`);

        // Mock email response
        res.json({ success: true, message: "Notification sent (Mocked)" });
    } catch (error) {
        console.error("Notification Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Chat/AI Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI tutor for Somali students on the 'Somali Student Hub'. Answer in Somali or English as appropriate. Be encouraging and clear."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            stream: false,
        });

        res.json({
            reply: response.choices[0].message.content
        });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
