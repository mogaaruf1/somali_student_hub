import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { studentName, studentEmail, resourceTitle } = await req.json();

        // TANI WAA MEESHA EMAIL-KA LAGU DIRAYO.
        // Hadda waxaan isticmaalaynaa Mock Log, laakiin waxaad halkan ku dari kartaa
        // Resend API ama Nodemailer si uu email dhab ah kuu soo dhaco.

        console.log(`[EMAIL NOTIFICATION]: Cusub! ${studentName} (${studentEmail}) ayaa is-diiwaangeliyay koorsada ${resourceTitle}.`);

        // HADDII AAD HAYSATO RESEND API KEY:
        /*
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Somali Student Hub <onboarding@resend.dev>',
                to: ['YOUR_EMAIL@gmail.com'],
                subject: 'Arday Cusub ayaa Is-diiwaangeliyay!',
                html: `<h1>Arday Cusub!</h1><p><strong>Magaca:</strong> ${studentName}</p><p><strong>Email:</strong> ${studentEmail}</p><p><strong>Koorsada:</strong> ${resourceTitle}</p>`
            })
        });
        */

        return NextResponse.json({ success: true, message: "Notification sent (Mocked)" });
    } catch (error: any) {
        console.error("Notification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
