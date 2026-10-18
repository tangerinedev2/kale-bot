const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, AttachmentBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./data/db.js');

const token2 = process.env.TOKEN2;
const GUILD_ID = '1543963769120497805';
const ADMIN_ID = '1332226105221971988';
const LOG_CHANNEL_ID = '1546327530267742420';
const GOZALTINDA_ROLE_ID = '1547933029979398226';
const SABIT_SES_KANALI_ID = '1546154071113728101';
const AUTOMOD_WEBHOOK_NAME = 'Melezya Koruma Bot';

const EMOJIS = {
    yesil: '<:yesil:1547954548876902460>',
    sari: '<:sari:1547954546251276419>',
    kurucu: '<:kurucu:1547954544879866059>',
    kirmizi: '<:kirmizi:1547954543671771146>',
    kelepce: '<:kelepce:1547954542480597022>',
    kalkan: '<:kalkan:1547954539817345044>',
    dogrulanmadi: '<:dogrulanmadi:1547954536034082896>',
    dogrulandi: '<:dogrulandi:1547954534201032774>',
    trbayrak: '<a:trbayrak:1547936258859475014>',
    kale: '<:logo:1561439840351035434>'
};

const GOZALTINDA_PATH = path.join(__dirname, 'gozaltinda.json');
let gozaltinda = {};

function loadGozaltinda() {
    try {
        if (fs.existsSync(GOZALTINDA_PATH)) gozaltinda = JSON.parse(fs.readFileSync(GOZALTINDA_PATH, 'utf8'));
        else fs.writeFileSync(GOZALTINDA_PATH, JSON.stringify({}, null, 2));
    } catch (e) { gozaltinda = {}; }
}
function saveGozaltinda() { try { fs.writeFileSync(GOZALTINDA_PATH, JSON.stringify(gozaltinda, null, 2)); } catch (e) {} }
function addGozaltinda(userId, sebep, yetkili) {
    gozaltinda[userId] = { userId, sebep: sebep || 'Belirtilmedi', yetkili: yetkili || 'Bilinmiyor', tarih: new Date().toISOString() };
    saveGozaltinda();
}
function removeGozaltinda(userId) { delete gozaltinda[userId]; saveGozaltinda(); }

function loadUserLogFromDB(userId) {
    const database = db.getDB();
    const user = db.getUser(userId);
    const warns = db.getWarns(userId);
    const messages = database.prepare('SELECT * FROM messages WHERE userId = ? ORDER BY date DESC LIMIT 1000').all(userId).map(m => ({ id: m.messageId, channel: m.channelName, content: m.content, timestamp: m.date }));
    const voiceSessions = database.prepare('SELECT * FROM voice_sessions WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(v => ({ channel: v.channelName, duration: v.duration, timestamp: v.date, type: v.type }));
    const voicePeriods = database.prepare('SELECT * FROM voice_periods WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(v => ({ channel: v.channelName, formatted: v.formatted, timestamp: v.date }));
    const commands = database.prepare('SELECT * FROM commands WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(c => ({ command: c.command, args: c.args, timestamp: c.date }));
    const roles = database.prepare('SELECT * FROM role_history WHERE userId = ? ORDER BY date DESC LIMIT 100').all(userId).map(r => ({ type: r.type, roles: [r.roleName], timestamp: r.date }));
    const nicknames = database.prepare('SELECT * FROM nickname_history WHERE userId = ? ORDER BY date DESC LIMIT 100').all(userId).map(n => ({ old: n.oldNick, new: n.newNick, timestamp: n.date }));
    const usernameHistory = database.prepare('SELECT * FROM username_history WHERE userId = ? ORDER BY date DESC LIMIT 50').all(userId).map(u => ({ old: u.oldUsername, new: u.newUsername, timestamp: u.date }));
    const avatarHistory = database.prepare('SELECT * FROM avatar_history WHERE userId = ? ORDER BY date DESC LIMIT 50').all(userId).map(a => ({ old: a.oldAvatar, new: a.newAvatar, timestamp: a.date }));
    const statusHistory = database.prepare('SELECT * FROM status_history WHERE userId = ? ORDER BY date DESC LIMIT 200').all(userId).map(s => ({ old: s.oldStatus, new: s.newStatus, timestamp: s.date }));
    const activityHistory = database.prepare('SELECT * FROM activity_history WHERE userId = ? ORDER BY date DESC LIMIT 200').all(userId).map(a => ({ old: a.oldActivity, new: a.newActivity, timestamp: a.date }));
    const mentions = database.prepare('SELECT * FROM mentions WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(m => ({ username: m.mentionedUserId, channel: m.channelName, timestamp: m.date }));
    const mentionedBy = database.prepare('SELECT * FROM mentioned_by WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(m => ({ username: m.byUsername, channel: m.channelName, timestamp: m.date }));
    const reactionsGiven = database.prepare('SELECT * FROM reactions_given WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(r => ({ emoji: r.emoji, messageAuthor: r.messageAuthor, timestamp: r.date }));
    const reactionsReceived = database.prepare('SELECT * FROM reactions_received WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(r => ({ emoji: r.emoji, from: r.fromUsername, timestamp: r.date }));
    const links = database.prepare('SELECT * FROM links WHERE userId = ? ORDER BY date DESC LIMIT 300').all(userId).map(l => ({ url: l.url, channel: l.channelName, timestamp: l.date }));
    const files = database.prepare('SELECT * FROM files WHERE userId = ? ORDER BY date DESC LIMIT 300').all(userId).map(f => ({ name: f.name, size: f.size, channel: f.channelName, timestamp: f.date }));
    const emojis = database.prepare('SELECT * FROM emojis_used WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(e => ({ emoji: e.emoji, channel: e.channelName, timestamp: e.date }));
    const activity = database.prepare('SELECT * FROM activity WHERE userId = ? ORDER BY date DESC LIMIT 30').all(userId);
    const activeDays = {};
    activity.forEach(a => {
        activeDays[a.date] = { date: a.date, firstActivity: a.firstActivity, lastActivity: a.lastActivity, duration: a.duration, sessions: a.sessions, types: { message: a.messages, voice: a.voiceMinutes } };
    });
    return {
        userId, createdAt: user?.createdAt, messageCount: user?.messageCount || 0, voiceMinutes: user?.voiceMinutes || 0,
        wordCount: user?.wordCount || 0, characterCount: user?.characterCount || 0, lastMessage: user?.lastMessage,
        messages, voiceSessions, voicePeriods, commands, roles, nicknames, usernameHistory, avatarHistory,
        statusHistory, activityHistory, mentions, mentionedBy, reactionsGiven, reactionsReceived, links, files, emojis,
        warnings: warns.map(w => ({ reason: w.reason, by: w.byUser, timestamp: w.date })),
        joins: database.prepare("SELECT * FROM joins_leaves WHERE userId = ? AND type = 'join' ORDER BY date DESC LIMIT 10").all(userId).map(j => ({ tag: j.tag, timestamp: j.date })),
        leaves: database.prepare("SELECT * FROM joins_leaves WHERE userId = ? AND type = 'leave' ORDER BY date DESC LIMIT 10").all(userId).map(l => ({ tag: l.tag, timestamp: l.date })),
        activeDays, dailyStats: {}, hourlyActivity: {}, channelActivity: {}, voiceStats: {}
    };
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

// =========================== OTOMATİK MODERASYON ===========================
let automodWebhook = null;
let kufurListesi = [];
let izinliKanallar = [];
let automodAyarlar = {};

// Spam/flood takibi
const spamTracker = new Map();
const floodTracker = new Map();

// Raid takibi
const raidTracker = { katilimcilar: [], sonTemizlik: Date.now() };

async function webhookOlustur(guild) {
    try {
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!logChannel) { console.error('Log kanalı bulunamadı, webhook oluşturulamadı.'); return null; }
        const webhooks = await logChannel.fetchWebhooks();
        let wh = webhooks.find(w => w.name === AUTOMOD_WEBHOOK_NAME && w.owner?.id === client.user.id);
        if (!wh) {
            wh = await logChannel.createWebhook({ name: AUTOMOD_WEBHOOK_NAME, reason: 'Melezya Koruma Bot otomatik moderasyon' });
            console.log(`${EMOJIS.yesil} Otomatik moderasyon webhook'u oluşturuldu: ${wh.name}`);
        } else {
            console.log(`${EMOJIS.yesil} Otomatik moderasyon webhook'u hazır: ${wh.name}`);
        }
        return wh;
    } catch (e) {
        console.error('Webhook oluşturma hatası:', e);
        return null;
    }
}

async function automodUyar(channel, embed) {
    try {
        if (automodWebhook) {
            await automodWebhook.send({ embeds: [embed], username: AUTOMOD_WEBHOOK_NAME, avatarURL: client.user.displayAvatarURL() });
        } else {
            const msg = await channel.send({ embeds: [embed] });
            setTimeout(() => msg.delete().catch(() => {}), 8000);
        }
    } catch (e) { console.error('Automod uyarı hatası:', e); }
}

function kufurVarMi(icerik) {
    const kucuk = icerik.toLowerCase();
    for (const k of kufurListesi) {
        if (kucuk.includes(k.toLowerCase())) return k;
    }
    return null;
}

function linkVarMi(icerik) {
    return /(discord\.gg\/|discord\.com\/invite\/|https?:\/\/)/i.test(icerik);
}

function capsOrani(icerik) {
    const harfler = icerik.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, '');
    if (harfler.length < 8) return 0;
    const buyuk = icerik.replace(/[^A-ZÇĞİÖŞÜ]/g, '').length;
    return buyuk / harfler.length;
}

function emojiSayisi(icerik) {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic}|<a?:[a-zA-Z0-9_]+:\d+>)/gu;
    const matches = icerik.match(emojiRegex);
    return matches ? matches.length : 0;
}

function spamKontrol(userId) {
    const simdi = Date.now();
    if (!spamTracker.has(userId)) spamTracker.set(userId, []);
    const gecmis = spamTracker.get(userId).filter(t => simdi - t < 5000);
    gecmis.push(simdi);
    spamTracker.set(userId, gecmis);
    return gecmis.length >= 5;
}

function floodKontrol(userId) {
    const simdi = Date.now();
    if (!floodTracker.has(userId)) floodTracker.set(userId, []);
    const gecmis = floodTracker.get(userId).filter(t => simdi - t < 10000);
    gecmis.push(simdi);
    floodTracker.set(userId, gecmis);
    return gecmis.length >= 10;
}

async function otomatikModerasyon(message) {
    if (!message.guild || message.guild.id !== GUILD_ID) return;
    if (message.author.bot) return;
    if (message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (db.getSetting('automod_enabled') !== 'true') return;
    if (db.automodKanalIzinliMi(message.channel.id)) return;

    const icerik = message.content || '';
    if (!icerik) return;

    // 1. Küfür
    if (db.getSetting('automod_kufur') === 'true') {
        const bulunan = kufurVarMi(icerik);
        if (bulunan) {
            await message.delete().catch(() => {});
            db.addAutomodLog(message.author.id, message.channel.id, 'kufur', icerik.slice(0, 500), 'mesaj_silindi');
            await automodUyar(message.channel, new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`${EMOJIS.kalkan} KÜFÜR ENGELLENDİ`)
                .setDescription(`**${message.author.tag}** küfür içeren bir mesaj gönderdi ve mesajı silindi.`)
                .addFields(
                    { name: 'Kanal', value: `${message.channel}`, inline: true },
                    { name: 'Kelime', value: `\`${bulunan}\``, inline: true }
                )
                .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                .setTimestamp());
            return;
        }
    }

    // 2. Link
    if (db.getSetting('automod_link') === 'true') {
        if (linkVarMi(icerik)) {
            await message.delete().catch(() => {});
            db.addAutomodLog(message.author.id, message.channel.id, 'link', icerik.slice(0, 500), 'mesaj_silindi');
            await automodUyar(message.channel, new EmbedBuilder()
                .setColor(0xFF6B00)
                .setTitle(`${EMOJIS.kalkan} LİNK ENGELLENDİ`)
                .setDescription(`**${message.author.tag}** link içeren bir mesaj gönderdi ve mesajı silindi.`)
                .addFields({ name: 'Kanal', value: `${message.channel}`, inline: true })
                .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                .setTimestamp());
            return;
        }
    }

    // 3. Caps lock
    if (db.getSetting('automod_caps') === 'true') {
        if (capsOrani(icerik) > 0.7) {
            await message.delete().catch(() => {});
            db.addAutomodLog(message.author.id, message.channel.id, 'caps', icerik.slice(0, 500), 'mesaj_silindi');
            await automodUyar(message.channel, new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`${EMOJIS.kalkan} BÜYÜK HARF ENGELLENDİ`)
                .setDescription(`**${message.author.tag}** aşırı büyük harf kullandı ve mesajı silindi.`)
                .addFields({ name: 'Kanal', value: `${message.channel}`, inline: true })
                .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                .setTimestamp());
            return;
        }
    }

    // 4. Mention spam
    if (db.getSetting('automod_mention') === 'true') {
        if (message.mentions.users.size >= 5) {
            await message.delete().catch(() => {});
            db.addAutomodLog(message.author.id, message.channel.id, 'mention_spam', icerik.slice(0, 500), 'mesaj_silindi');
            await automodUyar(message.channel, new EmbedBuilder()
                .setColor(0xFF6B00)
                .setTitle(`${EMOJIS.kalkan} ETİKET SPAM'İ ENGELLENDİ`)
                .setDescription(`**${message.author.tag}** çok fazla etiket kullandı ve mesajı silindi.`)
                .addFields({ name: 'Etiket Sayısı', value: `\`${message.mentions.users.size}\``, inline: true })
                .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                .setTimestamp());
            return;
        }
    }

    // 5. Emoji spam
    if (db.getSetting('automod_emoji') === 'true') {
        if (emojiSayisi(icerik) >= 10) {
            await message.delete().catch(() => {});
            db.addAutomodLog(message.author.id, message.channel.id, 'emoji_spam', icerik.slice(0, 500), 'mesaj_silindi');
            await automodUyar(message.channel, new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`${EMOJIS.kalkan} EMOJİ SPAM'İ ENGELLENDİ`)
                .setDescription(`**${message.author.tag}** çok fazla emoji kullandı ve mesajı silindi.`)
                .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                .setTimestamp());
            return;
        }
    }

    // 6. Spam (5 saniyede 5+ mesaj)
    if (db.getSetting('automod_spam') === 'true') {
        if (spamKontrol(message.author.id)) {
            try {
                await message.member.timeout(5 * 60 * 1000, 'Spam koruması');
                db.addAutomodLog(message.author.id, message.channel.id, 'spam', icerik.slice(0, 500), 'timeout_5dk');
                await automodUyar(message.channel, new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kalkan} SPAM ENGELLENDİ`)
                    .setDescription(`**${message.author.tag}** spam yaptığı için 5 dakika susturuldu.`)
                    .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                    .setTimestamp());
            } catch (e) {}
            return;
        }
    }

    // 7. Flood (10 saniyede 10+ mesaj)
    if (db.getSetting('automod_flood') === 'true') {
        if (floodKontrol(message.author.id)) {
            try {
                await message.member.timeout(10 * 60 * 1000, 'Flood koruması');
                db.addAutomodLog(message.author.id, message.channel.id, 'flood', icerik.slice(0, 500), 'timeout_10dk');
                await automodUyar(message.channel, new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kalkan} FLOOD ENGELLENDİ`)
                    .setDescription(`**${message.author.tag}** flood yaptığı için 10 dakika susturuldu.`)
                    .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })
                    .setTimestamp());
            } catch (e) {}
            return;
        }
    }
}

// =========================== SLASH KOMUTLARI ===========================
const commands = [
    new SlashCommandBuilder().setName('gozaltindakiler').setDescription('Gözaltındaki üyeleri listeler (DM .log)'),
    new SlashCommandBuilder().setName('gozaltina-al').setDescription('Bir üyeyi gözaltına alır')
        .addUserOption(o => o.setName('kisi').setDescription('Gözaltına alınacak kişi').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
    new SlashCommandBuilder().setName('gozaltindan-cikar').setDescription('Bir üyeyi gözaltından çıkarır')
        .addUserOption(o => o.setName('kisi').setDescription('Çıkarılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('guvenlik-tara').setDescription('Sunucuyu güvenlik açısından tarar (DM .log)'),
    new SlashCommandBuilder().setName('bot-denetle').setDescription('Sunucudaki botları denetler (DM .log)'),
    new SlashCommandBuilder().setName('izin-denetle').setDescription('Rol veya kanal izinlerini denetler')
        .addRoleOption(o => o.setName('rol').setDescription('Denetlenecek rol').setRequired(false))
        .addChannelOption(o => o.setName('kanal').setDescription('Denetlenecek kanal').setRequired(false)),
    new SlashCommandBuilder().setName('uye-denetle').setDescription('Bir üyeyi detaylı denetler')
        .addUserOption(o => o.setName('kisi').setDescription('Denetlenecek kişi').setRequired(true)),
    new SlashCommandBuilder().setName('riskli-uyeler').setDescription('Riskli üyeleri listeler (DM .log)'),
    new SlashCommandBuilder().setName('davet-denetle').setDescription('Davet linklerini denetler (DM .log)'),
    new SlashCommandBuilder().setName('webhook-denetle').setDescription('Webhook\'ları denetler (DM .log)'),
    new SlashCommandBuilder().setName('guvenlik-rapor').setDescription('7 günlük güvenlik raporu (DM .log)'),
    new SlashCommandBuilder().setName('gecmissorgula').setDescription('Kullanıcının tüm geçmişini DM .log olarak gönderir')
        .addUserOption(o => o.setName('kisi').setDescription('Sorgulanacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('rol-denetle').setDescription('Bir rolün detaylı denetimini yapar (DM .log)')
        .addRoleOption(o => o.setName('rol').setDescription('Denetlenecek rol').setRequired(true)),
    new SlashCommandBuilder().setName('kanal-izin-tara').setDescription('Tüm kanalların @everyone izinlerini tarar (DM .log)'),
    new SlashCommandBuilder().setName('webhook-temizle').setDescription('Sunucudaki webhook\'ları listeler, seçilenleri siler'),
    new SlashCommandBuilder().setName('raid-mod').setDescription('Raid modunu açar (yeni katılımları engeller, kanalları kilitler)')
        .addStringOption(o => o.setName('sure').setDescription('Süre (dakika, varsayılan 10)').setRequired(false)),
    new SlashCommandBuilder().setName('yeni-hesap-tara').setDescription('7 günden yeni hesapları listeler (DM .log)'),
    new SlashCommandBuilder().setName('şüpheli-uye').setDescription('Son 24 saatte katılıp hiç mesaj atmayanları listeler (DM .log)'),
    new SlashCommandBuilder().setName('ban-listesi').setDescription('Tüm banları listeler (DM .log)')
];

function createLogFile(content, fileName) {
    return new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: fileName });
}

async function sendDM(user, content, attachment = null) {
    try {
        const dm = await user.createDM();
        if (attachment) await dm.send({ content, files: [attachment] });
        else await dm.send({ content });
        return true;
    } catch (e) { return false; }
}

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
            console.log(`${EMOJIS.yesil} Sabit ses kanalına katıldı: ${hedefKanal.name}`);
        }
    } catch (e) { console.error('Ses kanalı hatası:', e); }
}

client.once('ready', async () => {
    loadGozaltinda();
    console.log(`${EMOJIS.kalkan} ${client.user.tag} hazır! ${EMOJIS.trbayrak}`);
    const rest = new REST({ version: '10' }).setToken(token2);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands.map(cmd => cmd.toJSON()) });
        console.log(`${EMOJIS.yesil} Slash komutları kaydedildi! (${commands.length} komut)`);
    } catch (e) { console.error('Komut kaydetme hatası:', e); }

    // Webhook oluştur
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        automodWebhook = await webhookOlustur(guild);
        // Küfür listesini ve izinli kanalları yükle
        kufurListesi = db.getAutomodKelimeler();
        izinliKanallar = db.getAutomodIzinliKanallar();
        console.log(`${EMOJIS.yesil} Otomatik mod hazır: ${kufurListesi.length} küfür, ${izinliKanallar.length} muaf kanal`);
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const voiceChannel = guild.channels.cache.get(SABIT_SES_KANALI_ID);
        if (voiceChannel && voiceChannel.type === 2) {
            const existingConnection = getVoiceConnection(GUILD_ID);
            if (!existingConnection) {
                const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                console.log(`${EMOJIS.yesil} Sabit ses kanalında! ${voiceChannel.name}`);
                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                        ]);
                    } catch (e) {
                        connection.destroy();
                        setTimeout(() => returnToFixedChannel(GUILD_ID), 2000);
                    }
                });
            }
        }
    } catch (e) { console.error('Ses kanalına katılma hatası:', e); }
});

// =========================== MESAJ DİNLEYİCİ (OTOMATİK MOD) ===========================
client.on('messageCreate', async (message) => {
    if (!message.guild || message.guild.id !== GUILD_ID) return;
    if (message.author.bot) return;

    // Küfür listesi ve izinli kanalları her 30 saniyede bir yenile (DB değişmiş olabilir)
    if (Date.now() % 30000 < 1000) {
        kufurListesi = db.getAutomodKelimeler();
        izinliKanallar = db.getAutomodIzinliKanallar();
    }

    await otomatikModerasyon(message);
});

// =========================== RAID TAKİBİ ===========================
client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    const simdi = Date.now();
    raidTracker.katilimcilar = raidTracker.katilimcilar.filter(t => simdi - t < 10000);
    raidTracker.katilimcilar.push(simdi);

    if (raidTracker.katilimcilar.length >= 5) {
        console.log(`${EMOJIS.kirmizi} RAID TESPİT EDİLDİ! ${raidTracker.katilimcilar.length} katılım (10 sn)`);
        try {
            const guild = member.guild;
            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kalkan} RAID TESPİT EDİLDİ`)
                    .setDescription(`10 saniyede **${raidTracker.katilimcilar.length}** üye katıldı. Sunucu yöneticileri harekete geçmeli.`)
                    .setTimestamp()
                    .setFooter({ text: `Melezya Koruma Bot ${EMOJIS.trbayrak}` })] });
            }
            db.addRaidEvent(raidTracker.katilimcilar.length, 'tespit');
        } catch (e) {}
    }
});

// =========================== SLASH KOMUT İŞLEYİCİ ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.guildId !== GUILD_ID) return;
    const { commandName, user, guild } = interaction;
    const member = await guild.members.fetch(user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: `${EMOJIS.kirmizi} Bu komutu sadece yöneticiler kullanabilir!`, ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        // ==================== GÖZALTINDAKİLER ====================
        if (commandName === 'gozaltindakiler') {
            const list = Object.values(gozaltinda);
            if (list.length === 0) return interaction.editReply({ content: `${EMOJIS.sari} Gözaltında kimse yok.` });
            let content = `MELEZYA GÜVENLİK - GÖZALTINDAKİLER LİSTESİ\n\nToplam: ${list.length} kişi\n\n`;
            for (const [i, data] of list.entries()) {
                const u = await client.users.fetch(data.userId).catch(() => null);
                content += `${i + 1}. ${u ? u.tag : 'Bilinmeyen'} (${data.userId})\n   Sebep: ${data.sebep}\n   Yetkili: ${data.yetkili}\n   Tarih: ${new Date(data.tarih).toLocaleString('tr-TR')}\n\n`;
            }
            const attachment = createLogFile(content, `gozaltindakiler-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kelepce} Gözaltındakiler listesi:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Liste DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
        }
        // ==================== GÖZALTINA AL ====================
        else if (commandName === 'gozaltina-al') {
            const target = interaction.options.getUser('kisi');
            const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
            const targetMember = await guild.members.fetch(target.id).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            const role = guild.roles.cache.get(GOZALTINDA_ROLE_ID);
            if (!role) return interaction.editReply({ content: `${EMOJIS.kirmizi} Gözaltında rolü bulunamadı!` });
            await targetMember.roles.add(role, `Gözaltına alındı: ${sebep}`);
            addGozaltinda(target.id, sebep, user.tag);
            await interaction.editReply({ content: `${EMOJIS.kelepce} ${target.tag} gözaltına alındı. Sebep: ${sebep}` });
            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000).setTitle(`${EMOJIS.kelepce} GÖZALTINA ALINDI`)
                    .setDescription(`**${target.tag}** gözaltına alındı.`)
                    .addFields(
                        { name: 'Kullanıcı', value: `${target} (${target.id})`, inline: true },
                        { name: 'Yetkili', value: `${user}`, inline: true },
                        { name: 'Sebep', value: sebep }
                    ).setTimestamp().setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed], flags: 4096 });
            }
        }
        // ==================== GÖZALTINDAN ÇIKAR ====================
        else if (commandName === 'gozaltindan-cikar') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            const role = guild.roles.cache.get(GOZALTINDA_ROLE_ID);
            if (!role) return interaction.editReply({ content: `${EMOJIS.kirmizi} Gözaltında rolü bulunamadı!` });
            await targetMember.roles.remove(role, 'Gözaltından çıkarıldı');
            removeGozaltinda(target.id);
            await interaction.editReply({ content: `${EMOJIS.yesil} ${target.tag} gözaltından çıkarıldı.` });
            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00).setTitle(`${EMOJIS.yesil} GÖZALTINDAN ÇIKARILDI`)
                    .setDescription(`**${target.tag}** gözaltından çıkarıldı.`)
                    .addFields(
                        { name: 'Kullanıcı', value: `${target} (${target.id})`, inline: true },
                        { name: 'Yetkili', value: `${user}`, inline: true }
                    ).setTimestamp().setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed], flags: 4096 });
            }
        }
        // ==================== GÜVENLİK TARA ====================
        else if (commandName === 'guvenlik-tara') {
            let content = `MELEZYA GÜVENLİK - TAM SUNUCU TARAMASI\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n`;
            content += `ROLLER (${guild.roles.cache.size})\n`;
            for (const [id, role] of guild.roles.cache.sort((a, b) => b.position - a.position)) {
                const perms = role.permissions.toArray();
                const riskli = perms.includes('Administrator') || perms.includes('ManageGuild') || perms.includes('ManageRoles') || perms.includes('BanMembers') || perms.includes('KickMembers');
                content += `${riskli ? '[RISKLI]' : '        '} ${role.name} (${id}) - Üye: ${role.members.size} - Konum: ${role.position}\n`;
                if (riskli) content += `         Yetkiler: ${perms.join(', ')}\n`;
            }
            content += `\nKANALLAR (${guild.channels.cache.size})\n`;
            for (const [id, channel] of guild.channels.cache) content += `${channel.name} (${id}) - Tip: ${channel.type}\n`;
            content += `\nBOTLAR\n`;
            for (const [id, bot] of guild.members.cache.filter(m => m.user.bot)) {
                const perms = bot.permissions.toArray();
                content += `${perms.includes('Administrator') ? '[ADMIN]' : '       '} ${bot.user.tag} (${id}) - ${perms.join(', ') || 'Yetki yok'}\n`;
            }
            content += `\nWEBHOOKLAR\n`;
            const webhooks = await guild.fetchWebhooks();
            for (const [id, wh] of webhooks) content += `${wh.name} (${id}) - Kanal: ${wh.channel?.name || '?'} - Sahip: ${wh.owner?.tag || '?'}\n`;
            content += `\nDAVETLER (${(await guild.invites.fetch()).size})\n`;
            const invites = await guild.invites.fetch();
            for (const [code, inv] of invites) content += `${code} - ${inv.uses} kullanım - ${inv.channel?.name || '?'} - ${inv.inviter?.tag || '?'}\n`;
            const attachment = createLogFile(content, `guvenlik-tarama-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Güvenlik tarama raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Tarama raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== BOT DENETLE ====================
        else if (commandName === 'bot-denetle') {
            const bots = guild.members.cache.filter(m => m.user.bot);
            let content = `MELEZYA GÜVENLİK - BOT DENETİMİ\nToplam: ${bots.size} bot\n\n`;
            for (const [id, bot] of bots) {
                const perms = bot.permissions.toArray();
                content += `${bot.user.tag} (${id})\n   Katılma: ${bot.joinedAt?.toLocaleString('tr-TR') || '?'}\n   Roller: ${bot.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n   Yetkiler: ${perms.join(', ') || 'Yok'}\n   Administrator: ${perms.includes('Administrator') ? 'EVET (RISKLI)' : 'Hayır'}\n\n`;
            }
            const attachment = createLogFile(content, `bot-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Bot denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Bot denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== İZİN DENETLE ====================
        else if (commandName === 'izin-denetle') {
            const rol = interaction.options.getRole('rol');
            const kanal = interaction.options.getChannel('kanal');
            if (!rol && !kanal) return interaction.editReply({ content: `${EMOJIS.kirmizi} Bir rol veya kanal belirtmelisin!` });
            let content = `MELEZYA GÜVENLİK - İZİN DENETİMİ\n\n`;
            if (rol) {
                content += `ROL: ${rol.name} (${rol.id})\nRenk: ${rol.hexColor}\nÜye: ${rol.members.size}\nYetkiler: ${rol.permissions.toArray().join(', ') || 'Yok'}\nKonum: ${rol.position}\nMentionable: ${rol.mentionable}\nHoist: ${rol.hoist}\n\n`;
            }
            if (kanal) {
                content += `KANAL: ${kanal.name} (${kanal.id})\nTip: ${kanal.type}\nKategori: ${kanal.parent?.name || 'Yok'}\nİzinler:\n`;
                for (const [id, po] of kanal.permissionOverwrites.cache) {
                    const target = po.type === 0 ? guild.roles.cache.get(po.id)?.name : guild.members.cache.get(po.id)?.user?.tag;
                    content += `  ${target || po.id}:\n    Allow: ${po.allow.toArray().join(', ') || 'Yok'}\n    Deny: ${po.deny.toArray().join(', ') || 'Yok'}\n`;
                }
            }
            const attachment = createLogFile(content, `izin-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} İzin denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} İzin denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== ÜYE DENETLE ====================
        else if (commandName === 'uye-denetle') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            const userData = db.getUser(target.id);
            const warns = db.getWarns(target.id);
            const isCustody = db.isInCustody(target.id);
            let content = `MELEZYA GÜVENLİK - ÜYE DENETİMİ\n\nKullanıcı: ${target.tag} (${target.id})\nGörünen Ad: ${targetMember.displayName}\nBot mu: ${target.bot ? 'Evet' : 'Hayır'}\nHesap Oluşturma: ${target.createdAt.toLocaleString('tr-TR')}\nSunucuya Katılma: ${targetMember.joinedAt?.toLocaleString('tr-TR') || '?'}\nRoller: ${targetMember.roles.cache.map(r => r.name).join(', ') || 'Yok'}\nEn Yüksek Rol: ${targetMember.roles.highest.name}\nDurum: ${targetMember.presence?.status || 'offline'}\nSes Kanalı: ${targetMember.voice.channel?.name || 'Yok'}\nGözaltında: ${isCustody ? 'EVET' : 'Hayır'}\n\nSQLite Verileri:\n   Mesaj: ${userData?.messageCount || 0}\n   Ses: ${userData?.voiceMinutes || 0} dk\n   Uyarı: ${warns.length}\n`;
            const attachment = createLogFile(content, `uye-denetim-${target.id}-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Üye denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Üye denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== RİSKLİ ÜYELER ====================
        else if (commandName === 'riskli-uyeler') {
            const riskli = [];
            for (const [id, m] of guild.members.cache) {
                if (m.user.bot) continue;
                const perms = m.permissions.toArray();
                const riskliPerm = perms.includes('Administrator') || perms.includes('ManageGuild') || perms.includes('ManageRoles') || perms.includes('BanMembers') || perms.includes('KickMembers');
                const yeniHesap = (Date.now() - m.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000;
                const gozalti = gozaltinda[id] ? true : false;
                if (riskliPerm || yeniHesap || gozalti) riskli.push({ member: m, riskliPerm, yeniHesap, gozalti });
            }
            let content = `MELEZYA GÜVENLİK - RİSKLİ ÜYELER\nToplam: ${riskli.length}\n\n`;
            for (const r of riskli) {
                content += `${r.member.user.tag} (${r.member.id})\n`;
                if (r.riskliPerm) content += `   [RISKLI] Yüksek yetkili\n`;
                if (r.yeniHesap) content += `   [RISKLI] Yeni hesap (< 7 gün)\n`;
                if (r.gozalti) content += `   [RISKLI] Gözaltında\n`;
                content += `   Roller: ${r.member.roles.cache.map(ro => ro.name).join(', ') || 'Yok'}\n\n`;
            }
            const attachment = createLogFile(content, `riskli-uyeler-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Riskli üyeler raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Riskli üyeler raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== DAVET DENETLE ====================
        else if (commandName === 'davet-denetle') {
            const invites = await guild.invites.fetch();
            let content = `MELEZYA GÜVENLİK - DAVET DENETİMİ\nToplam: ${invites.size}\n\n`;
            for (const [code, inv] of invites) {
                content += `Kod: ${code}\n   Kanal: ${inv.channel?.name || '?'}\n   Davet Eden: ${inv.inviter?.tag || '?'} (${inv.inviter?.id || '?'})\n   Kullanım: ${inv.uses}/${inv.maxUses || '∞'}\n   Süre: ${inv.maxAge ? `${inv.maxAge} sn` : 'Sınırsız'}\n   Geçici: ${inv.temporary ? 'Evet' : 'Hayır'}\n   Oluşturma: ${inv.createdAt?.toLocaleString('tr-TR') || '?'}\n\n`;
            }
            const attachment = createLogFile(content, `davet-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Davet denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Davet denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== WEBHOOK DENETLE ====================
        else if (commandName === 'webhook-denetle') {
            const webhooks = await guild.fetchWebhooks();
            let content = `MELEZYA GÜVENLİK - WEBHOOK DENETİMİ\nToplam: ${webhooks.size}\n\n`;
            for (const [id, wh] of webhooks) {
                content += `İsim: ${wh.name} (${id})\n   Kanal: ${wh.channel?.name || '?'}\n   Sahip: ${wh.owner?.tag || '?'} (${wh.owner?.id || '?'})\n   Avatar: ${wh.avatarURL() || 'Yok'}\n   Token: ${wh.token ? 'Var' : 'Yok'}\n\n`;
            }
            const attachment = createLogFile(content, `webhook-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Webhook denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Webhook denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== GÜVENLİK RAPORU ====================
        else if (commandName === 'guvenlik-rapor') {
            const now = Date.now();
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            let content = `MELEZYA GÜVENLİK - 7 GÜNLÜK RAPOR\nRapor: ${new Date().toLocaleString('tr-TR')}\nDönem: ${new Date(weekAgo).toLocaleString('tr-TR')} - ${new Date(now).toLocaleString('tr-TR')}\n\n`;
            const newMembers = guild.members.cache.filter(m => m.joinedTimestamp > weekAgo);
            content += `YENİ ÜYELER (${newMembers.size})\n`;
            for (const [id, m] of newMembers) content += `${m.user.tag} (${id}) - ${m.joinedAt.toLocaleString('tr-TR')}\n`;
            content += `\n`;
            const gozaltiList = Object.values(gozaltinda).filter(g => new Date(g.tarih).getTime() > weekAgo);
            content += `GÖZALTINA ALINANLAR (${gozaltiList.length})\n`;
            for (const g of gozaltiList) {
                const u = await client.users.fetch(g.userId).catch(() => null);
                content += `${u ? u.tag : '?'} (${g.userId})\n   Sebep: ${g.sebep}\n   Yetkili: ${g.yetkili}\n   Tarih: ${new Date(g.tarih).toLocaleString('tr-TR')}\n\n`;
            }
            const bans = await guild.bans.fetch();
            content += `TOPLAM BAN (${bans.size})\n`;
            for (const [id, ban] of bans) content += `${ban.user.tag} (${id}) - Sebep: ${ban.reason || 'Belirtilmedi'}\n`;
            content += `\n`;
            const riskli = guild.members.cache.filter(m => {
                if (m.user.bot) return false;
                const perms = m.permissions.toArray();
                const riskliPerm = perms.includes('Administrator') || perms.includes('ManageGuild') || perms.includes('ManageRoles') || perms.includes('BanMembers') || perms.includes('KickMembers');
                const yeniHesap = (Date.now() - m.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000;
                return riskliPerm || yeniHesap;
            });
            content += `RİSKLİ ÜYELER (${riskli.size})\n`;
            for (const [id, m] of riskli) {
                content += `${m.user.tag} (${id})\n   Roller: ${m.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n   Hesap Yaşı: ${Math.floor((Date.now() - m.user.createdTimestamp) / (24 * 60 * 60 * 1000))} gün\n\n`;
            }
            const attachment = createLogFile(content, `guvenlik-rapor-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} 7 günlük güvenlik raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Güvenlik raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== GEÇMİŞ SORGULA ====================
        else if (commandName === 'gecmissorgula') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            const logData = loadUserLogFromDB(target.id);
            const warnData = db.getWarns(target.id);
            const totalRecords =
                (logData.messages?.length || 0) + (logData.voiceSessions?.length || 0) + (logData.roles?.length || 0) +
                (logData.nicknames?.length || 0) + (logData.warnings?.length || 0) + (logData.commands?.length || 0) +
                (logData.joins?.length || 0) + (logData.leaves?.length || 0) + (logData.mentions?.length || 0) +
                (logData.mentionedBy?.length || 0) + (logData.reactionsGiven?.length || 0) + (logData.reactionsReceived?.length || 0) +
                (logData.links?.length || 0) + (logData.files?.length || 0) + (logData.emojis?.length || 0) +
                (logData.statusHistory?.length || 0) + (logData.activityHistory?.length || 0) +
                (logData.usernameHistory?.length || 0) + (logData.avatarHistory?.length || 0);
            let content = `MELEZYA GÜVENLİK - KULLANICI RAPORU\n\n`;
            content += `TEMEL BILGILER\nKullanıcı Adı: ${target.username}\nGörünen Ad: ${target.globalName || target.username}\nKullanıcı ID: ${target.id}\nBot mu?: ${target.bot ? 'Evet' : 'Hayır'}\nHesap Oluşturma: ${target.createdAt.toLocaleString('tr-TR')}\nSunucuya Katılım: ${targetMember.joinedAt?.toLocaleString('tr-TR') || 'Bilinmiyor'}\n\n`;
            content += `GENEL İSTATİSTİKLER\nToplam Mesaj: ${logData.messageCount || 0}\nToplam Kelime: ${logData.wordCount || 0}\nToplam Karakter: ${logData.characterCount || 0}\nSes Süresi: ${logData.voiceMinutes || 0} dakika\nUyarı Sayısı: ${warnData.length}\nToplam Log Kaydı: ${totalRecords}\n\n`;
            content += `SON 100 MESAJ\n` + ((logData.messages || []).slice(0, 100).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] #${m.channel}: ${m.content || '(boş)'}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `PAYLAŞILAN LİNKLER (Son 30)\n` + ((logData.links || []).slice(0, 30).map((l, i) => `${i+1}. [${new Date(l.timestamp).toLocaleString('tr-TR')}] #${l.channel}: ${l.url}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `PAYLAŞILAN DOSYALAR (Son 30)\n` + ((logData.files || []).slice(0, 30).map((f, i) => `${i+1}. [${new Date(f.timestamp).toLocaleString('tr-TR')}] #${f.channel}: ${f.name} (${(f.size/1024).toFixed(2)} KB)`).join('\n') || '• Kayıt yok') + `\n\n`;
            const emojiCounts = {};
            (logData.emojis || []).forEach(e => { emojiCounts[e.emoji] = (emojiCounts[e.emoji] || 0) + 1; });
            content += `EN ÇOK KULLANILAN EMOJİLER\n` + (Object.entries(emojiCounts).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([emoji, count], i) => `${i+1}. ${emoji}: ${count} kez`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `ETİKETLEMELER\nKimi Etiketledi (Son 30):\n` + ((logData.mentions || []).slice(0, 30).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`).join('\n') || '• Kayıt yok') + `\n\nKim Onu Etiketledi (Son 30):\n` + ((logData.mentionedBy || []).slice(0, 30).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `TEPKİLER\nVerdiği (Son 30):\n` + ((logData.reactionsGiven || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} -> @${r.messageAuthor}`).join('\n') || '• Kayıt yok') + `\n\nAldığı (Son 30):\n` + ((logData.reactionsReceived || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} <- @${r.from}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `ROL DEĞİŞİKLİKLERİ\n` + ((logData.roles || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.type}: ${r.roles?.join(', ')}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `NICK DEĞİŞİKLİKLERİ\n` + ((logData.nicknames || []).map((n, i) => `${i+1}. [${new Date(n.timestamp).toLocaleString('tr-TR')}] ${n.old || '(yok)'} -> ${n.new || '(yok)'}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `KULLANICI ADI DEĞİŞİKLİKLERİ\n` + ((logData.usernameHistory || []).map((u, i) => `${i+1}. [${new Date(u.timestamp).toLocaleString('tr-TR')}] ${u.old} -> ${u.new}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `DURUM GEÇMİŞİ (Son 50)\n` + ((logData.statusHistory || []).slice(0, 50).map((s, i) => `${i+1}. [${new Date(s.timestamp).toLocaleString('tr-TR')}] ${s.old} -> ${s.new}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `AKTİVİTE GEÇMİŞİ (Son 50)\n` + ((logData.activityHistory || []).slice(0, 50).map((a, i) => `${i+1}. [${new Date(a.timestamp).toLocaleString('tr-TR')}] ${a.old || '(yok)'} -> ${a.new || '(yok)'}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `KULLANILAN KOMUTLAR (Son 100)\n` + ((logData.commands || []).slice(0, 100).map((c, i) => `${i+1}. [${new Date(c.timestamp).toLocaleString('tr-TR')}] /${c.command} ${c.args || ''}`).join('\n') || '• Kayıt yok') + `\n\n`;
            content += `RAPOR SONU - ${new Date().toLocaleString('tr-TR')}\nMELEZYA Bot ${EMOJIS.trbayrak}\n`;
            const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: `${target.username}-gecmis.log` });
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} **${target.username}** kullanıcısının geçmişi (${totalRecords} kayıt):`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Geçmiş raporu DM'ine gönderildi! (${totalRecords} kayıt)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
        }
        // ==================== ROL DENETLE ====================
        else if (commandName === 'rol-denetle') {
            const rol = interaction.options.getRole('rol');
            const members = rol.members.map(m => m);
            let content = `MELEZYA GÜVENLİK - ROL DENETİMİ\n\nRol: ${rol.name} (${rol.id})\nRenk: ${rol.hexColor}\nKonum: ${rol.position}\nMentionable: ${rol.mentionable}\nHoist: ${rol.hoist}\nÜye Sayısı: ${members.length}\n\nYetkiler:\n${rol.permissions.toArray().join(', ') || 'Yok'}\n\nÜyeler:\n`;
            for (const m of members) content += `${m.user.tag} (${m.id}) - Katılma: ${m.joinedAt?.toLocaleString('tr-TR') || '?'}\n`;
            const attachment = createLogFile(content, `rol-denetim-${rol.id}-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Rol denetim raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Rol denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== KANAL İZİN TARA ====================
        else if (commandName === 'kanal-izin-tara') {
            const riskli = [];
            let content = `MELEZYA GÜVENLİK - KANAL İZİN TARAMASI\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n`;
            for (const [id, kanal] of guild.channels.cache) {
                if (kanal.type !== 0 && kanal.type !== 5) continue;
                const everyoneOverwrite = kanal.permissionOverwrites.cache.get(guild.roles.everyone.id);
                if (!everyoneOverwrite) continue;
                const sendAcik = everyoneOverwrite.allow.has(PermissionsBitField.Flags.SendMessages);
                const nsfw = kanal.nsfw;
                const yasli = kanal.name.toLowerCase().includes('nsfw') || kanal.name.toLowerCase().includes('18') || kanal.name.toLowerCase().includes('yetiskin');
                if (sendAcik && (nsfw || yasli) && !kanal.name.toLowerCase().includes('log')) {
                    riskli.push({ kanal, nsfw, yasli });
                }
            }
            content += `Riskli Kanal Sayısı: ${riskli.length}\n\n`;
            for (const r of riskli) {
                content += `#${r.kanal.name} (${r.kanal.id})\n   NSFW: ${r.nsfw ? 'Evet' : 'Hayır'}\n   Yetişkin: ${r.yasli ? 'Evet' : 'Hayır'}\n   @everyone SendMessages: Açık\n\n`;
            }
            const attachment = createLogFile(content, `kanal-izin-tarama-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Kanal izin taraması:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Kanal izin taraması DM'ine gönderildi! (${riskli.length} riskli)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== WEBHOOK TEMİZLE ====================
        else if (commandName === 'webhook-temizle') {
            const webhooks = await guild.fetchWebhooks();
            if (webhooks.size === 0) return interaction.editReply({ content: `${EMOJIS.bilgi} Sunucuda webhook yok.` });
            const options = [];
            let i = 0;
            for (const [id, wh] of webhooks) {
                if (i >= 25) break;
                options.push({ label: `${wh.name} (#${wh.channel?.name || '?'})`, value: id, description: `Sahip: ${wh.owner?.tag || 'Bilinmiyor'}` });
                i++;
            }
            const select = new StringSelectMenuBuilder()
                .setCustomId('webhook_secim')
                .setPlaceholder('Silinecek webhook\'ları seç')
                .setMinValues(1)
                .setMaxValues(Math.min(options.length, 5))
                .addOptions(options);
            const row = new ActionRowBuilder().addComponents(select);
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle(`${EMOJIS.kalkan} WEBHOOK TEMİZLE`)
                .setDescription(`Sunucuda **${webhooks.size}** webhook var. Silmek istediklerini seç (en fazla 5).`)
                .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` });
            await interaction.editReply({ embeds: [embed], components: [row] });
        }
        // ==================== RAID MOD ====================
        else if (commandName === 'raid-mod') {
            const sureDk = parseInt(interaction.options.getString('sure')) || 10;
            const guild = interaction.guild;
            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            let kilitlenen = 0;
            for (const [id, kanal] of guild.channels.cache) {
                if (kanal.type === 0 && kanal.id !== LOG_CHANNEL_ID) {
                    try {
                        await kanal.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
                        kilitlenen++;
                    } catch (e) {}
                }
            }
            db.addRaidEvent(0, `raid_mod_${sureDk}dk`);
            await interaction.editReply({ content: `${EMOJIS.kalkan} **RAID MOD AKTİF!** ${kilitlenen} kanal kilitlendi. Süre: ${sureDk} dakika.` });
            if (logChannel) {
                await logChannel.send({ embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kalkan} RAID MOD AKTİF`)
                    .setDescription(`${user.tag} tarafından raid modu açıldı.`)
                    .addFields(
                        { name: 'Kilitlenen Kanal', value: `${kilitlenen}`, inline: true },
                        { name: 'Süre', value: `${sureDk} dakika`, inline: true },
                        { name: 'Yetkili', value: `${user}`, inline: true }
                    )
                    .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` })
                    .setTimestamp()] });
            }
            setTimeout(async () => {
                let acilan = 0;
                for (const [id, kanal] of guild.channels.cache) {
                    if (kanal.type === 0 && kanal.id !== LOG_CHANNEL_ID) {
                        try {
                            await kanal.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
                            acilan++;
                        } catch (e) {}
                    }
                }
                if (logChannel) {
                    await logChannel.send({ embeds: [new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`${EMOJIS.yesil} RAID MOD KAPATILDI`)
                        .setDescription(`Süre doldu, ${acilan} kanal açıldı.`)
                        .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` })
                        .setTimestamp()] });
                }
            }, sureDk * 60 * 1000);
        }
        // ==================== YENİ HESAP TARA ====================
        else if (commandName === 'yeni-hesap-tara') {
            const yeniHesaplar = guild.members.cache.filter(m => !m.user.bot && (Date.now() - m.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000);
            let content = `MELEZYA GÜVENLİK - YENİ HESAP TARAMASI\nTarih: ${new Date().toLocaleString('tr-TR')}\nToplam: ${yeniHesaplar.size}\n\n`;
            for (const [id, m] of yeniHesaplar) {
                content += `${m.user.tag} (${id})\n   Hesap Yaşı: ${Math.floor((Date.now() - m.user.createdTimestamp) / (24 * 60 * 60 * 1000))} gün\n   Sunucuya Katılma: ${m.joinedAt?.toLocaleString('tr-TR') || '?'}\n   Roller: ${m.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n\n`;
            }
            const attachment = createLogFile(content, `yeni-hesap-tarama-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Yeni hesap taraması:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Yeni hesap taraması DM'ine gönderildi! (${yeniHesaplar.size} hesap)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== ŞÜPHELİ ÜYE ====================
        else if (commandName === 'şüpheli-uye') {
            const birGunOnce = Date.now() - 24 * 60 * 60 * 1000;
            const supheliler = guild.members.cache.filter(m => !m.user.bot && m.joinedTimestamp > birGunOnce);
            const database = db.getDB();
            let content = `MELEZYA GÜVENLİK - ŞÜPHELİ ÜYELER (Son 24 saat katılım, mesaj yok)\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n`;
            let sayac = 0;
            for (const [id, m] of supheliler) {
                const mesajSayi = database.prepare('SELECT COUNT(*) as count FROM messages WHERE userId = ?').get(id);
                if (!mesajSayi || mesajSayi.count === 0) {
                    content += `${m.user.tag} (${id})\n   Katılma: ${m.joinedAt?.toLocaleString('tr-TR') || '?'}\n   Hesap Yaşı: ${Math.floor((Date.now() - m.user.createdTimestamp) / (24 * 60 * 60 * 1000))} gün\n\n`;
                    sayac++;
                }
            }
            content += `\nToplam Şüpheli: ${sayac}\n`;
            const attachment = createLogFile(content, `supheli-uye-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Şüpheli üye raporu:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Şüpheli üye raporu DM'ine gönderildi! (${sayac} üye)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        // ==================== BAN LİSTESİ ====================
        else if (commandName === 'ban-listesi') {
            const bans = await guild.bans.fetch();
            let content = `MELEZYA GÜVENLİK - BAN LİSTESİ\nTarih: ${new Date().toLocaleString('tr-TR')}\nToplam: ${bans.size}\n\n`;
            for (const [id, ban] of bans) {
                content += `${ban.user.tag} (${id})\n   Sebep: ${ban.reason || 'Belirtilmedi'}\n\n`;
            }
            const attachment = createLogFile(content, `ban-listesi-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Ban listesi:`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Ban listesi DM'ine gönderildi! (${bans.size} ban)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
    } catch (e) {
        console.error('Komut hatası:', e);
        try { await interaction.editReply({ content: `${EMOJIS.kirmizi} Bir hata oluştu: ${e.message}` }); } catch (err) {}
    }
});

// =========================== WEBHOOK SEÇİM / BUTON ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
    if (interaction.guildId !== GUILD_ID) return;
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === 'webhook_secim') {
            const secilenler = interaction.values;
            const guild = interaction.guild;
            const webhooks = await guild.fetchWebhooks();
            let liste = '';
            for (const id of secilenler) {
                const wh = webhooks.get(id);
                if (wh) liste += `- ${wh.name} (#${wh.channel?.name || '?'})\n`;
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`webhook_onay_${secilenler.join('_')}`).setLabel('Seçilenleri Sil').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('webhook_iptal').setLabel('İptal').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kalkan} WEBHOOK SİLME ONAYI`)
                    .setDescription(`Aşağıdaki webhook'lar **kalıcı olarak** silinecek:\n\n${liste}\nOnaylıyor musun?`)
                    .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` })],
                components: [row]
            });
        }
        else if (interaction.isButton() && interaction.customId.startsWith('webhook_onay_')) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: `${EMOJIS.kirmizi} Bu butonu sadece yöneticiler kullanabilir!`, ephemeral: true });
            }
            const ids = interaction.customId.replace('webhook_onay_', '').split('_');
            const guild = interaction.guild;
            const webhooks = await guild.fetchWebhooks();
            let silinen = 0;
            for (const id of ids) {
                const wh = webhooks.get(id);
                if (wh) {
                    try { await wh.delete('Webhook temizleme'); silinen++; } catch (e) {}
                }
            }
            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`${EMOJIS.yesil} WEBHOOK'LAR SİLİNDİ`)
                    .setDescription(`${silinen} webhook silindi.`)
                    .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` })],
                components: []
            });
        }
        else if (interaction.isButton() && interaction.customId === 'webhook_iptal') {
            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`${EMOJIS.carpi} İPTAL EDİLDİ`)
                    .setDescription('Webhook silme işlemi iptal edildi.')
                    .setFooter({ text: `MELEZYA Güvenlik ${EMOJIS.trbayrak}` })],
                components: []
            });
        }
    } catch (e) {
        console.error('Webhook etkileşim hatası:', e);
        try { await interaction.reply({ content: `${EMOJIS.kirmizi} Hata: ${e.message}`, ephemeral: true }); } catch (err) {}
    }
});

process.on('unhandledRejection', e => console.error('Hata:', e));

client.login(token2);
