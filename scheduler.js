const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');

const scheduleData = [
    { day: "Senin", show: "Chaki", person: "Rafly", phone: "628889009694", time: "18:00" },
    { day: "Selasa", show: "Attenthings", person: "Ardo", phone: "6281319848343", time: "18:00" },
    { day: "Rabu", show: "K-Time", person: "Reyhan", phone: "6287748305273", time: "18:00" },
    { day: "Kamis", show: "Error", person: "Samuel", phone: "6281280834588", time: "19:00" },
    { day: "Jumat", show: "The Untold", person: "Rafly", phone: "628889009694", time: "18:00" },
    { day: "Sabtu", show: "Movie Hunter", person: "Samuel", phone: "6281280834588", time: "18:00" },
    { day: "Minggu", show: "Bisik Bernada", person: "Ardo", phone: "6281319848343", time: "18:00" }
];

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log("QR Code generated, scan it with your WhatsApp.");
});

client.on('authenticated', () => {
    console.log('Authenticated successfully');
});

client.on('ready', async () => {
    console.log('Bot is ready!');

    const groupId = '120363399019304143@g.us';

    for (const item of scheduleData) {
        const [hour, minute] = item.time.split(":");
        const dayIndex = dayNames.indexOf(item.day); 

        const cronTime = `${minute} ${hour} * * ${dayIndex}`;

        cron.schedule(cronTime, async () => {
            try {
                const mentionId = `${item.phone}@c.us`;
                const chat = await client.getChatById(groupId);
                const contact = await client.getContactById(mentionId);

                await chat.sendMessage(`🎙️ Hari ini jadwal podcast *${item.show}*\nHai @${item.phone}, waktunya UPLOAD!`, {
                    mentions: [contact]
                });

                console.log(`Reminder sent to ${item.person} (${item.day} at ${item.time})`);
            } catch (err) {
                console.error(`Error on ${item.day} for ${item.person}:`, err.message);
            }
        });
    }
});

client.on('message', async message => {
    if (message.body === '!ping') {
        message.reply('pong');
    }

    // (Opsional) Log ID grup jika dikirim dari grup
    if (message.from.endsWith('@g.us')) {
        console.log(`Grup ID: ${message.from}`);
    }
});

client.initialize();
