import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

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

        return NextResponse.json({
            reply: response.choices[0].message.content
        });
    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
