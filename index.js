const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const db = require('./data/db.js');

const ffmpegStatic = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegStatic;
process.env.FFMPEG = ffmpegStatic;
const ffmpegPath = ffmpegStatic;

require('dotenv').config();
const token = process.env.TOKEN;
const ACIL_DURUM_SIFRE = process.env.ACIL_DURUM_SIFRE || 'MELEZYA2024!';

const GUILD_ID = '1543963769120497805';
const SABIT_SES_KANALI_ID = '1546154071113728101';
const WELCOME_CHANNEL_ID = '1546326748860256266';
const AUTO_ROLE_ID = '1546167155639320618';
const CHAT_CHANNEL_ID = '1546148807236911265';
const LOG_CHANNEL_ID = '1546327530267742420';
const KURAL_KANAL_ID = '1543979515683016715';
const ADMIN_ID = '1332226105221971988';

const VIDEO_PATH = path.join(__dirname, 'hitabe.mp4');
const ISTIKLAL_PATH = path.join(__dirname, 'istiklal.mp3');
const RESIM_KLASORU = path.join(__dirname, 'resimler');
const MEEM_KLASORU = path.join(__dirname, 'meem');

const BAYRAK = '<a:trbayrak:1546565825304072365>';
const YUKLENIYOR = '<a:yukleniyor:1547711418407583765>';
const LOADING = YUKLENIYOR;
const SILENT_FLAG = 4096;

const ADMIN_ONLY_COMMANDS = [
    'temizle', 'sil', 'kick', 'ban', 'unban',
    'duyuru', 'oylama', 'embed',
    'yedek', 'ayar', 'debug',
    'uyar', 'uyarılar', 'uyarı-sil', 'uyarisil', 'sustur', 'susturma-kaldır', 'slowmode', 'kanal-kilit', 'kanal-aç'
];

const EMOJIS = {
    carpi: '<a:carpi:1546323711567859712>',
    tik: '<a:tik:1546323559008178367>',
    bbknk: '<a:bbknk:1546323191918624768>',
    hosgeldin: '<a:Hosgeldin:1546322757938188308>',
    kale: '<:logo:1561439840351035434>',
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

// =========================== UYARI ROLLERİ ===========================
const UYARI_ROLLERI = {
    1: '1560730288546652261',
    2: '1560730313112682669',
    3: '1560730335560601681',
    4: '1560730354648612975',
    5: '1560730482101067817'
};

async function uyariRolGuncelle(guild, member, warnCount) {
    try {
        const tumRoller = Object.values(UYARI_ROLLERI).map(id => guild.roles.cache.get(id)).filter(r => r);
        for (const rol of tumRoller) {
            if (member.roles.cache.has(rol.id)) {
                await member.roles.remove(rol, `Uyarı rolü güncelleniyor (${warnCount} uyarı)`).catch(() => {});
            }
        }
        const seviye = Math.min(warnCount, 5);
        if (seviye >= 1) {
            const rol = guild.roles.cache.get(UYARI_ROLLERI[seviye]);
            if (rol) await member.roles.add(rol, `${warnCount} uyarı`).catch(() => {});
        }
    } catch (e) { console.error('Uyarı rol güncelleme hatası:', e); }
}

let ayarlar = db.loadSettings();
function loadAyarlar() { ayarlar = db.loadSettings(); }
function saveAyarlar() {
    for (const [key, value] of Object.entries(ayarlar)) db.setSetting(key, value);
}

function loadUserLog(userId) {
    const user = db.getUser(userId);
    const warns = db.getWarns(userId);
    return {
        userId, messageCount: user?.messageCount || 0, voiceMinutes: user?.voiceMinutes || 0,
        wordCount: user?.wordCount || 0, characterCount: user?.characterCount || 0,
        lastMessage: user?.lastMessage || null,
        warnings: warns.map(w => ({ reason: w.reason, by: w.byUser, date: w.date })),
        messages: [], commands: [], voiceSessions: [], voicePeriods: [], nicknames: [],
        usernameHistory: [], avatarHistory: [], statusHistory: [], activityHistory: [],
        mentions: [], mentionedBy: [], reactionsGiven: [], reactionsReceived: [],
        links: [], files: [], emojis: [], moderation: [], joins: [], leaves: [],
        activeDays: {}, dailyStats: {}, hourlyActivity: {}, channelActivity: {}
    };
}

function saveUserLog(userId, data) {
    db.ensureUser(userId, data.username || '', data.displayName || '', false);
    if (data.messageCount) db.getDB().prepare('UPDATE users SET messageCount = ? WHERE userId = ?').run(data.messageCount, userId);
    if (data.voiceMinutes) db.getDB().prepare('UPDATE users SET voiceMinutes = ? WHERE userId = ?').run(data.voiceMinutes, userId);
    if (data.wordCount) db.getDB().prepare('UPDATE users SET wordCount = ? WHERE userId = ?').run(data.wordCount, userId);
    if (data.characterCount) db.getDB().prepare('UPDATE users SET characterCount = ? WHERE userId = ?').run(data.characterCount, userId);
    if (data.lastMessage) db.getDB().prepare('UPDATE users SET lastMessage = ? WHERE userId = ?').run(data.lastMessage, userId);
}

function appendUserLog(userId, category, entry) {
    try {
        if (category === 'messages') db.addMessageLog(userId, entry.id, entry.channelId, entry.channel, entry.content, entry.attachments, entry.mentions);
        else if (category === 'commands') db.addCommandLog(userId, entry.command, entry.args, '');
        else if (category === 'voiceSessions') db.addVoiceSession(userId, entry.channelId, entry.channel, entry.type, entry.duration, entry.startTime, entry.endTime);
        else if (category === 'voicePeriods') db.addVoicePeriod(userId, entry.channelId, entry.channel, entry.startTime, entry.endTime, entry.duration, entry.formatted);
        else if (category === 'warnings') db.addWarn(userId, entry.reason, entry.by, '');
        else if (category === 'moderation') db.addModeration(userId, entry.type, entry.reason, entry.duration, entry.by, '');
        else if (category === 'nicknames') db.addNicknameHistory(userId, entry.old, entry.new);
        else if (category === 'usernameHistory') db.addUsernameHistory(userId, entry.old, entry.new);
        else if (category === 'avatarHistory') db.addAvatarHistory(userId, entry.old, entry.new);
        else if (category === 'statusHistory') db.addStatusHistory(userId, entry.old, entry.new);
        else if (category === 'activityHistory') db.addActivityHistory(userId, entry.old, entry.new);
        else if (category === 'joins') db.addJoinLeave(userId, 'join', entry.tag, 0);
        else if (category === 'leaves') db.addJoinLeave(userId, 'leave', entry.tag, 0);
        else if (category === 'mentions') db.addMention(userId, entry.userId, entry.channelId, entry.channel);
        else if (category === 'mentionedBy') db.addMentionedBy(userId, entry.userId, entry.username, '', entry.channel);
        else if (category === 'reactionsGiven') db.addReactionGiven(userId, entry.emoji, entry.messageAuthor, '', entry.channel);
        else if (category === 'reactionsReceived') db.addReactionReceived(userId, entry.emoji, entry.fromId, entry.from, '', '');
        else if (category === 'links') db.addLink(userId, entry.url, '', entry.channel);
        else if (category === 'files') db.addFile(userId, entry.name, entry.url, entry.size, '', entry.channel);
        else if (category === 'emojis') db.addEmojiUsed(userId, entry.emoji, '', entry.channel);
    } catch (e) { console.error('appendUserLog hatası:', e.message); }
}

const activeSessions = new Map();
function trackActivity(userId, type = 'message') {
    const today = new Date().toISOString().split('T')[0];
    try { db.updateActivity(userId, today, type === 'message' ? 1 : 0, type === 'voice' ? 1 : 0); } catch (e) {}
}

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
            ATATURK_IMAGE = fs.readdirSync(RESIM_KLASORU).filter(f => ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(path.extname(f).toLowerCase()));
        } else { fs.mkdirSync(RESIM_KLASORU, { recursive: true }); }
    } catch (e) {}
}

function getMeemFiles() {
    try {
        if (!fs.existsSync(MEEM_KLASORU)) { fs.mkdirSync(MEEM_KLASORU, { recursive: true }); return []; }
        return fs.readdirSync(MEEM_KLASORU).filter(f => f.endsWith('.mp3')).map(f => path.join(MEEM_KLASORU, f));
    } catch (e) { return []; }
}

let JUMPSCARE_FILES = getMeemFiles();
const JUMPSCARE_COOLDOWN = { maxPerDay: 5, chance: 0.01, lastReset: Date.now(), count: 0, enabled: true };
let audioSettings = { volume: 100, bass: 0 };

function getUserWarns(userId) { return db.getWarns(userId).map(w => ({ reason: w.reason, by: w.byUser, date: w.date })); }
function saveWarns() {}
let warns = {};
function loadWarns() { warns = {}; }
function getUserAktiflik(userId) {
    const user = db.getUser(userId);
    if (!user) return { messages: 0, voiceMinutes: 0, lastMessage: Date.now() };
    return { messages: user.messageCount || 0, voiceMinutes: user.voiceMinutes || 0, lastMessage: user.lastMessage || Date.now() };
}
function saveAktiflik() {}
let aktiflik = {};
function loadAktiflik() { aktiflik = {}; }

async function logToChannel(guildId, embed, logType = null) {
    if (logType && !ayarlar[`log_${logType}`]) return;
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;
        const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!channel) return;
        await channel.send({ embeds: [embed], flags: SILENT_FLAG });
    } catch (e) {
        try {
            const guild = client.guilds.cache.get(guildId);
            const channel = guild?.channels?.cache?.get(LOG_CHANNEL_ID);
            if (channel) await channel.send({ content: '@silent', embeds: [embed] });
        } catch (err) {}
    }
}

function createLogEmbed(title, description, color = 0x2B2D31, fields = [], user = null) {
    const embed = new EmbedBuilder()
        .setColor(color).setTitle(title).setDescription(description || '')
        .setTimestamp().setFooter({ text: `MELEZYA Log Sistemi ${BAYRAK}` });
    if (user) {
        embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }));
        embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true, size: 64 }) });
    }
    const validFields = (fields || []).filter(f => f && f.name && f.value && String(f.value).length > 0);
    if (validFields.length > 0) {
        embed.addFields(validFields.map(f => ({
            name: String(f.name).slice(0, 256),
            value: String(f.value).slice(0, 1024) || '*(Boş)*',
            inline: f.inline || false
        })));
    }
    return embed;
}

async function acilDurum(guild) {
    try {
        const channels = guild.channels.cache;
        for (const [id, channel] of channels) {
            if (channel.type === 0 || channel.type === 2 || channel.type === 5) {
                try { await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false, Speak: false, AddReactions: false }); } catch (e) {}
            }
        }
        const roles = guild.roles.cache.filter(r => r.id !== guild.roles.everyone.id && !r.managed);
        for (const [id, role] of roles) {
            try { await role.setPermissions([]); } catch (e) {}
        }
        let acilRole = guild.roles.cache.find(r => r.name === 'Acil Durum Yöneticisi');
        if (!acilRole) {
            acilRole = await guild.roles.create({ name: 'Acil Durum Yöneticisi', color: 0xFF0000, permissions: [PermissionsBitField.Flags.Administrator], reason: 'Acil Durum Sistemi' });
        } else {
            await acilRole.setPermissions([PermissionsBitField.Flags.Administrator]);
        }
        const adminMember = await guild.members.fetch(ADMIN_ID).catch(() => null);
        if (adminMember) await adminMember.roles.add(acilRole);
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000).setTitle('ACİL DURUM AKTİF!')
                .setDescription(`Sunucu kilitlendi, tüm rollerin yetkileri sıfırlandı.\n<@${ADMIN_ID}> adlı kullanıcıya **Acil Durum Yöneticisi** rolü verildi.`)
                .setTimestamp().setFooter({ text: `MELEZYA Acil Durum ${BAYRAK}` });
            await logChannel.send({ embeds: [embed], flags: SILENT_FLAG });
        }
        return true;
    } catch (e) { console.error('Acil durum hatası:', e); return false; }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks
    ],
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User]
});

client.once('ready', async () => {
    loadImages(); loadWarns(); loadAktiflik(); loadAyarlar();
    JUMPSCARE_FILES = getMeemFiles();
    console.log(`✅ ${client.user.tag} hazır! ${BAYRAK}`);
    console.log(`🎵 ${JUMPSCARE_FILES.length} meem dosyası`);
    console.log(`💣 Güvenlik modülü hazır!`);
    console.log(`📂 Kullanıcı log sistemi aktif!`);
    console.log(`🔐 Acil durum sistemi aktif!`);
    console.log(`📊 SQLite veritabanı: data/kale.db`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        console.log(`✅ Bot "MELEZYA" sunucusunda!`);
        const voiceChannel = guild.channels.cache.get(SABIT_SES_KANALI_ID);
        if (voiceChannel && voiceChannel.type === 2) {
            const existingConnection = getVoiceConnection(GUILD_ID);
            if (!existingConnection) {
                const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                console.log(`✅ Sabit kanalda!`);
            }
        }
    } catch (e) {}
    try {
        await client.application.commands.set([
            { name: 'yardim', description: 'Tüm komutları gösterir.' },
            { name: 'aktifgelistirici', description: 'Discord Aktif Geliştirici Rozeti talep komutu' }
        ]);
        console.log('✅ Slash komutlar kaydedildi!');
    } catch (e) { console.error('❌ Slash komut kaydı başarısız:', e); }
    await updateBotStatus();
    setInterval(updateBotStatus, 30000);
    require('./komutlar.js')(client, EMOJIS, BAYRAK, LOADING, GUILD_ID, ADMIN_ID, LOG_CHANNEL_ID, KURAL_KANAL_ID, ACIL_DURUM_SIFRE, acilDurum, ayarlar, saveAyarlar, appendUserLog, loadUserLog, saveUserLog, getUserAktiflik, saveAktiflik, getUserWarns, saveWarns, warns, ATATURK_IMAGE, ATATURK_SOZLER, ATATURK_BILGI, RESIM_KLASORU, VIDEO_PATH, ISTIKLAL_PATH, ffmpegPath, audioSettings, playVideoWithAudio, playIstiklal, playCustomSound, playJumpscare, returnToFixedChannel, getMeemFiles, JUMPSCARE_COOLDOWN, JUMPSCARE_FILES, uyariRolGuncelle);
});

let statusIndex = 0;
async function updateBotStatus() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const memberCount = guild.memberCount;
        const aktif = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
        const statuses = [
            { name: `${memberCount} Kişiye Hizmet Ediyor!`, type: 3 },
            { name: 'MELEZYA\'da her şey senin için!', type: 3 },
            { name: 'Herşey MELEZYA için.', type: 3 },
            { name: 'MELEZYA Biz bir aileyiz.', type: 3 },
            { name: `${aktif} Kişi Aktif! ${EMOJIS.alev}`, type: 3 },
            { name: '🛡️ Güvenlik Aktif', type: 3 }
        ];
        client.user.setPresence({ activities: [statuses[statusIndex % statuses.length]], status: 'online' });
        statusIndex++;
    } catch (e) {}
}

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    db.ensureUser(member.id, member.user.username, member.displayName, false);
    db.addJoinLeave(member.id, 'join', member.user.tag, member.guild.memberCount);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
        try { const role = member.guild.roles.cache.get(AUTO_ROLE_ID); if (role) await member.roles.add(role); } catch (e) {}
        const embed = new EmbedBuilder()
            .setColor(0xE30A17).setTitle('HOŞ GELDİN!')
            .setDescription(`<:logo:1561439840351035434> **${member.user.globalName || member.user.username}** aramıza katıldı!\n${EMOJIS.bbknk} Sunucumuz **${member.guild.memberCount}** kişi oldu!\n${EMOJIS.tik} **Kuralları okumayı unutma!**\n${BAYRAK} *Ne mutlu Türk'üm diyene!*`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `MELEZYA Ailesi ${BAYRAK}`, iconURL: member.guild.iconURL() })
            .setTimestamp();
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kurallar').setLabel('📜 Kurallar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('hosgeldin').setLabel('👋 Selam Ver').setStyle(ButtonStyle.Success)
        );
        await channel.send({ embeds: [embed], components: [row] });
    }
    await logToChannel(member.guild.id, createLogEmbed('ÜYE KATILDI', `**${member.user.tag}** sunucuya katıldı.`, 0x00FF00, [
        { name: 'Kullanıcı', value: `${member.user} (\`${member.id}\`)`, inline: true },
        { name: 'Kullanıcı Adı', value: `\`${member.user.tag}\``, inline: true },
        { name: 'Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:f>`, inline: true },
        { name: 'Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:f>`, inline: true },
        { name: 'Toplam Üye', value: `\`${member.guild.memberCount}\``, inline: true },
        { name: 'Bot mu?', value: member.user.bot ? 'Evet' : 'Hayır', inline: true }
    ], member.user), 'uye_katil');
});

client.on('guildMemberRemove', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    db.addJoinLeave(member.id, 'leave', member.user.tag, member.guild.memberCount);
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31).setTitle('GÜLE GÜLE!')
            .setDescription(`${EMOJIS.bbknk} **${member.user.globalName || member.user.username}** ayrıldı.\n${EMOJIS.carpi} *Umarız tekrar görüşürüz!*`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `MELEZYA Ailesi ${BAYRAK}`, iconURL: member.guild.iconURL() })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    }
    await logToChannel(member.guild.id, createLogEmbed('ÜYE AYRILDI', `**${member.user.tag}** sunucudan ayrıldı.`, 0xFF0000, [
        { name: 'Kullanıcı', value: `${member.user} (\`${member.id}\`)`, inline: true },
        { name: 'Kullanıcı Adı', value: `\`${member.user.tag}\``, inline: true },
        { name: 'Katılma Tarihi', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp/1000)}:f>` : 'Bilinmiyor', inline: true },
        { name: 'Roller', value: member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ').slice(0, 500) || 'Yok', inline: false },
        { name: 'Kalan Üye', value: `\`${member.guild.memberCount}\``, inline: true }
    ], member.user), 'uye_ayril');
});

client.on('messageDelete', async (message) => {
    if (!message.guild || message.guild.id !== GUILD_ID) return;
    if (message.author?.bot || message.partial) return;
    const icerik = message.content && message.content.length > 0 ? message.content : '*(Boş veya resim/dosya)*';
    await logToChannel(message.guild.id, createLogEmbed('MESAJ SİLİNDİ', `**${message.author.tag}** bir mesaj sildi.`, 0xFF0000, [
        { name: 'Kullanıcı', value: `${message.author} (\`${message.author.id}\`)`, inline: true },
        { name: 'Kullanıcı Adı', value: `\`${message.author.tag}\``, inline: true },
        { name: 'Kanal', value: `${message.channel} (\`${message.channel.id}\`)`, inline: true },
        { name: 'Mesaj ID', value: `\`${message.id}\``, inline: true },
        { name: 'İçerik', value: `\`\`\`${icerik.slice(0, 900)}\`\`\`` }
    ], message.author), 'mesaj_sil');
});

client.on('messageUpdate', async (oldM, newM) => {
    if (!oldM.guild || oldM.guild.id !== GUILD_ID) return;
    if (oldM.author?.bot || oldM.partial || newM.partial) return;
    if (oldM.content === newM.content) return;
    const eski = oldM.content && oldM.content.length > 0 ? oldM.content : '*(Boş)*';
    const yeni = newM.content && newM.content.length > 0 ? newM.content : '*(Boş)*';
    await logToChannel(oldM.guild.id, createLogEmbed('MESAJ DÜZENLENDİ', `**${oldM.author.tag}** bir mesajı düzenledi.`, 0xFFA500, [
        { name: 'Kullanıcı', value: `${oldM.author} (\`${oldM.author.id}\`)`, inline: true },
        { name: 'Kullanıcı Adı', value: `\`${oldM.author.tag}\``, inline: true },
        { name: 'Kanal', value: `${oldM.channel} (\`${oldM.channel.id}\`)`, inline: true },
        { name: 'Mesaj ID', value: `\`${oldM.id}\``, inline: true },
        { name: 'Eski İçerik', value: `\`\`\`${eski.slice(0, 500)}\`\`\`` },
        { name: 'Yeni İçerik', value: `\`\`\`${yeni.slice(0, 500)}\`\`\`` }
    ], oldM.author), 'mesaj_duzenle');
});

client.on('guildMemberUpdate', async (oldM, newM) => {
    if (oldM.guild.id !== GUILD_ID || oldM.user.bot) return;
    const oldRoles = oldM.roles.cache.map(r => r.id);
    const newRoles = newM.roles.cache.map(r => r.id);
    const added = newRoles.filter(r => !oldRoles.includes(r));
    const removed = oldRoles.filter(r => !newRoles.includes(r));
    if (added.length > 0) {
        for (const roleId of added) {
            const role = oldM.guild.roles.cache.get(roleId);
            if (role) db.addRoleHistory(oldM.id, roleId, role.name, 'add', '', '');
        }
        await logToChannel(oldM.guild.id, createLogEmbed('ROL EKLENDİ', `**${oldM.user.tag}** kullanıcısına rol eklendi.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `${oldM.user} (\`${oldM.id}\`)`, inline: true },
            { name: 'Kullanıcı Adı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'Eklenen Rol(ler)', value: added.map(id => `<@&${id}>`).join(', ').slice(0, 500), inline: false }
        ], oldM.user), 'rol');
    }
    if (removed.length > 0) {
        for (const roleId of removed) {
            const role = oldM.guild.roles.cache.get(roleId);
            if (role) db.addRoleHistory(oldM.id, roleId, role.name, 'remove', '', '');
        }
        await logToChannel(oldM.guild.id, createLogEmbed('ROL ALINDI', `**${oldM.user.tag}** kullanıcısından rol alındı.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `${oldM.user} (\`${oldM.id}\`)`, inline: true },
            { name: 'Kullanıcı Adı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'Alınan Rol(ler)', value: removed.map(id => `<@&${id}>`).join(', ').slice(0, 500), inline: false }
        ], oldM.user), 'rol');
    }
    if (oldM.nickname !== newM.nickname) {
        db.addNicknameHistory(oldM.id, oldM.nickname, newM.nickname);
        await logToChannel(oldM.guild.id, createLogEmbed('NICK DEĞİŞTİ', `**${oldM.user.tag}** nick değiştirdi.`, 0xFFA500, [
            { name: 'Kullanıcı', value: `${oldM.user} (\`${oldM.id}\`)`, inline: true },
            { name: 'Kullanıcı Adı', value: `\`${oldM.user.tag}\``, inline: true },
            { name: 'Eski Nick', value: `\`${oldM.nickname || 'Yok'}\``, inline: true },
            { name: 'Yeni Nick', value: `\`${newM.nickname || 'Yok'}\``, inline: true }
        ], oldM.user), 'nick');
    }
    if (!oldM.communicationDisabledUntil && newM.communicationDisabledUntil) {
        await logToChannel(GUILD_ID, createLogEmbed('ÜYE SUSTURULDU', `**${newM.user.tag}** susturuldu.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `${newM.user} (\`${newM.id}\`)`, inline: true },
            { name: 'Bitiş', value: `<t:${Math.floor(newM.communicationDisabledUntilTimestamp/1000)}:f>`, inline: true }
        ], newM.user), 'timeout');
    } else if (oldM.communicationDisabledUntil && !newM.communicationDisabledUntil) {
        await logToChannel(GUILD_ID, createLogEmbed('ÜYE SUSTURMASI KALDIRILDI', `**${newM.user.tag}** susturması kaldırıldı.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `${newM.user} (\`${newM.id}\`)`, inline: true }
        ], newM.user), 'timeout');
    }
});

client.on('presenceUpdate', async (oldP, newP) => {
    if (!newP || newP.guild.id !== GUILD_ID || newP.user.bot) return;
    if (oldP?.status !== newP.status) {
        db.addStatusHistory(newP.user.id, oldP?.status || 'offline', newP.status);
        await logToChannel(GUILD_ID, createLogEmbed('DURUM DEĞİŞTİ', `**${newP.user.tag}** durumunu değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `${newP.user} (\`${newP.user.id}\`)`, inline: true },
            { name: 'Eski Durum', value: `\`${oldP?.status || 'offline'}\``, inline: true },
            { name: 'Yeni Durum', value: `\`${newP.status}\``, inline: true }
        ], newP.user), 'durum');
    }
    const oldA = oldP?.activities[0];
    const newA = newP.activities[0];
    if (oldA?.name !== newA?.name) {
        db.addActivityHistory(newP.user.id, oldA?.name || null, newA?.name || null);
        await logToChannel(GUILD_ID, createLogEmbed('AKTİVİTE DEĞİŞTİ', `**${newP.user.tag}** aktivitesini değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `${newP.user} (\`${newP.user.id}\`)`, inline: true },
            { name: 'Eski Aktivite', value: `\`${oldA?.name || 'Yok'}\``, inline: true },
            { name: 'Yeni Aktivite', value: `\`${newA?.name || 'Yok'}\``, inline: true }
        ], newP.user), 'aktivite');
    }
});

client.on('userUpdate', async (oldU, newU) => {
    if (newU.bot) return;
    if (oldU.displayAvatarURL() !== newU.displayAvatarURL()) {
        db.addAvatarHistory(newU.id, oldU.displayAvatarURL(), newU.displayAvatarURL());
        await logToChannel(GUILD_ID, createLogEmbed('AVATAR DEĞİŞTİ', `**${newU.tag}** avatarını değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `${newU} (\`${newU.id}\`)`, inline: true },
            { name: 'Eski Avatar', value: `[Tıkla](${oldU.displayAvatarURL()})`, inline: true },
            { name: 'Yeni Avatar', value: `[Tıkla](${newU.displayAvatarURL()})`, inline: true }
        ], newU), 'profil');
    }
    if (oldU.username !== newU.username) {
        db.addUsernameHistory(newU.id, oldU.username, newU.username);
        await logToChannel(GUILD_ID, createLogEmbed('KULLANICI ADI DEĞİŞTİ', `**${oldU.tag}** kullanıcı adını değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `${newU} (\`${newU.id}\`)`, inline: true },
            { name: 'Eski Ad', value: `\`${oldU.username}\``, inline: true },
            { name: 'Yeni Ad', value: `\`${newU.username}\``, inline: true }
        ], newU), 'profil');
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.guild?.id !== GUILD_ID) return;
    if (reaction.partial) { try { await reaction.fetch(); } catch (e) { return; } }
    if (reaction.message.partial) { try { await reaction.message.fetch(); } catch (e) { return; } }
    db.addReactionGiven(user.id, reaction.emoji.name, reaction.message.author?.username || '', reaction.message.channel.id, reaction.message.channel.name);
    if (reaction.message.author && !reaction.message.author.bot) db.addReactionReceived(reaction.message.author.id, reaction.emoji.name, user.id, user.username, reaction.message.channel.id, reaction.message.channel.name);
    await logToChannel(GUILD_ID, createLogEmbed('TEPKİ EKLENDİ', `**${user.tag}** bir mesaja tepki ekledi.`, 0x4FC3F7, [
        { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)`, inline: true },
        { name: 'Emoji', value: `\`${reaction.emoji.name}\``, inline: true },
        { name: 'Kanal', value: `${reaction.message.channel} (\`${reaction.message.channel.id}\`)`, inline: true },
        { name: 'Mesaj Sahibi', value: reaction.message.author ? `${reaction.message.author} (\`${reaction.message.author.id}\`)` : 'Bilinmiyor', inline: false }
    ], user), 'tepki');
});

const voiceJoinTimes = new Map();
client.on('voiceStateUpdate', async (oldS, newS) => {
    if (oldS.guild.id !== GUILD_ID || oldS.member.user.bot || oldS.member.id === client.user.id) return;
    const userId = oldS.member.id;
    if (!oldS.channel && newS.channel) {
        voiceJoinTimes.set(userId, { start: Date.now(), channel: newS.channel.name, channelId: newS.channel.id });
        db.addVoiceSession(userId, newS.channel.id, newS.channel.name, 'join', 0, new Date().toISOString(), '');
        trackActivity(userId, 'voice');
        await logToChannel(oldS.guild.id, createLogEmbed('SESE GİRDİ', `**${oldS.member.user.tag}** sese girdi.`, 0x00FF00, [
            { name: 'Kullanıcı', value: `${oldS.member.user} (\`${oldS.member.id}\`)`, inline: true },
            { name: 'Kanal', value: `${newS.channel} (\`${newS.channel.id}\`)`, inline: true }
        ], oldS.member.user), 'ses');
    }
    if (oldS.channel && !newS.channel) {
        const session = voiceJoinTimes.get(userId);
        const duration = session ? Math.round((Date.now() - session.start) / 60000) : 0;
        voiceJoinTimes.delete(userId);
        const startTime = session ? new Date(session.start) : new Date();
        const endTime = new Date();
        db.addVoicePeriod(userId, oldS.channel.id, oldS.channel.name, startTime.toISOString(), endTime.toISOString(), duration, `${startTime.toLocaleString('tr-TR')} - ${endTime.toLocaleString('tr-TR')} (${duration} dk)`);
        db.addVoiceSession(userId, oldS.channel.id, oldS.channel.name, 'leave', duration, startTime.toISOString(), endTime.toISOString());
        db.incrementUserVoice(userId, duration);
        trackActivity(userId, 'voice');
        await logToChannel(oldS.guild.id, createLogEmbed('SESTEN ÇIKTI', `**${oldS.member.user.tag}** sesten çıktı.`, 0xFF0000, [
            { name: 'Kullanıcı', value: `${oldS.member.user} (\`${oldS.member.id}\`)`, inline: true },
            { name: 'Kanal', value: `${oldS.channel} (\`${oldS.channel.id}\`)`, inline: true },
            { name: 'Süre', value: `\`${duration} dakika\``, inline: true }
        ], oldS.member.user), 'ses');
    }
    if (oldS.channel && newS.channel && oldS.channel.id !== newS.channel.id) {
        const session = voiceJoinTimes.get(userId);
        const duration = session ? Math.round((Date.now() - session.start) / 60000) : 0;
        const startTime = session ? new Date(session.start) : new Date();
        const endTime = new Date();
        db.addVoicePeriod(userId, oldS.channel.id, oldS.channel.name, startTime.toISOString(), endTime.toISOString(), duration, '');
        db.addVoiceSession(userId, newS.channel.id, newS.channel.name, 'switch', duration, '', '');
        voiceJoinTimes.set(userId, { start: Date.now(), channel: newS.channel.name, channelId: newS.channel.id });
        await logToChannel(oldS.guild.id, createLogEmbed('SES KANALI DEĞİŞTİ', `**${oldS.member.user.tag}** ses kanalını değiştirdi.`, 0x4FC3F7, [
            { name: 'Kullanıcı', value: `${oldS.member.user} (\`${oldS.member.id}\`)`, inline: true },
            { name: 'Eski Kanal', value: `${oldS.channel} (\`${oldS.channel.id}\`)`, inline: true },
            { name: 'Yeni Kanal', value: `${newS.channel} (\`${newS.channel.id}\`)`, inline: true }
        ], oldS.member.user), 'ses');
    }
});

client.on('guildUpdate', async (oldG, newG) => {
    if (oldG.id !== GUILD_ID) return;
    const changes = [];
    if (oldG.name !== newG.name) changes.push(`**İsim:** \`${oldG.name}\` → \`${newG.name}\``);
    if (oldG.iconURL() !== newG.iconURL()) changes.push(`**İkon:** Değişti`);
    if (oldG.bannerURL() !== newG.bannerURL()) changes.push(`**Banner:** Değişti`);
    if (oldG.description !== newG.description) changes.push(`**Açıklama:** \`${oldG.description || 'Yok'}\` → \`${newG.description || 'Yok'}\``);
    if (oldG.verificationLevel !== newG.verificationLevel) changes.push(`**Doğrulama:** \`${oldG.verificationLevel}\` → \`${newG.verificationLevel}\``);
    if (changes.length > 0) await logToChannel(GUILD_ID, createLogEmbed('SUNUCU GÜNCELLENDİ', `Sunucu ayarları güncellendi.`, 0x4FC3F7, [{ name: 'Değişiklikler', value: changes.join('\n') }], null), 'sunucu');
});

client.on('emojiCreate', async (emoji) => {
    if (emoji.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ OLUŞTURULDU', `**${emoji.name}** emojisi oluşturuldu.`, 0x00FF00, [
        { name: 'Emoji', value: `${emoji} \`${emoji.name}\``, inline: true },
        { name: 'ID', value: `\`${emoji.id}\``, inline: true },
        { name: 'Animasyonlu', value: emoji.animated ? 'Evet' : 'Hayır', inline: true }
    ], null), 'emoji');
});
client.on('emojiUpdate', async (oldE, newE) => {
    if (oldE.guild.id !== GUILD_ID) return;
    if (oldE.name === newE.name) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ GÜNCELLENDİ', `**${oldE.name}** → **${newE.name}**`, 0xFFA500, [
        { name: 'Eski İsim', value: `\`${oldE.name}\``, inline: true },
        { name: 'Yeni İsim', value: `\`${newE.name}\``, inline: true },
        { name: 'ID', value: `\`${newE.id}\``, inline: true }
    ], null), 'emoji');
});
client.on('emojiDelete', async (emoji) => {
    if (emoji.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('EMOJİ SİLİNDİ', `**${emoji.name}** emojisi silindi.`, 0xFF0000, [
        { name: 'Emoji', value: `\`${emoji.name}\``, inline: true },
        { name: 'ID', value: `\`${emoji.id}\``, inline: true },
        { name: 'Animasyonlu', value: emoji.animated ? 'Evet' : 'Hayır', inline: true }
    ], null), 'emoji');
});

client.on('channelCreate', async (channel) => {
    if (channel.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('KANAL OLUŞTURULDU', `**${channel.name}** kanalı oluşturuldu.`, 0x00FF00, [
        { name: 'Kanal', value: `${channel} \`${channel.name}\``, inline: true },
        { name: 'ID', value: `\`${channel.id}\``, inline: true },
        { name: 'Tip', value: `\`${channel.type}\``, inline: true }
    ], null), 'kanal');
});
client.on('channelUpdate', async (oldC, newC) => {
    if (oldC.guild.id !== GUILD_ID) return;
    const changes = [];
    if (oldC.name !== newC.name) changes.push(`**İsim:** \`${oldC.name}\` → \`${newC.name}\``);
    if (oldC.parentId !== newC.parentId) changes.push(`**Kategori:** \`${oldC.parent?.name || 'Yok'}\` → \`${newC.parent?.name || 'Yok'}\``);
    if (oldC.position !== newC.position) changes.push(`**Pozisyon:** \`${oldC.position}\` → \`${newC.position}\``);
    if (changes.length === 0) return;
    await logToChannel(GUILD_ID, createLogEmbed('KANAL GÜNCELLENDİ', `${newC} kanalı güncellendi.`, 0xFFA500, [
        { name: 'Kanal', value: `${newC} (\`${newC.id}\`)`, inline: true },
        { name: 'Değişiklikler', value: changes.join('\n'), inline: false }
    ], null), 'kanal');
});
client.on('channelDelete', async (channel) => {
    if (channel.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('KANAL SİLİNDİ', `**${channel.name}** kanalı silindi.`, 0xFF0000, [
        { name: 'Kanal', value: `\`${channel.name}\``, inline: true },
        { name: 'ID', value: `\`${channel.id}\``, inline: true },
        { name: 'Tip', value: `\`${channel.type}\``, inline: true }
    ], null), 'kanal');
});

client.on('roleCreate', async (role) => {
    if (role.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('ROL OLUŞTURULDU', `**${role.name}** rolü oluşturuldu.`, 0x00FF00, [
        { name: 'Rol', value: `${role} \`${role.name}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: 'Renk', value: `\`${role.hexColor}\``, inline: true }
    ], null), 'rol_olustur');
});
client.on('roleUpdate', async (oldR, newR) => {
    if (oldR.guild.id !== GUILD_ID) return;
    const changes = [];
    if (oldR.name !== newR.name) changes.push(`**İsim:** \`${oldR.name}\` → \`${newR.name}\``);
    if (oldR.hexColor !== newR.hexColor) changes.push(`**Renk:** \`${oldR.hexColor}\` → \`${newR.hexColor}\``);
    if (oldR.permissions.bitfield !== newR.permissions.bitfield) changes.push(`**İzinler:** Değişti`);
    if (changes.length === 0) return;
    await logToChannel(GUILD_ID, createLogEmbed('ROL GÜNCELLENDİ', `${newR} rolü güncellendi.`, 0xFFA500, [
        { name: 'Rol', value: `${newR} (\`${newR.id}\`)`, inline: true },
        { name: 'Değişiklikler', value: changes.join('\n'), inline: false }
    ], null), 'rol_guncelle');
});
client.on('roleDelete', async (role) => {
    if (role.guild.id !== GUILD_ID) return;
    await logToChannel(GUILD_ID, createLogEmbed('ROL SİLİNDİ', `**${role.name}** rolü silindi.`, 0xFF0000, [
        { name: 'Rol', value: `\`${role.name}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: 'Renk', value: `\`${role.hexColor}\``, inline: true }
    ], null), 'rol_sil');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild?.id !== GUILD_ID) return;
    const content = message.content.toLowerCase().trim();
    if (content === 'sa') {
        const embed = new EmbedBuilder()
            .setColor(0xE30A17)
            .setDescription(`<:logo:1561439840351035434> **Aleyküm Selam, ${message.author.globalName || message.author.username}!**\n${EMOJIS.hosgeldin} *Hoş geldin!*\n${BAYRAK} **Ne mutlu Türk'üm diyene!**`)
            .setFooter({ text: `MELEZYA ${BAYRAK}`, iconURL: message.guild.iconURL() })
            .setTimestamp();
        try { await message.channel.send({ embeds: [embed] }); } catch (e) {}
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild?.id !== GUILD_ID) return;
    const userId = message.author.id;
    db.ensureUser(userId, message.author.username, message.author.displayName || message.author.username, false);
    db.addMessageLog(userId, message.id, message.channel.id, message.channel.name, message.content, message.attachments.map(a => ({ name: a.name, url: a.url, size: a.size })), message.mentions.users.map(u => u.id));
    db.incrementUserMessages(userId, message.content?.split(/\s+/).filter(w => w).length || 0, message.content?.length || 0);
    const links = message.content.match(/https?:\/\/[^\s]+/g) || [];
    links.forEach(link => db.addLink(userId, link, message.channel.id, message.channel.name));
    message.attachments.forEach(att => db.addFile(userId, att.name, att.url, att.size, message.channel.id, message.channel.name));
    message.mentions.users.forEach(u => {
        db.addMention(userId, u.id, message.channel.id, message.channel.name);
        db.addMentionedBy(u.id, userId, message.author.username, message.channel.id, message.channel.name);
    });
    trackActivity(userId, 'message');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== GUILD_ID) return;
    if (interaction.customId === 'kurallar') await interaction.reply({ content: `📜 **Kurallar:** <#${KURAL_KANAL_ID}>`, ephemeral: true });
    if (interaction.customId === 'hosgeldin') await interaction.reply({ content: `<:logo:1561439840351035434> **Hoş Geldin!** ${BAYRAK}`, ephemeral: true });
    if (interaction.customId === 'duello_kabul') await interaction.reply({ content: `⚔️ **${interaction.user}** düelloyu kabul etti!` });
    if (interaction.customId === 'duello_red') await interaction.reply({ content: `❌ **${interaction.user}** düelloyu reddetti.` });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'yardim') {
        const embed = new EmbedBuilder().setColor(0xE30A17).setTitle('MELEZYA BOT').setDescription('Tüm komutlar `mz!` ile başlar. `mz!yardim` yazarak detayları görebilirsin.').setFooter({ text: `MELEZYA ${BAYRAK}` }).setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    if (interaction.commandName === 'aktifgelistirici') {
        await interaction.reply({ content: `${EMOJIS.onay} **Aktif Geliştirici Rozeti** başvuru rehberi:\n\n**1.** https://discord.com/developers/active-developer\n**2.** Hesabına giriş yap, botunu seç\n**3.** Şartları tamamla\n**4.** **Submit**\n\n**Not:** Rozet 24 saat içinde düşer.`, ephemeral: true });
    }
});

process.on('unhandledRejection', e => {
    console.error('❌ Hata:', e);
    try { db.addErrorLog('unhandledRejection', e.message || String(e), e.stack || '', '', ''); } catch (err) {}
});

async function returnToFixedChannel(guildId) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;
        const hedefKanal = guild.channels.cache.get(SABIT_SES_KANALI_ID);
        if (!hedefKanal || hedefKanal.type !== 2) return;
        const mevcutBaglanti = getVoiceConnection(guildId);
        if (!mevcutBaglanti || mevcutBaglanti.joinConfig.channelId !== SABIT_SES_KANALI_ID) {
            if (mevcutBaglanti) mevcutBaglanti.destroy();
            const connection = joinVoiceChannel({ channelId: hedefKanal.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
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
        const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        const ffmpeg = spawn(ffmpegPath, ['-i', VIDEO_PATH, '-vn', '-acodec', 'pcm_s16le', '-ar', '48000', '-ac', '2', '-f', 's16le', '-loglevel', 'error', 'pipe:1']);
        const resource = createAudioResource(ffmpeg.stdout, { inputType: 'raw' });
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        if (textChannel) {
            const embed = new EmbedBuilder().setColor(0xE30A17).setTitle('GENÇLİĞE HİTABE').setDescription(`🎥 **${voiceChannel.name}** kanalında çalınıyor...`).setFooter({ text: `MELEZYA ${BAYRAK}` }).setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }
        player.on(AudioPlayerStatus.Idle, () => { ffmpeg.kill(); connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        player.on('error', () => { ffmpeg.kill(); connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        return true;
    } catch (e) { setTimeout(() => returnToFixedChannel(guildId), 2000); return false; }
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
        const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        const resource = createAudioResource(ISTIKLAL_PATH);
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        if (textChannel) {
            const embed = new EmbedBuilder().setColor(0xE30A17).setTitle('İSTİKLAL MARŞI').setDescription(`🎵 **${voiceChannel.name}** kanalında çalınıyor!`).setFooter({ text: `MELEZYA ${BAYRAK}` }).setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }
        player.on(AudioPlayerStatus.Idle, () => { connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        player.on('error', () => { connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        return true;
    } catch (e) { setTimeout(() => returnToFixedChannel(guildId), 2000); return false; }
}

async function playCustomSound(guildId, channelId, textChannel, userId, filePath, fileName, bass = 0) {
    try {
        if (!fs.existsSync(filePath)) {
            if (textChannel) textChannel.send(`${EMOJIS.carpi} **${fileName}** bulunamadı!`);
            return false;
        }
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return false;
        const voiceChannel = guild.channels.cache.get(channelId);
        if (!voiceChannel || voiceChannel.type !== 2) return false;
        const humanCount = voiceChannel.members.filter(m => !m.user.bot).size;
        if (humanCount === 0) {
            if (textChannel) textChannel.send(`${EMOJIS.carpi} Kanalda kimse yok!`);
            return false;
        }
        let connection = getVoiceConnection(guildId);
        let isNew = false;
        if (!connection) {
            connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        } else if (connection.joinConfig.channelId !== voiceChannel.id) {
            connection.destroy();
            connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        }
        let ffmpegArgs = ['-i', filePath, '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1'];
        if (bass && bass !== 0) ffmpegArgs = ['-i', filePath, '-af', `bass=g=${bass}:f=100:w=0.8`, '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1'];
        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
        const resource = createAudioResource(ffmpeg.stdout, { inputType: 'raw', inlineVolume: true });
        resource.ffmpeg = ffmpeg;
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        if (textChannel) {
            const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle('SES ÇALINIYOR').setDescription(`🔊 **${voiceChannel.name}** → **${fileName}**`).setFooter({ text: `MELEZYA ${BAYRAK}` }).setTimestamp();
            await textChannel.send({ embeds: [embed] });
        }
        player.on(AudioPlayerStatus.Idle, () => { if (resource.ffmpeg) resource.ffmpeg.kill(); if (isNew) connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        player.on('error', () => { if (resource.ffmpeg) resource.ffmpeg.kill(); if (isNew) connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 2000); });
        return true;
    } catch (e) { setTimeout(() => returnToFixedChannel(guildId), 2000); return false; }
}

async function playJumpscare(guildId, channelId, targetUserId = null) {
    try {
        if (!JUMPSCARE_COOLDOWN.enabled) return false;
        const now = Date.now();
        if (now - JUMPSCARE_COOLDOWN.lastReset > 86400000) { JUMPSCARE_COOLDOWN.count = 0; JUMPSCARE_COOLDOWN.lastReset = now; }
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
        let connection = getVoiceConnection(guildId);
        let isNew = false;
        if (!connection) {
            connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        } else if (connection.joinConfig.channelId !== voiceChannel.id) {
            connection.destroy();
            connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            isNew = true;
        }
        JUMPSCARE_COOLDOWN.count++;
        const resource = createAudioResource(randomFile);
        if (resource.volume) resource.volume.setVolume(audioSettings.volume / 100);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
        player.on(AudioPlayerStatus.Idle, () => {
            if (isNew) {
                setTimeout(() => { if (connection.state.status !== 'destroyed') connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 1000); }, 2000);
            } else { setTimeout(() => returnToFixedChannel(guildId), 1000); }
        });
        player.on('error', () => {
            if (isNew) {
                setTimeout(() => { if (connection.state.status !== 'destroyed') connection.destroy(); setTimeout(() => returnToFixedChannel(guildId), 1000); }, 2000);
            } else { setTimeout(() => returnToFixedChannel(guildId), 1000); }
        });
        return true;
    } catch (e) { setTimeout(() => returnToFixedChannel(guildId), 1000); return false; }
}

client.login(token);
