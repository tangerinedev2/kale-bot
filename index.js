const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// =========================== FFMPEG YOLU ===========================
const ffmpegStatic = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegStatic;
process.env.FFMPEG = ffmpegStatic;
const ffmpegPath = ffmpegStatic;

// =========================== KONFİG ===========================
require('dotenv').config();
const token = process.env.TOKEN;
const ACIL_DURUM_SIFRE = process.env.ACIL_DURUM_SIFRE || 'KALE2024!';

const GUILD_ID = '1543963769120497805';
const SABIT_SES_KANALI_ID = '1546154071113728101';
const WELCOME_CHANNEL_ID = '1546326748860256266';
const AUTO_ROLE_ID = '1546167155639320618';
const CHAT_CHANNEL_ID = '1546148807236911265';
const LOG_CHANNEL_ID = '1546327530267742420';
const KURAL_KANAL_ID = '1543979515683016715';
const ADMIN_ID = '1332226105221971988';

// DOSYA YOLLARI
const VIDEO_PATH = path.join(__dirname, 'hitabe.mp4');
const ISTIKLAL_PATH = path.join(__dirname, 'istiklal.mp3');
const RESIM_KLASORU = path.join(__dirname, 'resimler');
const MEEM_KLASORU = path.join(__dirname, 'meem');
const USER_LOGS_PATH = path.join(__dirname, 'userlogs');
const AYARLAR_PATH = path.join(__dirname, 'ayarlar.json');

const BAYRAK = '<a:trbayrak:1546565825304072365>';
const YUKLENIYOR = '<a:yukleniyor:1547711418407583765>';
const LOADING = YUKLENIYOR;

// =========================== YETKİ KONTROLÜ ===========================
const ADMIN_ONLY_COMMANDS = [
    'temizle', 'sil', 'kick', 'ban', 'unban',
    'duyuru', 'oylama', 'embed',
    'yedek', 'ayar', 'debug',
    'uyar', 'sustur', 'susturma-kaldır', 'slowmode', 'kanal-kilit', 'kanal-aç'
];

// =========================== EMOJİLER ===========================
const EMOJIS = {
    carpi: '<a:carpi:1546323711567859712>',
    tik: '<a:tik:1546323559008178367>',
    bbknk: '<a:bbknk:1546323191918624768>',
    hosgeldin: '<a:Hosgeldin:1546322757938188308>',
    kale: '<:KALE:1546322596532985896>',
    ataturk: '🇹🇷',
    bayrak: BAYRAK,
    yukleniyor: YUKLENIYOR,
    alev: '🔥',
    kral: '👑',
    para: '💰',
    sohbet: '💬',
    lider: '🏆',
    bilgi: 'ℹ️',
    onay: '✅',
    red: '❌',
    oyun: '🎮',
    silah: '🔫',
    kalp: '❤️',
    zil: '🔔',
    muzik: '🎵',
    uyari: '⚠️',
    hedef: '🎯',
    kalkan: '🛡️',
    kilit: '🔒',
    goz: '👀',
    saat: '🕐',
    kulak: '👂'
};

// =========================== AYARLAR ===========================
let ayarlar = {
    log_mesaj_sil: true,
    log_mesaj_duzenle: true,
    log_uye_katil: true,
    log_uye_ayril: true,
    log_ses: true,
    log_rol: true,
    log_nick: true,
    log_durum: true,
    log_aktivite: true,
    log_profil: true,
    log_tepki: true,
    log_komut: true,
    log_sunucu: true,
    log_emoji: true,
    log_kanal: true,
    log_rol_olustur: true,
    log_rol_guncelle: true,
    log_rol_sil: true,
    log_otomatik_mod: true,
    log_timeout: true
};

function loadAyarlar() {
    try {
        if (fs.existsSync(AYARLAR_PATH)) {
            const data = JSON.parse(fs.readFileSync(AYARLAR_PATH, 'utf8'));
            ayarlar = { ...ayarlar, ...data };
        } else {
            fs.writeFileSync(AYARLAR_PATH, JSON.stringify(ayarlar, null, 2));
        }
    } catch (e) {}
}

function saveAyarlar() {
    try {
        fs.writeFileSync(AYARLAR_PATH, JSON.stringify(ayarlar, null, 2));
    } catch (e) {}
}

// =========================== KULLANICI LOG DB ===========================
if (!fs.existsSync(USER_LOGS_PATH)) fs.mkdirSync(USER_LOGS_PATH, { recursive: true });

function getUserLogPath(userId) {
    return path.join(USER_LOGS_PATH, `${userId}.json`);
}

function createEmptyUserLog(userId) {
    return {
        userId: userId,
        createdAt: new Date().toISOString(),
        messages: [],
        voiceSessions: [],
        voicePeriods: [],
        voiceStats: {},
        commands: [],
        operations: [],
        nicknames: [],
        usernameHistory: [],
        avatarHistory: [],
        statusHistory: [],
        activityHistory: [],
        mentions: [],
        mentionedBy: [],
        reactionsGiven: [],
        reactionsReceived: [],
        links: [],
        files: [],
        emojis: [],
        warnings: [],
        moderation: [],
        joins: [],
        leaves: [],
        activeDays: {},
        dailyStats: {},
        hourlyActivity: {},
        channelActivity: {},
        wordCount: 0,
        characterCount: 0,
        voiceMinutes: 0,
        messageCount: 0,
        lastMessage: null
    };
}

function loadUserLog(userId) {
    const p = getUserLogPath(userId);
    if (fs.existsSync(p)) {
        try {
            return JSON.parse(fs.readFileSync(p, 'utf8'));
        } catch (e) {
            return createEmptyUserLog(userId);
        }
    }
    return createEmptyUserLog(userId);
}

function saveUserLog(userId, data) {
    try {
        fs.writeFileSync(getUserLogPath(userId), JSON.stringify(data, null, 2));
    } catch (e) {}
}

function appendUserLog(userId, category, entry) {
    try {
        const data = loadUserLog(userId);
        if (!data[category]) data[category] = [];
        data[category].push({ ...entry, timestamp: new Date().toISOString() });
        const limits = {
            messages: 1000,
            voiceSessions: 500,
            voicePeriods: 500,
            commands: 500,
            operations: 200,
            mentions: 500,
            mentionedBy: 500,
            reactionsGiven: 500,
            reactionsReceived: 500,
            links: 300,
            files: 300,
            emojis: 500,
            nicknames: 100,
            usernameHistory: 50,
            avatarHistory: 50,
            statusHistory: 200,
            activityHistory: 200,
            warnings: 100,
            moderation: 100
        };
        const limit = limits[category] || 200;
        if (data[category].length > limit) data[category] = data[category].slice(-limit);
        saveUserLog(userId, data);
    } catch (e) {}
}

// =========================== AKTİFLİK TAKİBİ ===========================
const activeSessions = new Map();

function trackActivity(userId, type = 'message') {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const data = loadUserLog(userId);
    
    if (!data.activeDays) data.activeDays = {};
    
    if (!data.activeDays[today]) {
        data.activeDays[today] = {
            date: today,
            firstActivity: now,
            lastActivity: now,
            duration: 0,
            sessions: 1,
            types: { message: 0, voice: 0 }
        };
        activeSessions.set(userId, { start: now, lastUpdate: now, date: today });
    } else {
        const dayData = data.activeDays[today];
        dayData.lastActivity = now;
        const lastSession = activeSessions.get(userId);
        if (!lastSession || (now - lastSession.lastUpdate) > 30 * 60 * 1000) {
            dayData.sessions++;
            activeSessions.set(userId, { start: now, lastUpdate: now, date: today });
        } else {
            lastSession.lastUpdate = now;
        }
        dayData.duration = Math.round((dayData.lastActivity - dayData.firstActivity) / 60000);
    }
    
    if (data.activeDays[today].types) {
        data.activeDays[today].types[type] = (data.activeDays[today].types[type] || 0) + 1;
    }
    saveUserLog(userId, data);
}

// =========================== ATATÜRK VERİLERİ ===========================
let ATATURK_IMAGE = [];
const ATATURK_SOZLER = [
    'Hayatta en hakiki mürşit ilimdir, fendir.',
    'Yurtta sulh, cihanda sulh.',
    'Egemenlik kayıtsız şartsız milletindir.',
    'Ne mutlu Türk\'üm diyene!',
    'İstikbal göklerdedir.',
    'Benim naçiz vücudum elbet bir gün toprak olacaktır, ancak Türkiye Cumhuriyeti ilelebet payidar kalacaktır.',
    'Fikri hür, vicdanı hür, irfanı hür nesiller istiyorum.',
    'Bütün ümidim gençliktedir.'
];

const ATATURK_BILGI = [
    'Mustafa Kemal Atatürk, 1881 yılında Selanik\'te doğdu.',
    'Atatürk, Türkiye Cumhuriyeti\'nin kurucusu ve ilk cumhurbaşkanıdır.',
    'Atatürk, 19 Mayıs 1919\'da Samsun\'a çıkarak Kurtuluş Savaşı\'nı başlattı.',
    'Atatürk, 29 Ekim 1923\'te Cumhuriyet\'i ilan etti.',
    'Atatürk, 10 Kasım 1938\'de İstanbul\'da hayatını kaybetti.'
];

function loadImages() {
    try {
        if (fs.existsSync(RESIM_KLASORU)) {
            ATATURK_IMAGE = fs.readdirSync(RESIM_KLASORU)
                .filter(f => ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(path.extname(f).toLowerCase()));
        } else {
            fs.mkdirSync(RESIM_KLASORU, { recursive: true });
        }
    } catch (e) {}
}

// =========================== MEEM ===========================
function getMeemFiles() {
    try {
        if (!fs.existsSync(MEEM_KLASORU)) {
            fs.mkdirSync(MEEM_KLASORU, { recursive: true });
            return [];
        }
        return fs.readdirSync(MEEM_KLASORU)
            .filter(f => f.endsWith('.mp3'))
            .map(f => path.join(MEEM_KLASORU, f));
    } catch (e) {
        return [];
    }
}

let JUMPSCARE_FILES = getMeemFiles();
const JUMPSCARE_COOLDOWN = {
    maxPerDay: 5,
    chance: 0.01,
    lastReset: Date.now(),
    count: 0,
    enabled: true
};

let audioSettings = { volume: 100, bass: 0 };

// =========================== VERİTABANLARI ===========================
const warnsPath = path.join(__dirname, 'warns.json');
let warns = {};

function loadWarns() {
    try {
        warns = fs.existsSync(warnsPath) ? JSON.parse(fs.readFileSync(warnsPath, 'utf8')) : {};
    } catch (e) {
        warns = {};
    }
}

function saveWarns() {
    try {
        fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
    } catch (e) {}
}

function getUserWarns(userId) {
    if (!warns[userId]) warns[userId] = [];
    return warns[userId];
}

const aktiflikPath = path.join(__dirname, 'aktiflik.json');
let aktiflik = {};

function loadAktiflik() {
    try {
        aktiflik = fs.existsSync(aktiflikPath) ? JSON.parse(fs.readFileSync(aktiflikPath, 'utf8')) : {};
    } catch (e) {
        aktiflik = {};
    }
}

function saveAktiflik() {
    try {
        fs.writeFileSync(aktiflikPath, JSON.stringify(aktiflik, null, 2));
    } catch (e) {}
}

function getUserAktiflik(userId) {
    if (!aktiflik[userId]) {
        aktiflik[userId] = { messages: 0, voiceMinutes: 0, lastMessage: Date.now() };
        saveAktiflik();
    }
    return aktiflik[userId];
}

// =========================== LOG FONKSİYONU ===========================
async function logToChannel(guildId, embed, logType = null) {
    if (logType && !ayarlar[`log_${logType}`]) return;
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;
        const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!channel) return;
        await channel.send({ embeds: [embed] });
    } catch (e) {}
}

function createLogEmbed(title, description, color = 0x2B2D31, fields = [], user = null) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: `KALE Log Sistemi ${BAYRAK}` });
    
    if (user) {
        embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }));
        embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true, size: 64 }) });
    }
    
    fields.forEach(f => {
        embed.addFields({ name: f.name, value: f.value, inline: f.inline || false });
    });
    return embed;
}

// =========================== ACİL DURUM SİSTEMİ ===========================
async function acilDurum(guild) {
    try {
        const channels = guild.channels.cache;
        for (const [id, channel] of channels) {
            if (channel.type === 0 || channel.type === 2 || channel.type === 5) {
                try {
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false,
                        Speak: false,
                        AddReactions: false
                    });
                } catch (e) {}
            }
        }

        const roles = guild.roles.cache.filter(r => r.id !== guild.roles.everyone.id && !r.managed);
        for (const [id, role] of roles) {
            try {
                await role.setPermissions([]);
            } catch (e) {}
        }

        let acilRole = guild.roles.cache.find(r => r.name === 'Acil Durum Yöneticisi');
        if (!acilRole) {
            acilRole = await guild.roles.create({
                name: 'Acil Durum Yöneticisi',
                color: 0xFF0000,
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: 'Acil Durum Sistemi'
            });
        } else {
            await acilRole.setPermissions([PermissionsBitField.Flags.Administrator]);
        }

        const adminMember = await guild.members.fetch(ADMIN_ID).catch(() => null);
        if (adminMember) {
            await adminMember.roles.add(acilRole);
        }

        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('ACİL DURUM AKTİF!')
                .setDescription(`Sunucu kilitlendi, tüm rollerin yetkileri sıfırlandı.\n<@${ADMIN_ID}> adlı kullanıcıya **Acil Durum Yöneticisi** rolü verildi.`)
                .setTimestamp()
                .setFooter({ text: `KALE Acil Durum ${BAYRAK}` });
            await logChannel.send({ embeds: [embed] });
        }

        return true;
    } catch (e) {
        console.error('Acil durum hatası:', e);
        return false;
    }
}

// =========================== EXPRESS SERVER ===========================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// =========================== API ENDPOINT'LERİ ===========================
app.get('/api/jumpscare/stats', (req, res) => {
    res.json({
        success: true,
        count: JUMPSCARE_COOLDOWN.count,
        maxPerDay: JUMPSCARE_COOLDOWN.maxPerDay,
        enabled: JUMPSCARE_COOLDOWN.enabled,
        chance: JUMPSCARE_COOLDOWN.chance,
        toplamDosya: JUMPSCARE_FILES.length,
        logs: []
    });
});

app.post('/api/jumpscare/settings', (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled === 'boolean') {
        JUMPSCARE_COOLDOWN.enabled = enabled;
        res.json({ success: true, enabled: JUMPSCARE_COOLDOWN.enabled });
    } else {
        res.json({ success: false, error: 'enabled boolean olmalı' });
    }
});

app.get('/api/audio/settings', (req, res) => {
    res.json({
        success: true,
        settings: {
            volume: audioSettings.volume,
            bass: audioSettings.bass
        }
    });
});

app.post('/api/audio/settings', (req, res) => {
    const { volume, bass } = req.body;
    if (typeof volume === 'number') audioSettings.volume = Math.max(0, Math.min(200, volume));
    if (typeof bass === 'number') audioSettings.bass = Math.max(-10, Math.min(10, bass));
    res.json({
        success: true,
        settings: {
            volume: audioSettings.volume,
            bass: audioSettings.bass
        }
    });
});

app.get('/api/sounds', (req, res) => {
    try {
        const files = getMeemFiles().map(f => ({ name: path.basename(f, '.mp3') }));
        res.json({ success: true, sounds: files });
    } catch (e) {
        res.json({ success: false, error: e.message, sounds: [] });
    }
});

app.post('/api/playsound/:soundName', async (req, res) => {
    try {
        const soundName = req.params.soundName;
        const targetId = req.query.target;
        console.log(`🎵 Panel ses çalma isteği: ${soundName} → ${targetId}`);
        
        if (!targetId) return res.json({ success: false, error: 'Hedef kullanıcı yok' });

        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return res.json({ success: false, error: 'Sunucu yok' });

        const member = guild.members.cache.get(targetId);
        if (!member) return res.json({ success: false, error: 'Kullanıcı bulunamadı' });
        if (!member.voice.channel) return res.json({ success: false, error: 'Kullanıcı seste değil' });

        const filePath = path.join(MEEM_KLASORU, `${soundName}.mp3`);
        console.log(`📂 Dosya yolu: ${filePath}`);
        if (!fs.existsSync(filePath)) return res.json({ success: false, error: `Dosya bulunamadı: ${soundName}.mp3` });

        const ok = await playCustomSound(GUILD_ID, member.voice.channel.id, null, null, filePath, soundName, audioSettings.bass);
        console.log(`🎵 playCustomSound sonucu: ${ok}`);
        
        if (ok) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'Ses çalınamadı (playCustomSound false döndü)' });
        }
    } catch (e) {
        console.error('❌ playsound hatası:', e);
        res.json({ success: false, error: e.message });
    }
});

// =========================== SOCKET.IO ===========================
io.on('connection', (socket) => {
    console.log('🔌 Panel bağlandı');

    const sendUsers = async () => {
        try {
            const guild = client.guilds.cache.get(GUILD_ID);
            if (!guild) return;
            const sesliKanallar = guild.channels.cache.filter(ch => ch.type === 2);
            const uyeler = [];
            sesliKanallar.forEach(kanal => {
                kanal.members.forEach(member => {
                    if (!member.user.bot) {
                        uyeler.push({
                            id: member.id,
                            username: member.user.username,
                            displayName: member.displayName,
                            avatar: member.user.displayAvatarURL({ dynamic: true, size: 128 }),
                            channelId: kanal.id,
                            channelName: kanal.name
                        });
                    }
                });
            });
            socket.emit('users_update', uyeler);
        } catch (e) {}
    };

    sendUsers();
    const interval = setInterval(sendUsers, 5000);

    socket.on('disconnect', () => {
        clearInterval(interval);
    });
});

server.listen(3000, () => console.log(`🌐 Web: http://localhost:3000`));

// =========================== BOT ===========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks
    ],
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User]
});

// =========================== READY ===========================
client.once('ready', async () => {
    loadImages();
    loadWarns();
    loadAktiflik();
    loadAyarlar();
    JUMPSCARE_FILES = getMeemFiles();
    
    console.log(`✅ ${client.user.tag} hazır! ${BAYRAK}`);
    console.log(`🎵 ${JUMPSCARE_FILES.length} meem dosyası`);
    console.log(`💣 Güvenlik modülü hazır!`);
    console.log(`📂 Kullanıcı log sistemi aktif!`);
    console.log(`🔐 Acil durum sistemi aktif!`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        console.log(`✅ Bot "${guild.name}" sunucusunda!`);
        const voiceChannel = guild.channels.cache.get(SABIT_SES_KANALI_ID);
        if (voiceChannel && voiceChannel.type === 2) {
            const existingConnection = getVoiceConnection(GUILD_ID);
            if (!existingConnection) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                console.log(`✅ Sabit kanalda!`);
            }
        }
    } catch (e) {}

    // Slash komutları kaydet (yardim + aktifgelistirici)
    try {
        await client.application.commands.set([
            { name: 'yardim', description: 'Tüm komutları gösterir.' },
            { name: 'aktifgelistirici', description: 'Discord Aktif Geliştirici Rozeti talep komutu' }
        ]);
        console.log('✅ Slash komutlar kaydedildi!');
    } catch (e) {
        console.error('❌ Slash komut kaydı başarısız:', e);
    }

    await updateBotStatus();
    setInterval(updateBotStatus, 30000);

    // Komutları yükle (komutlar.js'den birleştirilmiş hali)
    require('./komutlar.js')(client, EMOJIS, BAYRAK, LOADING, GUILD_ID, ADMIN_ID, LOG_CHANNEL_ID, KURAL_KANAL_ID, ACIL_DURUM_SIFRE, acilDurum, ayarlar, saveAyarlar, appendUserLog, loadUserLog, saveUserLog, getUserAktiflik, saveAktiflik, getUserWarns, saveWarns, warns, ATATURK_IMAGE, ATATURK_SOZLER, ATATURK_BILGI, RESIM_KLASORU, VIDEO_PATH, ISTIKLAL_PATH, ffmpegPath, audioSettings, playVideoWithAudio, playIstiklal, playCustomSound, playJumpscare, returnToFixedChannel, getMeemFiles, JUMPSCARE_COOLDOWN, JUMPSCARE_FILES);
    // NOT: Müzik (muzik.js) yüklenmiyor - RAM tasarrufu için.
});

// =========================== DURUM ===========================
let statusIndex = 0;

async function updateBotStatus() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const memberCount = guild.memberCount;
        const aktif = guild.members.cache.filter(m => 
            m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd'
        ).size;

        const statuses = [
            { name: `${memberCount} Kişiye Hizmet Ediyor!`, type: 3 },
            { name: 'KALE\'de her şey senin için!', type: 3 },
            { name: 'Herşey KALE için.', type: 3 },
            { name: 'KALE Biz bir aileyiz.', type: 3 },
            { name: `${aktif} Kişi Aktif! ${EMOJIS.alev}`, type: 3 },
            { name: '🛡️ Güvenlik Aktif', type: 3 }
        ];

        client.user.setPresence({
            activities: [statuses[statusIndex % statuses.length]],
            status: 'online'
        });
        statusIndex++;
    } catch (e) {}
}

// =========================== ÜYE KATILDI ===========================
client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
        try {
            const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
            if (role) await member.roles.add(role);
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xE30A17)
            .setTitle('HOŞ GELDİN!')
            .setDescription(`
                ${EMOJIS.kale} **${member.user.globalName || member.user.username}** aramıza katıldı!
                ${EMOJIS.bbknk} Sunucumuz **${member.guild.memberCount}** kişi oldu!
                ${EMOJIS.tik} **Kuralları okumayı unutma!**
                ${BAYRAK} *Ne mutlu Türk'üm diyene!*
            `)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `KALE Ailesi ${BAYRAK}`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('kurallar').setLabel('📜 Kurallar').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('hosgeldin').setLabel('👋 Selam Ver').setStyle(ButtonStyle.Success)
            );
        await channel.send({ embeds: [embed], components: [row] });
    }

    appendUserLog(member.id, 'joins', { tag: member.user.tag });
    await logToChannel(member.guild.id, createLogEmbed('ÜYE KATILDI', `**${member.user.tag}** katıldı.`, 0x00FF00, [
        { name: 'Kullanıcı', value: `\`${member.user.tag}\``, inline: true },
        { name: 'ID', value: `\`${member.id}\``, inline: true },
        { name: 'Hesap', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:f>`, inline: true },
        { name: 'Toplam', value: `\`${member.guild.memberCount}\``, inline: true }
    ], member.user), 'uye_katil');
});

// =========================== ÜYE AYRILDI ===========================
client.on('guildMemberRemove', async (member) => {
    if (member.guild.id !== GUILD_ID) return;

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle('GÜLE GÜLE!')
            .setDescription(`
                ${EMOJIS.kale} **${member.user.globalName || member.user.username}** ayrıldı.
                ${EMOJIS.carpi} *Umarız tekrar görüşürüz!*
            `)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `KALE Ailesi ${BAYRAK}`, iconURL: member.guild.iconURL() })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    }

    appendUserLog(member.id, 'leaves', { tag: member.user.tag });
    await logToChannel(member.guild.id, createLogEmbed('ÜYE AYRILDI', `**${member.user.tag}** ayrıldı.`, 0xFF0000, [
        { name: 'Kullanıcı', value: `\`${member.user.tag}\``, inline: true },
        { name: 'ID', value: `\`${member.id}\``, inline: true },
        { name: 'Toplam', value: `\`${member.guild.memberCount}\``, inline: true }
    ], member.user), 'uye_ayril');
});

// =========================== MESAJ SİLİNDİ ===========================
client.on('messageDelete', async (message) => {
    if (!message.guild || message.guild.id !== GUILD_ID) return;
    if (message.author?.bot || message.partial) return;

    appendUserLog(message.author.id, 'operations', {
        type: 'messageDelete',
        channel: message.channel.name,
        content: message.content?.slice(0, 500)
    });

    await logToChannel(message.guild.id, createLogEmbed('MESAJ SİLİNDİ', `**${message.author.tag}** bir mesaj sildi.`, 0xFF0000, [
        { name: 'Kullanıcı', value: `\`${message.author.tag}\``, inline: true },
        { name: 'ID', value: `\`${message.author.id}\``, inline: true },
        { name: 'Kanal', value: `<#${message.channel.id}>`, inline: true },
        { name: 'İçerik', value: `\`\`\`${message.content || '*(Boş)*'}\`\`\`` }
    ], message.author), 'mesaj_sil');
});

// =========================== MESAJ DÜZENLENDİ ===========================
client.on('messageUpdate', async (oldM, newM) => {
    if (!oldM.guild || oldM.guild.id !== GUILD_ID) return;
    if (oldM.author?.bot || oldM.partial || newM.partial) return;
    if (oldM.content === newM.content) return;

    appendUserLog(oldM.author.id, 'operations', {
        type: 'messageEdit',
        channel: oldM.channel.name,
        old: oldM.content?.slice(0, 300),
        new: newM.content?.slice(0, 300)
    });

    await logToChannel(oldM.guild.id, createLogEmbed('MESAJ DÜZENLENDİ', `**${oldM.author.tag}** bir mesajı düzenledi.`, 0xFFA500, [
        { name: 'Kullanıcı', value: `\`${oldM.author.tag}\``, inline: true },
        { name: 'ID', value: `\`${oldM.author.id}\``, inline: true },
        { name: 'Kanal', value: `<#${oldM.channel.id}>`, inline: true },
        { name: 'Eski', value: `\`\`\`${oldM.content || '*(Boş)*'}\`\`\`` },
        { name: 'Yeni', value: `\`\`\`${newM.content || '*(Boş)*'}\`\`\`` }
    ], oldM.author), 'mesaj_duzenle');
});

// =========================== ROL DEĞİŞİKLİĞİ ===========================
client.on('guildMemberUpdate', async (oldM, newM) => {
    if (oldM.guild.id !== GUILD_ID || oldM.user.bot) return;

    const oldRoles = oldM.roles.cache.map(r => r.id);
    const newRoles = newM.roles.cache.map(r => r.id);
    const added = newRoles.filter(r => !oldRoles.includes(r));
    const removed = oldRoles.filter(r => !newRoles.includes(r));

    if (added.length > 0) {
        appendUserLog(oldM.id, 'roles', {
            type: 'add',
            roles: added.map(id => oldM.guild.roles.cache.get(id)?.name)
        });
        await logToChannel(oldM.guild.id, createLogEmbed('ROL EKLENDİ', `**${oldM.user.tag}** kullanıcısına rol eklendi.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldM.id}\``, inline: true },
            { name: 'Rol', value: added.map(id => `<@&${id}>`).join(', '), inline: true }
        ], oldM.user), 'rol');
    }

    if (removed.length > 0) {
        appendUserLog(oldM.id, 'roles', {
            type: 'remove',
            roles: removed.map(id => oldM.guild.roles.cache.get(id)?.name)
        });
        await logToChannel(oldM.guild.id, createLogEmbed('ROL ALINDI', `**${oldM.user.tag}** kullanıcısından rol alındı.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldM.id}\``, inline: true },
            { name: 'Rol', value: removed.map(id => `<@&${id}>`).join(', '), inline: true }
        ], oldM.user), 'rol');
    }

    if (oldM.nickname !== newM.nickname) {
        appendUserLog(oldM.id, 'nicknames', { old: oldM.nickname, new: newM.nickname });
        await logToChannel(oldM.guild.id, createLogEmbed('NICK DEĞİŞTİ', `**${oldM.user.tag}** nick değiştirdi.`, 0xFFA500, [
            { name: 'Kullanıcı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldM.id}\``, inline: true },
            { name: 'Eski', value: `\`${oldM.nickname || 'Yok'}\``, inline: true },
            { name: 'Yeni', value: `\`${newM.nickname || 'Yok'}\``, inline: true }
        ], oldM.user), 'nick');
    }
});

// =========================== DURUM VE AKTİVİTE ===========================
client.on('presenceUpdate', async (oldP, newP) => {
    if (!newP || newP.guild.id !== GUILD_ID || newP.user.bot) return;

    if (oldP?.status !== newP.status) {
        appendUserLog(newP.user.id, 'statusHistory', {
            old: oldP?.status || 'offline',
            new: newP.status
        });
        await logToChannel(newP.guild.id, createLogEmbed('DURUM DEĞİŞTİ', `**${newP.user.tag}** durumunu değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `\`${newP.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${newP.user.id}\``, inline: true },
            { name: 'Eski', value: `\`${oldP?.status || 'offline'}\``, inline: true },
            { name: 'Yeni', value: `\`${newP.status}\``, inline: true }
        ], newP.user), 'durum');
    }

    const oldA = oldP?.activities[0];
    const newA = newP.activities[0];
    if (oldA?.name !== newA?.name) {
        appendUserLog(newP.user.id, 'activityHistory', {
            old: oldA?.name || null,
            new: newA?.name || null
        });
        await logToChannel(newP.guild.id, createLogEmbed('AKTİVİTE DEĞİŞTİ', `**${newP.user.tag}** aktivitesini değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `\`${newP.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${newP.user.id}\``, inline: true },
            { name: 'Eski', value: `\`${oldA?.name || 'Yok'}\``, inline: true },
            { name: 'Yeni', value: `\`${newA?.name || 'Yok'}\``, inline: true }
        ], newP.user), 'aktivite');
    }
});

// =========================== PROFİL DEĞİŞİKLİĞİ ===========================
client.on('userUpdate', async (oldU, newU) => {
    if (newU.bot) return;

    if (oldU.displayAvatarURL() !== newU.displayAvatarURL()) {
        appendUserLog(newU.id, 'avatarHistory', {
            old: oldU.displayAvatarURL(),
            new: newU.displayAvatarURL()
        });
        await logToChannel(GUILD_ID, createLogEmbed('AVATAR DEĞİŞTİ', `**${newU.tag}** avatarını değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `\`${newU.tag}\``, inline: true },
            { name: 'ID', value: `\`${newU.id}\``, inline: true }
        ], newU), 'profil');
    }

    if (oldU.username !== newU.username) {
        appendUserLog(newU.id, 'usernameHistory', {
            old: oldU.username,
            new: newU.username
        });
        await logToChannel(GUILD_ID, createLogEmbed('KULLANICI ADI DEĞİŞTİ', `**${oldU.tag}** kullanıcı adını değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `\`${oldU.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldU.id}\``, inline: true },
            { name: 'Eski', value: `\`${oldU.username}\``, inline: true },
            { name: 'Yeni', value: `\`${newU.username}\``, inline: true }
        ], newU), 'profil');
    }
});

// =========================== TEPKİLER ===========================
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.guild?.id !== GUILD_ID) return;
    if (reaction.partial) {
        try { await reaction.fetch(); } catch (e) { return; }
    }
    if (reaction.message.partial) {
        try { await reaction.message.fetch(); } catch (e) { return; }
    }

    appendUserLog(user.id, 'reactionsGiven', {
        emoji: reaction.emoji.name,
        messageAuthor: reaction.message.author?.username || 'Bilinmiyor',
        channel: reaction.message.channel.name
    });

    if (reaction.message.author && !reaction.message.author.bot) {
        appendUserLog(reaction.message.author.id, 'reactionsReceived', {
            emoji: reaction.emoji.name,
            from: user.username,
            fromId: user.id
        });
    }

    await logToChannel(GUILD_ID, createLogEmbed('TEPKİ EKLENDİ', `**${user.tag}** bir mesaja tepki ekledi.`, 0x4FC3F7, [
        { name: 'Kullanıcı', value: `\`${user.tag}\``, inline: true },
        { name: 'ID', value: `\`${user.id}\``, inline: true },
        { name: 'Emoji', value: `\`${reaction.emoji.name}\``, inline: true },
        { name: 'Kanal', value: `<#${reaction.message.channel.id}>`, inline: true }
    ], user), 'tepki');
});

// =========================== SES ===========================
const voiceJoinTimes = new Map();

client.on('voiceStateUpdate', async (oldS, newS) => {
    if (oldS.guild.id !== GUILD_ID || oldS.member.user.bot || oldS.member.id === client.user.id) return;
    const userId = oldS.member.id;

    if (!oldS.channel && newS.channel) {
        voiceJoinTimes.set(userId, { start: Date.now(), channel: newS.channel.name });
        appendUserLog(userId, 'voiceSessions', {
            type: 'join',
            channel: newS.channel.name,
            channelId: newS.channel.id,
            startTime: new Date().toISOString()
        });
        trackActivity(userId, 'voice');
        await logToChannel(oldS.guild.id, createLogEmbed('SESE GİRDİ', `**${oldS.member.user.tag}** sese girdi.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `\`${oldS.member.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldS.member.id}\``, inline: true },
            { name: 'Kanal', value: `<#${newS.channel.id}>`, inline: true }
        ], oldS.member.user), 'ses');
    }

    if (oldS.channel && !newS.channel) {
        const session = voiceJoinTimes.get(userId);
        const duration = session ? Math.round((Date.now() - session.start) / 60000) : 0;
        voiceJoinTimes.delete(userId);
        const startTime = session ? new Date(session.start) : new Date();
        const endTime = new Date();

        appendUserLog(userId, 'voicePeriods', {
            channel: oldS.channel.name,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            formatted: `${startTime.toLocaleString('tr-TR')} - ${endTime.toLocaleString('tr-TR')} (${duration} dk)`
        });
        appendUserLog(userId, 'voiceSessions', {
            type: 'leave',
            channel: oldS.channel.name,
            duration,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });

        const data = loadUserLog(userId);
        data.voiceMinutes = (data.voiceMinutes || 0) + duration;
        if (!data.voiceStats) data.voiceStats = {};
        if (!data.voiceStats[oldS.channel.name]) data.voiceStats[oldS.channel.name] = 0;
        data.voiceStats[oldS.channel.name] += duration;
        saveUserLog(userId, data);
        trackActivity(userId, 'voice');

        await logToChannel(oldS.guild.id, createLogEmbed('SESTEN ÇIKTI', `**${oldS.member.user.tag}** sesten çıktı.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `\`${oldS.member.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${oldS.member.id}\``, inline: true },
            { name: 'Süre', value: `\`${duration} dakika\``, inline: true }
        ], oldS.member.user), 'ses');
    }

    if (oldS.channel && newS.channel && oldS.channel.id !== newS.channel.id) {
        const session = voiceJoinTimes.get(userId);
        const duration = session ? Math.round((Date.now() - session.start) / 60000) : 0;
        const startTime = session ? new Date(session.start) : new Date();
        const endTime = new Date();

        appendUserLog(userId, 'voicePeriods', {
            channel: oldS.channel.name,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            formatted: `${startTime.toLocaleString('tr-TR')} - ${endTime.toLocaleString('tr-TR')} (${duration} dk)`
        });
        voiceJoinTimes.set(userId, { start: Date.now(), channel: newS.channel.name });
        appendUserLog(userId, 'voiceSessions', {
            type: 'switch',
            from: oldS.channel.name,
            to: newS.channel.name,
            duration
        });
    }
});

// =========================== SUNUCU GÜNCELLENDİ ===========================
client.on('guildUpdate', async (oldG, newG) => {
    if (oldG.id !== GUILD_ID) return;
    
    const changes = [];
    if (oldG.name !== newG.name) changes.push(`İsim: \`${oldG.name}\` → \`${newG.name}\``);
    if (oldG.iconURL() !== newG.iconURL()) changes.push(`İkon değişti`);
    if (oldG.bannerURL() !== newG.bannerURL()) changes.push(`Banner değişti`);
    if (oldG.description !== newG.description) changes.push(`Açıklama değişti`);
    if (oldG.verificationLevel !== newG.verificationLevel) changes.push(`Doğrulama seviyesi: \`${oldG.verificationLevel}\` → \`${newG.verificationLevel}\``);
    
    if (changes.length > 0) {
        await logToChannel(GUILD_ID, createLogEmbed('SUNUCU GÜNCELLENDİ', `Sunucu ayarları güncellendi.`, 0x4FC3F7, [
            { name: 'Değişiklikler', value: changes.join('\n') }
        ], null), 'sunucu');
    }
});

// =========================== EMOJİ OLAYLARI ===========================
client.on('emojiCreate', async (emoji) => {
    if (emoji.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ OLUŞTURULDU', `**${emoji.name}** emojisi oluşturuldu.`, 0x00FF00, [
        { name: 'Emoji', value: `${emoji} \`${emoji.name}\``, inline: true },
        { name: 'ID', value: `\`${emoji.id}\``, inline: true }
    ], null), 'emoji');
});

client.on('emojiUpdate', async (oldE, newE) => {
    if (oldE.guild.id !== GUILD_ID) return;
    if (oldE.name === newE.name) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ GÜNCELLENDİ', `**${oldE.name}** → **${newE.name}**`, 0xFFA500, [
        { name: 'Eski', value: `\`${oldE.name}\``, inline: true },
        { name: 'Yeni', value: `\`${newE.name}\``, inline: true }
    ], null), 'emoji');
});

client.on('emojiDelete', async (emoji) => {
    if (emoji.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ SİLİNDİ', `**${emoji.name}** emojisi silindi.`, 0xFF0000, [
        { name: 'Emoji', value: `\`${emoji.name}\``, inline: true },
        { name: 'ID', value: `\`${emoji.id}\``, inline: true }
    ], null), 'emoji');
});

// =========================== KANAL OLAYLARI ===========================
client.on('channelCreate', async (channel) => {
    if (channel.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('KANAL OLUŞTURULDU', `**${channel.name}** kanalı oluşturuldu.`, 0x00FF00, [
        { name: 'Kanal', value: `${channel} \`${channel.name}\``, inline: true },
        { name: 'Tip', value: `\`${channel.type}\``, inline: true },
        { name: 'ID', value: `\`${channel.id}\``, inline: true }
    ], null), 'kanal');
});

client.on('channelUpdate', async (oldC, newC) => {
    if (oldC.guild.id !== GUILD_ID) return;
    if (oldC.name === newC.name && oldC.parentId === newC.parentId && oldC.position === newC.position) return;
    
    const changes = [];
    if (oldC.name !== newC.name) changes.push(`İsim: \`${oldC.name}\` → \`${newC.name}\``);
    if (oldC.parentId !== newC.parentId) changes.push(`Kategori değişti`);
    if (oldC.position !== newC.position) changes.push(`Sıra: \`${oldC.position}\` → \`${newC.position}\``);
    
    await logToChannel(GUILD_ID, createLogEmbed('KANAL GÜNCELLENDİ', `**${newC.name}** kanalı güncellendi.`, 0xFFA500, [
        { name: 'Kanal', value: `${newC}`, inline: true },
        { name: 'Değişiklikler', value: changes.join('\n') }
    ], null), 'kanal');
});

client.on('channelDelete', async (channel) => {
    if (channel.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('KANAL SİLİNDİ', `**${channel.name}** kanalı silindi.`, 0xFF0000, [
        { name: 'Kanal', value: `\`${channel.name}\``, inline: true },
        { name: 'Tip', value: `\`${channel.type}\``, inline: true },
        { name: 'ID', value: `\`${channel.id}\``, inline: true }
    ], null), 'kanal');
});

// =========================== ROL OLAYLARI ===========================
client.on('roleCreate', async (role) => {
    if (role.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('ROL OLUŞTURULDU', `**${role.name}** rolü oluşturuldu.`, 0x00FF00, [
        { name: 'Rol', value: `${role} \`${role.name}\``, inline: true },
        { name: 'Renk', value: `\`${role.hexColor}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true }
    ], null), 'rol_olustur');
});

client.on('roleUpdate', async (oldR, newR) => {
    if (oldR.guild.id !== GUILD_ID) return;
    if (oldR.name === newR.name && oldR.hexColor === newR.hexColor && oldR.permissions.bitfield === newR.permissions.bitfield) return;
    
    const changes = [];
    if (oldR.name !== newR.name) changes.push(`İsim: \`${oldR.name}\` → \`${newR.name}\``);
    if (oldR.hexColor !== newR.hexColor) changes.push(`Renk: \`${oldR.hexColor}\` → \`${newR.hexColor}\``);
    if (oldR.permissions.bitfield !== newR.permissions.bitfield) changes.push(`İzinler değişti`);
    
    await logToChannel(GUILD_ID, createLogEmbed('ROL GÜNCELLENDİ', `**${newR.name}** rolü güncellendi.`, 0xFFA500, [
        { name: 'Rol', value: `${newR}`, inline: true },
        { name: 'Değişiklikler', value: changes.join('\n') }
    ], null), 'rol_guncelle');
});

client.on('roleDelete', async (role) => {
    if (role.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('ROL SİLİNDİ', `**${role.name}** rolü silindi.`, 0xFF0000, [
        { name: 'Rol', value: `\`${role.name}\``, inline: true },
        { name: 'Renk', value: `\`${role.hexColor}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true }
    ], null), 'rol_sil');
});

// =========================== OTOMATİK MODERASYON ===========================
client.on('autoModerationActionExecution', async (execution) => {
    if (execution.guild.id !== GUILD_ID) return;
    const user = await client.users.fetch(execution.userId).catch(() => null);
    await logToChannel(GUILD_ID, createLogEmbed('OTOMATİK MODERASYON', `Bir kullanıcıya otomatik moderasyon uygulandı.`, 0xFF0000, [
        { name: 'Kullanıcı', value: `<@${execution.userId}> (\`${execution.userId}\`)`, inline: true },
        { name: 'Kanal', value: `<#${execution.channelId}>`, inline: true },
        { name: 'Kural', value: `\`${execution.ruleTriggerType}\``, inline: true },
        { name: 'İçerik', value: `\`\`\`${execution.content || '*(Boş)*'}\`\`\`` }
    ], user), 'otomatik_mod');
});

// =========================== TIMEOUT (SUSTURMA) ===========================
client.on('guildMemberUpdate', async (oldM, newM) => {
    if (oldM.guild.id !== GUILD_ID || oldM.user.bot) return;
    
    if (!oldM.communicationDisabledUntil && newM.communicationDisabledUntil) {
        await logToChannel(GUILD_ID, createLogEmbed('ÜYE SUSTURULDU', `**${newM.user.tag}** susturuldu.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `\`${newM.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${newM.id}\``, inline: true },
            { name: 'Bitiş', value: `<t:${Math.floor(newM.communicationDisabledUntilTimestamp/1000)}:f>`, inline: true }
        ], newM.user), 'timeout');
    } else if (oldM.communicationDisabledUntil && !newM.communicationDisabledUntil) {
        await logToChannel(GUILD_ID, createLogEmbed('ÜYE SUSTURMASI KALDIRILDI', `**${newM.user.tag}** susturması kaldırıldı.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `\`${newM.user.tag}\``, inline: true },
            { name: 'ID', value: `\`${newM.id}\``, inline: true }
        ], newM.user), 'timeout');
    }
});

// =========================== SA KOMUTU ===========================
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild?.id !== GUILD_ID) return;
    
    const content = message.content.toLowerCase().trim();
    if (content === 'sa') {
        const embed = new EmbedBuilder()
            .setColor(0xE30A17)
            .setDescription(`
                ${EMOJIS.kale} **Aleyküm Selam, ${message.author.globalName || message.author.username}!**
                ${EMOJIS.hosgeldin} *Hoş geldin!*
                ${BAYRAK} **Ne mutlu Türk'üm diyene!**
            `)
            .setFooter({ text: `KALE ${BAYRAK}`, iconURL: message.guild.iconURL() })
            .setTimestamp();
        try {
            await message.channel.send({ embeds: [embed] });
        } catch (e) {
            console.error('SA komutu hatası:', e.message);
        }
    }
});

// =========================== DETAYLI MESAJ LOG ===========================
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild?.id !== GUILD_ID) return;
    const userId = message.author.id;

    appendUserLog(userId, 'messages', {
        id: message.id,
        channel: message.channel.name,
        channelId: message.channel.id,
        content: message.content?.slice(0, 2000) || '',
        length: message.content?.length || 0,
        attachments: message.attachments.map(a => ({ name: a.name, url: a.url, size: a.size })),
        embeds: message.embeds.length,
        stickers: message.stickers.map(s => s.name),
        mentions: message.mentions.users.map(u => u.id),
        mentionEveryone: message.mentions.everyone
    });

    const data = loadUserLog(userId);
    data.messageCount = (data.messageCount || 0) + 1;
    data.wordCount = (data.wordCount || 0) + (message.content?.split(/\s+/).filter(w => w).length || 0);
    data.characterCount = (data.characterCount || 0) + (message.content?.length || 0);
    data.lastMessage = Date.now();

    const today = new Date().toISOString().split('T')[0];
    if (!data.dailyStats) data.dailyStats = {};
    if (!data.dailyStats[today]) data.dailyStats[today] = { messages: 0, voiceMinutes: 0 };
    data.dailyStats[today].messages++;

    const hour = new Date().getHours();
    if (!data.hourlyActivity) data.hourlyActivity = {};
    data.hourlyActivity[hour] = (data.hourlyActivity[hour] || 0) + 1;

    if (!data.channelActivity) data.channelActivity = {};
    data.channelActivity[message.channel.name] = (data.channelActivity[message.channel.name] || 0) + 1;

    const links = message.content.match(/https?:\/\/[^\s]+/g) || [];
    links.forEach(link => {
        if (!data.links) data.links = [];
        data.links.push({ url: link, channel: message.channel.name, timestamp: new Date().toISOString() });
    });

    message.attachments.forEach(att => {
        if (!data.files) data.files = [];
        data.files.push({ name: att.name, url: att.url, size: att.size, channel: message.channel.name, timestamp: new Date().toISOString() });
    });

    const emojiMatches = message.content.match(/<a?:\w+:\d+>/g) || [];
    const unicodeEmojis = message.content.match(/[\u{1F600}-\u{1F64F}]/gu) || [];
    [...emojiMatches, ...unicodeEmojis].forEach(emoji => {
        if (!data.emojis) data.emojis = [];
        data.emojis.push({ emoji, channel: message.channel.name, timestamp: new Date().toISOString() });
    });

    message.mentions.users.forEach(u => {
        if (!data.mentions) data.mentions = [];
        data.mentions.push({ userId: u.id, username: u.username, channel: message.channel.name, timestamp: new Date().toISOString() });
        appendUserLog(u.id, 'mentionedBy', { userId, username: message.author.username, channel: message.channel.name });
    });

    if (data.mentions && data.mentions.length > 500) data.mentions = data.mentions.slice(-500);
    if (data.links && data.links.length > 300) data.links = data.links.slice(-300);
    if (data.files && data.files.length > 300) data.files = data.files.slice(-300);
    if (data.emojis && data.emojis.length > 500) data.emojis = data.emojis.slice(-500);

    saveUserLog(userId, data);
    trackActivity(userId, 'message');

    const ud = getUserAktiflik(userId);
    ud.messages = (ud.messages || 0) + 1;
    ud.lastMessage = Date.now();
    saveAktiflik();

    if (!JUMPSCARE_COOLDOWN.enabled) return;
    try {
        const vs = message.member.voice;
        if (vs && vs.channel) playJumpscare(message.guild.id, vs.channel.id).catch(() => {});
    } catch (e) {}
});

// =========================== BUTONLAR ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== GUILD_ID) return;

    if (interaction.customId === 'kurallar') {
        await interaction.reply({ content: `📜 **Kurallar:** <#${KURAL_KANAL_ID}>`, ephemeral: true });
    }
    if (interaction.customId === 'hosgeldin') {
        await interaction.reply({ content: `${EMOJIS.kale} **Hoş Geldin!** ${BAYRAK}`, ephemeral: true });
    }
    if (interaction.customId === 'oylama_evet' || interaction.customId === 'oylama_hayir') {
        await interaction.reply({ content: `${EMOJIS.onay} **Oyunuz kaydedildi!**`, ephemeral: true });
    }
    if (interaction.customId === 'duello_kabul') {
        await interaction.reply({ content: `⚔️ **${interaction.user}** düelloyu kabul etti!` });
    }
    if (interaction.customId === 'duello_red') {
        await interaction.reply({ content: `❌ **${interaction.user}** düelloyu reddetti.` });
    }
});

// =========================== SLASH ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'yardim') {
        const embed = new EmbedBuilder()
            .setColor(0xE30A17)
            .setTitle('KALE BOT')
            .setDescription('Tüm komutlar `k!` ile başlar. `k!yardim` yazarak detayları görebilirsin.')
            .setFooter({ text: `KALE ${BAYRAK}` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'aktifgelistirici') {
        await interaction.reply({
            content:
                `${EMOJIS.onay} **Aktif Geliştirici Rozeti** başvuru rehberi:\n\n` +
                `**1.** https://discord.com/developers/active-developer adresine git\n` +
                `**2.** Hesabına giriş yap, botunu seç\n` +
                `**3.** Gerekli şartları tamamla:\n` +
                `   • Botun en az **1 sunucuda** olmalı\n` +
                `   • En az **1 slash komut** çalıştırılmış olmalı (\`/yardim\` yeter)\n` +
                `   • Hesabında **2FA** açık olmalı\n` +
                `**4.** **Submit** butonuna bas\n\n` +
                `**Not:** Rozet 24 saat içinde hesabına düşer.`,
            ephemeral: true
        });
    }
});

// =========================== HATA ===========================
process.on('unhandledRejection', e => console.error('❌ Hata:', e));

// =========================== SES FONKSİYONLARI ===========================
async function returnToFixedChannel(guildId) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;
        const hedefKanal = guild.channels.cache.get(SABIT_SES_KANALI_ID);
        if (!hedefKanal || hedefKanal.type !== 2) return;
        const mevcutBaglanti = getVoiceConnection(guildId);
        if (!mevcutBaglanti || mevcutBaglanti.joinConfig.channelId !== SABIT_SES_KANALI_ID) {
            if (mevcutBaglanti) mevcutBaglanti.destroy();
            const connection = joinVoiceChannel({
                channelId: hedefKanal.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
        }
    } catch (e) {}
}

async function playVideoWithAudio(guildId, channelId, textChannel, userId) {
    try {
        if (!fs.existsSync(VIDEO_PATH)) {
            if (textChannel) textChannel.send(`${EMOJIS.carpi} **hitabe.mp4** bulunamadı!`);
            return false;
        }
        const guild = client.guilds.cache.get(guildId);
        if (!guild) throw new Error('Sunucu yok');
        const voiceChannel = guild.channels.cache.get(channelId);
        if (!voiceChannel || voiceChannel.type !== 2) throw new Error('Kanal yok');

        const existingConnection = getVoiceConnection(guildId);
        if (existingConnection) existingConnection.destroy();

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);

        const ffmpeg = spawn(ffmpegPath, [
            '-i', VIDEO_PATH, '-vn', '-acodec', 'pcm_s16le', '-ar', '48000', '-ac', '2', '-f', 's16le', '-loglevel', 'error', 'pipe:1'
        ]);
        const resource = createAudioResource(ffmpeg.stdout, { inputType: 'raw' });
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        if (textChannel) {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('GENÇLİĞE HİTABE')
                .setDescription(`🎥 **${voiceChannel.name}** kanalında çalınıyor...`)
                .setFooter({ text: `KALE ${BAYRAK}` })
                .setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }

        player.on(AudioPlayerStatus.Idle, () => {
            ffmpeg.kill();
            connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        player.on('error', () => {
            ffmpeg.kill();
            connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        return true;
    } catch (e) {
        setTimeout(() => returnToFixedChannel(guildId), 2000);
        return false;
    }
}

async function playIstiklal(guildId, channelId, textChannel, userId) {
    try {
        if (!fs.existsSync(ISTIKLAL_PATH)) {
            if (textChannel) textChannel.send(`${EMOJIS.carpi} **istiklal.mp3** bulunamadı!`);
            return false;
        }
        const guild = client.guilds.cache.get(guildId);
        if (!guild) throw new Error('Sunucu yok');
        const voiceChannel = guild.channels.cache.get(channelId);
        if (!voiceChannel || voiceChannel.type !== 2) throw new Error('Kanal yok');

        const existingConnection = getVoiceConnection(guildId);
        if (existingConnection) existingConnection.destroy();

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);

        const resource = createAudioResource(ISTIKLAL_PATH);
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        if (textChannel) {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('İSTİKLAL MARŞI')
                .setDescription(`🎵 **${voiceChannel.name}** kanalında çalınıyor!`)
                .setFooter({ text: `KALE ${BAYRAK}` })
                .setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        player.on('error', () => {
            connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        return true;
    } catch (e) {
        setTimeout(() => returnToFixedChannel(guildId), 2000);
        return false;
    }
}

async function playCustomSound(guildId, channelId, textChannel, userId, filePath, fileName, bass = 0) {
    try {
        console.log(`🔍 playCustomSound başladı: ${fileName}, bass: ${bass}`);
        console.log(`📂 Dosya: ${filePath}, var mı: ${fs.existsSync(filePath)}`);

        if (!fs.existsSync(filePath)) {
            console.log(`❌ Dosya bulunamadı: ${filePath}`);
            if (textChannel) textChannel.send(`${EMOJIS.carpi} **${fileName}** bulunamadı!`);
            return false;
        }
        
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`❌ Sunucu bulunamadı: ${guildId}`);
            return false;
        }
        
        const voiceChannel = guild.channels.cache.get(channelId);
        if (!voiceChannel) {
            console.log(`❌ Ses kanalı bulunamadı: ${channelId}`);
            return false;
        }
        
        if (voiceChannel.type !== 2) {
            console.log(`❌ Kanal ses kanalı değil: ${voiceChannel.type}`);
            return false;
        }
        
        const humanCount = voiceChannel.members.filter(m => !m.user.bot).size;
        console.log(`👥 Kanaldaki insan sayısı: ${humanCount}`);
        
        if (humanCount === 0) {
            console.log(`❌ Kanaldа kimse yok`);
            if (textChannel) textChannel.send(`${EMOJIS.carpi} Kanalda kimse yok!`);
            return false;
        }

        let connection = getVoiceConnection(guildId);
        let isNew = false;
        
        if (!connection) {
            console.log(`🔌 Yeni bağlantı kuruluyor...`);
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
            console.log(`✅ Bağlantı kuruldu`);
        } else if (connection.joinConfig.channelId !== voiceChannel.id) {
            console.log(`🔄 Kanal değişiyor...`);
            connection.destroy();
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
            console.log(`✅ Yeni bağlantı kuruldu`);
        } else {
            console.log(`🔌 Mevcut bağlantı kullanılıyor`);
        }

        let ffmpegArgs = [
            '-i', filePath,
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            'pipe:1'
        ];
        
        if (bass && bass !== 0) {
            console.log(`🎚️ Bass uygulanıyor: ${bass}`);
            ffmpegArgs = [
                '-i', filePath,
                '-af', `bass=g=${bass}:f=100:w=0.8`,
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2',
                'pipe:1'
            ];
        }
        
        console.log(`🎵 FFmpeg çalıştırılıyor: ${ffmpegPath}`);
        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
        
        ffmpeg.stderr.on('data', (data) => {
            const msg = data.toString();
            if (msg.includes('Error') || msg.includes('error')) {
                console.error(`FFmpeg hatası: ${msg}`);
            }
        });
        
        const resource = createAudioResource(ffmpeg.stdout, { inputType: 'raw', inlineVolume: true });
        resource.ffmpeg = ffmpeg;
        
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        console.log(`▶️ Çalma başlatıldı`);

        if (textChannel) {
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('SES ÇALINIYOR')
                .setDescription(`🔊 **${voiceChannel.name}** → **${fileName}**`)
                .setFooter({ text: `KALE ${BAYRAK}` })
                .setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }

        player.on(AudioPlayerStatus.Idle, () => {
            console.log(`⏹️ Ses bitti`);
            if (resource.ffmpeg) resource.ffmpeg.kill();
            if (isNew) connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        
        player.on('error', (error) => {
            console.error(`❌ Player hatası:`, error);
            if (resource.ffmpeg) resource.ffmpeg.kill();
            if (isNew) connection.destroy();
            setTimeout(() => returnToFixedChannel(guildId), 2000);
        });
        
        return true;
    } catch (e) {
        console.error(`❌ playCustomSound hatası:`, e);
        setTimeout(() => returnToFixedChannel(guildId), 2000);
        return false;
    }
}

async function playJumpscare(guildId, channelId, targetUserId = null) {
    try {
        if (!JUMPSCARE_COOLDOWN.enabled) return false;
        const now = Date.now();
        if (now - JUMPSCARE_COOLDOWN.lastReset > 86400000) {
            JUMPSCARE_COOLDOWN.count = 0;
            JUMPSCARE_COOLDOWN.lastReset = now;
        }
        if (JUMPSCARE_COOLDOWN.count >= JUMPSCARE_COOLDOWN.maxPerDay) return false;

        const isWeb = targetUserId !== null;
        if (!isWeb && Math.random() > JUMPSCARE_COOLDOWN.chance) return false;

        JUMPSCARE_FILES = getMeemFiles();
        const availableFiles = JUMPSCARE_FILES.filter(f => fs.existsSync(f));
        if (availableFiles.length === 0) return false;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return false;
        let voiceChannel = guild.channels.cache.get(channelId);
        if (!voiceChannel || voiceChannel.members.filter(m => !m.user.bot).size === 0) return false;

        let targetMember = null;
        if (targetUserId) {
            targetMember = guild.members.cache.get(targetUserId);
            if (!targetMember || !targetMember.voice.channel) return false;
            voiceChannel = targetMember.voice.channel;
        }

        const randomFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
        const fileName = path.basename(randomFile, '.mp3');

        let connection = getVoiceConnection(guildId);
        let isNew = false;
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        } else if (connection.joinConfig.channelId !== voiceChannel.id) {
            connection.destroy();
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        }

        JUMPSCARE_COOLDOWN.count++;
        console.log(`🎵 Jumpscare: ${fileName} → ${targetMember ? targetMember.user.username : 'Rastgele'}`);

        const resource = createAudioResource(randomFile);
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            if (isNew) {
                setTimeout(() => {
                    if (connection.state.status !== 'destroyed') connection.destroy();
                    setTimeout(() => returnToFixedChannel(guildId), 1000);
                }, 2000);
            } else {
                setTimeout(() => returnToFixedChannel(guildId), 1000);
            }
        });
        player.on('error', () => {
            if (isNew) {
                setTimeout(() => {
                    if (connection.state.status !== 'destroyed') connection.destroy();
                    setTimeout(() => returnToFixedChannel(guildId), 1000);
                }, 2000);
            } else {
                setTimeout(() => returnToFixedChannel(guildId), 1000);
            }
        });
        return true;
    } catch (e) {
        setTimeout(() => returnToFixedChannel(guildId), 1000);
        return false;
    }
}

client.login(token);
