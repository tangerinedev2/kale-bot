const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, AttachmentBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./data/db.js');

// =========================== KONFİG ===========================
const token2 = process.env.TOKEN2;
const GUILD_ID = '1543963769120497805';
const ADMIN_ID = '1332226105221971988';
const LOG_CHANNEL_ID = '1546327530267742420';
const GOZALTINDA_ROLE_ID = '1547933029979398226';
const SABIT_SES_KANALI_ID = '1546154071113728101';

// =========================== EMOJİLER ===========================
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
    kale: '<:KALE:1547935181430718516>'
};

// =========================== VERİ ===========================
const GOZALTINDA_PATH = path.join(__dirname, 'gozaltinda.json');
let gozaltinda = {};

function loadGozaltinda() {
    try {
        if (fs.existsSync(GOZALTINDA_PATH)) {
            gozaltinda = JSON.parse(fs.readFileSync(GOZALTINDA_PATH, 'utf8'));
        } else {
            fs.writeFileSync(GOZALTINDA_PATH, JSON.stringify({}, null, 2));
        }
    } catch (e) {
        gozaltinda = {};
    }
}

function saveGozaltinda() {
    try {
        fs.writeFileSync(GOZALTINDA_PATH, JSON.stringify(gozaltinda, null, 2));
    } catch (e) {}
}

function addGozaltinda(userId, sebep, yetkili) {
    gozaltinda[userId] = {
        userId,
        sebep: sebep || 'Belirtilmedi',
        yetkili: yetkili || 'Bilinmiyor',
        tarih: new Date().toISOString()
    };
    saveGozaltinda();
}

function removeGozaltinda(userId) {
    delete gozaltinda[userId];
    saveGozaltinda();
}

// =========================== KULLANICI LOG (SQLITE) ===========================
function loadUserLogFromDB(userId) {
    const database = db.getDB();
    const user = db.getUser(userId);
    const warns = db.getWarns(userId);
    
    const messages = database.prepare('SELECT * FROM messages WHERE userId = ? ORDER BY date DESC LIMIT 1000').all(userId).map(m => ({
        id: m.messageId, channel: m.channelName, content: m.content, timestamp: m.date
    }));
    
    const voiceSessions = database.prepare('SELECT * FROM voice_sessions WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(v => ({
        channel: v.channelName, duration: v.duration, timestamp: v.date, type: v.type
    }));
    
    const voicePeriods = database.prepare('SELECT * FROM voice_periods WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(v => ({
        channel: v.channelName, formatted: v.formatted, timestamp: v.date
    }));
    
    const commands = database.prepare('SELECT * FROM commands WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(c => ({
        command: c.command, args: c.args, timestamp: c.date
    }));
    
    const roles = database.prepare('SELECT * FROM role_history WHERE userId = ? ORDER BY date DESC LIMIT 100').all(userId).map(r => ({
        type: r.type, roles: [r.roleName], timestamp: r.date
    }));
    
    const nicknames = database.prepare('SELECT * FROM nickname_history WHERE userId = ? ORDER BY date DESC LIMIT 100').all(userId).map(n => ({
        old: n.oldNick, new: n.newNick, timestamp: n.date
    }));
    
    const usernameHistory = database.prepare('SELECT * FROM username_history WHERE userId = ? ORDER BY date DESC LIMIT 50').all(userId).map(u => ({
        old: u.oldUsername, new: u.newUsername, timestamp: u.date
    }));
    
    const avatarHistory = database.prepare('SELECT * FROM avatar_history WHERE userId = ? ORDER BY date DESC LIMIT 50').all(userId).map(a => ({
        old: a.oldAvatar, new: a.newAvatar, timestamp: a.date
    }));
    
    const statusHistory = database.prepare('SELECT * FROM status_history WHERE userId = ? ORDER BY date DESC LIMIT 200').all(userId).map(s => ({
        old: s.oldStatus, new: s.newStatus, timestamp: s.date
    }));
    
    const activityHistory = database.prepare('SELECT * FROM activity_history WHERE userId = ? ORDER BY date DESC LIMIT 200').all(userId).map(a => ({
        old: a.oldActivity, new: a.newActivity, timestamp: a.date
    }));
    
    const mentions = database.prepare('SELECT * FROM mentions WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(m => ({
        username: m.mentionedUserId, channel: m.channelName, timestamp: m.date
    }));
    
    const mentionedBy = database.prepare('SELECT * FROM mentioned_by WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(m => ({
        username: m.byUsername, channel: m.channelName, timestamp: m.date
    }));
    
    const reactionsGiven = database.prepare('SELECT * FROM reactions_given WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(r => ({
        emoji: r.emoji, messageAuthor: r.messageAuthor, timestamp: r.date
    }));
    
    const reactionsReceived = database.prepare('SELECT * FROM reactions_received WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(r => ({
        emoji: r.emoji, from: r.fromUsername, timestamp: r.date
    }));
    
    const links = database.prepare('SELECT * FROM links WHERE userId = ? ORDER BY date DESC LIMIT 300').all(userId).map(l => ({
        url: l.url, channel: l.channelName, timestamp: l.date
    }));
    
    const files = database.prepare('SELECT * FROM files WHERE userId = ? ORDER BY date DESC LIMIT 300').all(userId).map(f => ({
        name: f.name, size: f.size, channel: f.channelName, timestamp: f.date
    }));
    
    const emojis = database.prepare('SELECT * FROM emojis_used WHERE userId = ? ORDER BY date DESC LIMIT 500').all(userId).map(e => ({
        emoji: e.emoji, channel: e.channelName, timestamp: e.date
    }));
    
    const activity = database.prepare('SELECT * FROM activity WHERE userId = ? ORDER BY date DESC LIMIT 30').all(userId);
    const activeDays = {};
    activity.forEach(a => {
        activeDays[a.date] = {
            date: a.date,
            firstActivity: a.firstActivity,
            lastActivity: a.lastActivity,
            duration: a.duration,
            sessions: a.sessions,
            types: { message: a.messages, voice: a.voiceMinutes }
        };
    });
    
    return {
        userId: userId,
        createdAt: user?.createdAt,
        messageCount: user?.messageCount || 0,
        voiceMinutes: user?.voiceMinutes || 0,
        wordCount: user?.wordCount || 0,
        characterCount: user?.characterCount || 0,
        lastMessage: user?.lastMessage,
        messages: messages,
        voiceSessions: voiceSessions,
        voicePeriods: voicePeriods,
        commands: commands,
        roles: roles,
        nicknames: nicknames,
        usernameHistory: usernameHistory,
        avatarHistory: avatarHistory,
        statusHistory: statusHistory,
        activityHistory: activityHistory,
        mentions: mentions,
        mentionedBy: mentionedBy,
        reactionsGiven: reactionsGiven,
        reactionsReceived: reactionsReceived,
        links: links,
        files: files,
        emojis: emojis,
        warnings: warns.map(w => ({ reason: w.reason, by: w.byUser, timestamp: w.date })),
        joins: database.prepare("SELECT * FROM joins_leaves WHERE userId = ? AND type = 'join' ORDER BY date DESC LIMIT 10").all(userId).map(j => ({ tag: j.tag, timestamp: j.date })),
        leaves: database.prepare("SELECT * FROM joins_leaves WHERE userId = ? AND type = 'leave' ORDER BY date DESC LIMIT 10").all(userId).map(l => ({ tag: l.tag, timestamp: l.date })),
        activeDays: activeDays,
        dailyStats: {},
        hourlyActivity: {},
        channelActivity: {},
        voiceStats: {}
    };
}

// =========================== BOT ===========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});
// =========================== SLASH KOMUTLARI ===========================
const commands = [
    new SlashCommandBuilder()
        .setName('gozaltindakiler')
        .setDescription('Gözaltındaki üyeleri listeler (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('gozaltina-al')
        .setDescription('Bir üyeyi gözaltına alır')
        .addUserOption(option =>
            option.setName('kisi').setDescription('Gözaltına alınacak kişi').setRequired(true))
        .addStringOption(option =>
            option.setName('sebep').setDescription('Gözaltına alma sebebi').setRequired(false)),
    new SlashCommandBuilder()
        .setName('gozaltindan-cikar')
        .setDescription('Bir üyeyi gözaltından çıkarır')
        .addUserOption(option =>
            option.setName('kisi').setDescription('Gözaltından çıkarılacak kişi').setRequired(true)),
    new SlashCommandBuilder()
        .setName('guvenlik-tara')
        .setDescription('Sunucuyu güvenlik açısından tarar (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('bot-denetle')
        .setDescription('Sunucudaki botları denetler (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('izin-denetle')
        .setDescription('Rol veya kanal izinlerini denetler')
        .addRoleOption(option =>
            option.setName('rol').setDescription('Denetlenecek rol').setRequired(false))
        .addChannelOption(option =>
            option.setName('kanal').setDescription('Denetlenecek kanal').setRequired(false)),
    new SlashCommandBuilder()
        .setName('uye-denetle')
        .setDescription('Bir üyeyi detaylı denetler')
        .addUserOption(option =>
            option.setName('kisi').setDescription('Denetlenecek kişi').setRequired(true)),
    new SlashCommandBuilder()
        .setName('riskli-uyeler')
        .setDescription('Riskli üyeleri listeler (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('davet-denetle')
        .setDescription('Sunucudaki davet linklerini denetler (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('webhook-denetle')
        .setDescription('Sunucudaki webhook\'ları denetler (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('guvenlik-rapor')
        .setDescription('7 günlük güvenlik raporu (DM\'den .log)'),
    new SlashCommandBuilder()
        .setName('gecmissorgula')
        .setDescription('Bir kullanıcının tüm geçmişini DM\'den .log olarak gönderir')
        .addUserOption(option =>
            option.setName('kisi').setDescription('Geçmişi sorgulanacak kişi').setRequired(true))
];

// =========================== YARDIMCI FONKSİYONLAR ===========================
function createLogFile(content, fileName) {
    const buffer = Buffer.from(content, 'utf-8');
    return new AttachmentBuilder(buffer, { name: fileName });
}

async function sendDM(user, content, attachment = null) {
    try {
        const dm = await user.createDM();
        if (attachment) {
            await dm.send({ content, files: [attachment] });
        } else {
            await dm.send({ content });
        }
        return true;
    } catch (e) {
        return false;
    }
}

// =========================== SABİT SES KANALI ===========================
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
            console.log(`${EMOJIS.yesil} Sabit ses kanalına katıldı: ${hedefKanal.name}`);
        }
    } catch (e) {
        console.error('Ses kanalı hatası:', e);
    }
}

// =========================== READY ===========================
client.once('ready', async () => {
    loadGozaltinda();
    console.log(`${EMOJIS.kalkan} ${client.user.tag} hazır! ${EMOJIS.trbayrak}`);

    const rest = new REST({ version: '10' }).setToken(token2);
    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, GUILD_ID),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log(`${EMOJIS.yesil} Slash komutları kaydedildi!`);
    } catch (e) {
        console.error('Komut kaydetme hatası:', e);
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
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
    } catch (e) {
        console.error('Ses kanalına katılma hatası:', e);
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
            if (list.length === 0) {
                return interaction.editReply({ content: `${EMOJIS.sari} Gözaltında kimse yok.` });
            }

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           UKRAYNAA GÜVENLİK - GÖZALTINDAKİLER LİSTESİ       ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam: ${list.length} kişi\n\n`;

            for (const [i, data] of list.entries()) {
                const u = await client.users.fetch(data.userId).catch(() => null);
                content += `${i + 1}. ${u ? u.tag : 'Bilinmeyen'} (${data.userId})\n`;
                content += `   Sebep: ${data.sebep}\n`;
                content += `   Yetkili: ${data.yetkili}\n`;
                content += `   Tarih: ${new Date(data.tarih).toLocaleString('tr-TR')}\n\n`;
            }

            const attachment = createLogFile(content, `gozaltindakiler-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kelepce} Gözaltındakiler listesi:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Liste DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
            }
        }

        // ==================== GÖZALTINA AL ====================
        else if (commandName === 'gozaltina-al') {
            const target = interaction.options.getUser('kisi');
            const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
            const targetMember = await guild.members.fetch(target.id).catch(() => null);

            if (!targetMember) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            }

            const role = guild.roles.cache.get(GOZALTINDA_ROLE_ID);
            if (!role) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Gözaltında rolü bulunamadı!` });
            }

            await targetMember.roles.add(role, `Gözaltına alındı: ${sebep}`);
            addGozaltinda(target.id, sebep, user.tag);

            await interaction.editReply({ content: `${EMOJIS.kelepce} ${target.tag} gözaltına alındı. Sebep: ${sebep}` });

            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(`${EMOJIS.kelepce} GÖZALTINA ALINDI`)
                    .setDescription(`**${target.tag}** gözaltına alındı.`)
                    .addFields(
                        { name: 'Kullanıcı', value: `${target} (${target.id})`, inline: true },
                        { name: 'Yetkili', value: `${user}`, inline: true },
                        { name: 'Sebep', value: sebep }
                    )
                    .setTimestamp()
                    .setFooter({ text: `UKRAYNAA Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed], flags: 4096 });
            }
        }

        // ==================== GÖZALTINDAN ÇIKAR ====================
        else if (commandName === 'gozaltindan-cikar') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);

            if (!targetMember) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            }

            const role = guild.roles.cache.get(GOZALTINDA_ROLE_ID);
            if (!role) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Gözaltında rolü bulunamadı!` });
            }

            await targetMember.roles.remove(role, 'Gözaltından çıkarıldı');
            removeGozaltinda(target.id);

            await interaction.editReply({ content: `${EMOJIS.yesil} ${target.tag} gözaltından çıkarıldı.` });

            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`${EMOJIS.yesil} GÖZALTINDAN ÇIKARILDI`)
                    .setDescription(`**${target.tag}** gözaltından çıkarıldı.`)
                    .addFields(
                        { name: 'Kullanıcı', value: `${target} (${target.id})`, inline: true },
                        { name: 'Yetkili', value: `${user}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: `UKRAYNAA Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed], flags: 4096 });
            }
        }

        // ==================== GÜVENLİK TARA ====================
        else if (commandName === 'guvenlik-tara') {
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║          UKRAYNAA GÜVENLİK - TAM SUNUCU TARAMASI           ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Tarih: ${new Date().toLocaleString('tr-TR')}\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `ROLLER (${guild.roles.cache.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, role] of guild.roles.cache.sort((a, b) => b.position - a.position)) {
                const perms = role.permissions.toArray();
                const riskli = perms.includes('Administrator') || perms.includes('ManageGuild') || perms.includes('ManageRoles') || perms.includes('BanMembers') || perms.includes('KickMembers');
                content += `${riskli ? '⚠️' : '  '} ${role.name} (${id})\n`;
                content += `   Renk: ${role.hexColor} | Üye: ${role.members.size} | Konum: ${role.position}\n`;
                if (riskli) content += `   Yetkiler: ${perms.join(', ')}\n`;
            }
            content += `\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `KANALLAR (${guild.channels.cache.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, channel] of guild.channels.cache) {
                content += `${channel.name} (${id}) - Tip: ${channel.type}\n`;
            }
            content += `\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `BOTLAR\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, bot] of guild.members.cache.filter(m => m.user.bot)) {
                const perms = bot.permissions.toArray();
                const riskli = perms.includes('Administrator');
                content += `${riskli ? '⚠️' : '  '} ${bot.user.tag} (${id})\n`;
                content += `   Yetkiler: ${perms.join(', ') || 'Yok'}\n`;
            }
            content += `\n`;

            const webhooks = await guild.fetchWebhooks();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `WEBHOOK'LAR (${webhooks.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, wh] of webhooks) {
                content += `${wh.name} (${id})\n`;
                content += `   Kanal: ${wh.channel?.name || 'Bilinmiyor'} | Sahip: ${wh.owner?.tag || 'Bilinmiyor'}\n`;
            }
            content += `\n`;

            const invites = await guild.invites.fetch();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `DAVETLER (${invites.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [code, inv] of invites) {
                content += `${code} - ${inv.uses} kullanım\n`;
                content += `   Kanal: ${inv.channel?.name || 'Bilinmiyor'} | Davet eden: ${inv.inviter?.tag || 'Bilinmiyor'}\n`;
            }

            const attachment = createLogFile(content, `guvenlik-tarama-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Güvenlik tarama raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Tarama raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== BOT DENETLE ====================
        else if (commandName === 'bot-denetle') {
            const bots = guild.members.cache.filter(m => m.user.bot);
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║              UKRAYNAA GÜVENLİK - BOT DENETİMİ              ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam Bot: ${bots.size}\n\n`;

            for (const [id, bot] of bots) {
                const perms = bot.permissions.toArray();
                content += `🤖 ${bot.user.tag} (${id})\n`;
                content += `   Sunucuya katılma: ${bot.joinedAt?.toLocaleString('tr-TR') || 'Bilinmiyor'}\n`;
                content += `   Roller: ${bot.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n`;
                content += `   Yetkiler: ${perms.join(', ') || 'Yok'}\n`;
                content += `   Administrator: ${perms.includes('Administrator') ? 'EVET ⚠️' : 'Hayır'}\n\n`;
            }

            const attachment = createLogFile(content, `bot-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Bot denetim raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Bot denetim raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== İZİN DENETLE ====================
        else if (commandName === 'izin-denetle') {
            const rol = interaction.options.getRole('rol');
            const kanal = interaction.options.getChannel('kanal');

            if (!rol && !kanal) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Bir rol veya kanal belirtmelisin!` });
            }

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║            UKRAYNAA GÜVENLİK - İZİN DENETİMİ              ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;

            if (rol) {
                content += `ROL: ${rol.name} (${rol.id})\n`;
                content += `Renk: ${rol.hexColor}\n`;
                content += `Üye: ${rol.members.size}\n`;
                content += `Yetkiler: ${rol.permissions.toArray().join(', ') || 'Yok'}\n`;
                content += `Konum: ${rol.position}\n`;
                content += `Mentionable: ${rol.mentionable}\n`;
                content += `Hoist: ${rol.hoist}\n\n`;
            }

            if (kanal) {
                content += `KANAL: ${kanal.name} (${kanal.id})\n`;
                content += `Tip: ${kanal.type}\n`;
                content += `Kategori: ${kanal.parent?.name || 'Yok'}\n`;
                content += `İzinler:\n`;
                for (const [id, po] of kanal.permissionOverwrites.cache) {
                    const target = po.type === 0 ? guild.roles.cache.get(po.id)?.name : guild.members.cache.get(po.id)?.user?.tag;
                    content += `  ${target || po.id}:\n`;
                    content += `    Allow: ${po.allow.toArray().join(', ') || 'Yok'}\n`;
                    content += `    Deny: ${po.deny.toArray().join(', ') || 'Yok'}\n`;
                }
            }

            const attachment = createLogFile(content, `izin-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} İzin denetim raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} İzin denetim raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== ÜYE DENETLE ====================
        else if (commandName === 'uye-denetle') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);

            if (!targetMember) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            }

            const userData = db.getUser(target.id);
            const warns = db.getWarns(target.id);
            const isCustody = db.isInCustody(target.id);

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║              UKRAYNAA GÜVENLİK - ÜYE DENETİMİ              ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Kullanıcı: ${target.tag} (${target.id})\n`;
            content += `Görünen Ad: ${targetMember.displayName}\n`;
            content += `Bot mu: ${target.bot ? 'Evet' : 'Hayır'}\n`;
            content += `Hesap Oluşturma: ${target.createdAt.toLocaleString('tr-TR')}\n`;
            content += `Sunucuya Katılma: ${targetMember.joinedAt?.toLocaleString('tr-TR') || 'Bilinmiyor'}\n`;
            content += `Roller: ${targetMember.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n`;
            content += `En Yüksek Rol: ${targetMember.roles.highest.name}\n`;
            content += `Durum: ${targetMember.presence?.status || 'offline'}\n`;
            content += `Ses Kanalı: ${targetMember.voice.channel?.name || 'Yok'}\n`;
            content += `Gözaltında: ${isCustody ? 'EVET' : 'Hayır'}\n`;
            content += `\n📊 SQLite Verileri:\n`;
            content += `   Mesaj Sayısı: ${userData?.messageCount || 0}\n`;
            content += `   Ses Süresi: ${userData?.voiceMinutes || 0} dk\n`;
            content += `   Uyarı Sayısı: ${warns.length}\n`;

            const attachment = createLogFile(content, `uye-denetim-${target.id}-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Üye denetim raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Üye denetim raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
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
                if (riskliPerm || yeniHesap || gozalti) {
                    riskli.push({ member: m, riskliPerm, yeniHesap, gozalti });
                }
            }

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║             UKRAYNAA GÜVENLİK - RİSKLİ ÜYELER              ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam Riskli: ${riskli.length}\n\n`;

            for (const r of riskli) {
                content += `${r.member.user.tag} (${r.member.id})\n`;
                if (r.riskliPerm) content += `   ⚠️ Yüksek yetkili\n`;
                if (r.yeniHesap) content += `   ⚠️ Yeni hesap (< 7 gün)\n`;
                if (r.gozalti) content += `   ⚠️ Gözaltında\n`;
                content += `   Roller: ${r.member.roles.cache.map(ro => ro.name).join(', ') || 'Yok'}\n\n`;
            }

            const attachment = createLogFile(content, `riskli-uyeler-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Riskli üyeler raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Riskli üyeler raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== DAVET DENETLE ====================
        else if (commandName === 'davet-denetle') {
            const invites = await guild.invites.fetch();
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║            UKRAYNAA GÜVENLİK - DAVET DENETİMİ             ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam Davet: ${invites.size}\n\n`;

            for (const [code, inv] of invites) {
                content += `Kod: ${code}\n`;
                content += `   Kanal: ${inv.channel?.name || 'Bilinmiyor'}\n`;
                content += `   Davet Eden: ${inv.inviter?.tag || 'Bilinmiyor'} (${inv.inviter?.id || '?'})\n`;
                content += `   Kullanım: ${inv.uses}/${inv.maxUses || '∞'}\n`;
                content += `   Süre: ${inv.maxAge ? `${inv.maxAge} saniye` : 'Sınırsız'}\n`;
                content += `   Geçici: ${inv.temporary ? 'Evet' : 'Hayır'}\n`;
                content += `   Oluşturma: ${inv.createdAt?.toLocaleString('tr-TR') || 'Bilinmiyor'}\n\n`;
            }

            const attachment = createLogFile(content, `davet-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Davet denetim raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Davet denetim raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== WEBHOOK DENETLE ====================
        else if (commandName === 'webhook-denetle') {
            const webhooks = await guild.fetchWebhooks();
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           UKRAYNAA GÜVENLİK - WEBHOOK DENETİMİ             ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam Webhook: ${webhooks.size}\n\n`;

            for (const [id, wh] of webhooks) {
                content += `İsim: ${wh.name} (${id})\n`;
                content += `   Kanal: ${wh.channel?.name || 'Bilinmiyor'}\n`;
                content += `   Sahip: ${wh.owner?.tag || 'Bilinmiyor'} (${wh.owner?.id || '?'})\n`;
                content += `   Avatar: ${wh.avatarURL() || 'Yok'}\n`;
                content += `   Token: ${wh.token ? 'Var' : 'Yok'}\n\n`;
            }

            const attachment = createLogFile(content, `webhook-denetim-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} Webhook denetim raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Webhook denetim raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== GÜVENLİK RAPORU ====================
        else if (commandName === 'guvenlik-rapor') {
            const now = Date.now();
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           UKRAYNAA GÜVENLİK - 7 GÜNLÜK RAPOR               ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
            content += `Dönem: ${new Date(weekAgo).toLocaleString('tr-TR')} - ${new Date(now).toLocaleString('tr-TR')}\n\n`;

            const newMembers = guild.members.cache.filter(m => m.joinedTimestamp > weekAgo);
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `YENİ ÜYELER (${newMembers.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, m] of newMembers) {
                content += `${m.user.tag} (${id}) - ${m.joinedAt.toLocaleString('tr-TR')}\n`;
            }
            content += `\n`;

            const gozaltiList = Object.values(gozaltinda).filter(g => new Date(g.tarih).getTime() > weekAgo);
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `GÖZALTINA ALINANLAR (${gozaltiList.length})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const g of gozaltiList) {
                const u = await client.users.fetch(g.userId).catch(() => null);
                content += `${u ? u.tag : 'Bilinmeyen'} (${g.userId})\n`;
                content += `   Sebep: ${g.sebep}\n`;
                content += `   Yetkili: ${g.yetkili}\n`;
                content += `   Tarih: ${new Date(g.tarih).toLocaleString('tr-TR')}\n\n`;
            }

            const bans = await guild.bans.fetch();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `TOPLAM BAN (${bans.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, ban] of bans) {
                content += `${ban.user.tag} (${id}) - Sebep: ${ban.reason || 'Belirtilmedi'}\n`;
            }
            content += `\n`;

            const riskli = guild.members.cache.filter(m => {
                if (m.user.bot) return false;
                const perms = m.permissions.toArray();
                const riskliPerm = perms.includes('Administrator') || perms.includes('ManageGuild') || perms.includes('ManageRoles') || perms.includes('BanMembers') || perms.includes('KickMembers');
                const yeniHesap = (Date.now() - m.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000;
                return riskliPerm || yeniHesap;
            });
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `RİSKLİ ÜYELER (${riskli.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, m] of riskli) {
                content += `${m.user.tag} (${id})\n`;
                content += `   Roller: ${m.roles.cache.map(r => r.name).join(', ') || 'Yok'}\n`;
                content += `   Hesap Yaşı: ${Math.floor((Date.now() - m.user.createdTimestamp) / (24 * 60 * 60 * 1000))} gün\n\n`;
            }

            const attachment = createLogFile(content, `guvenlik-rapor-${Date.now()}.log`);
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} 7 günlük güvenlik raporu:`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Güvenlik raporu DM'ine gönderildi!` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
            }
        }

        // ==================== GEÇMİŞ SORGULA ====================
        else if (commandName === 'gecmissorgula') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);

            if (!targetMember) {
                return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            }

            const logData = loadUserLogFromDB(target.id);
            const warnData = db.getWarns(target.id);

            const totalRecords = 
                (logData.messages?.length || 0) +
                (logData.voiceSessions?.length || 0) +
                (logData.roles?.length || 0) +
                (logData.nicknames?.length || 0) +
                (logData.warnings?.length || 0) +
                (logData.commands?.length || 0) +
                (logData.joins?.length || 0) +
                (logData.leaves?.length || 0) +
                (logData.mentions?.length || 0) +
                (logData.mentionedBy?.length || 0) +
                (logData.reactionsGiven?.length || 0) +
                (logData.reactionsReceived?.length || 0) +
                (logData.links?.length || 0) +
                (logData.files?.length || 0) +
                (logData.emojis?.length || 0) +
                (logData.statusHistory?.length || 0) +
                (logData.activityHistory?.length || 0) +
                (logData.usernameHistory?.length || 0) +
                (logData.avatarHistory?.length || 0);

            let content = '';
            content += `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           UKRAYNAA GÜVENLİK - KULLANICI RAPORU              ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `👤 TEMEL BİLGİLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `• Kullanıcı Adı: ${target.username}\n`;
            content += `• Görünen Ad: ${target.globalName || target.username}\n`;
            content += `• Kullanıcı ID: ${target.id}\n`;
            content += `• Bot mu?: ${target.bot ? 'Evet' : 'Hayır'}\n`;
            content += `• Hesap Oluşturma: ${target.createdAt.toLocaleString('tr-TR')}\n`;
            content += `• Sunucuya Katılım: ${targetMember.joinedAt?.toLocaleString('tr-TR') || 'Bilinmiyor'}\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `📊 GENEL İSTATİSTİKLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `• Toplam Mesaj: ${logData.messageCount || 0}\n`;
            content += `• Toplam Kelime: ${logData.wordCount || 0}\n`;
            content += `• Toplam Karakter: ${logData.characterCount || 0}\n`;
            content += `• Ses Süresi: ${logData.voiceMinutes || 0} dakika\n`;
            content += `• Uyarı Sayısı: ${warnData.length}\n`;
            content += `• Toplam Log Kaydı: ${totalRecords}\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `💬 SON 100 MESAJ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.messages || []).slice(0, 100).map((m, i) => 
                `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] #${m.channel}: ${m.content || '(boş)'}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🔗 PAYLAŞILAN LİNKLER (Son 30)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.links || []).slice(0, 30).map((l, i) => 
                `${i+1}. [${new Date(l.timestamp).toLocaleString('tr-TR')}] #${l.channel}: ${l.url}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `📎 PAYLAŞILAN DOSYALAR (Son 30)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.files || []).slice(0, 30).map((f, i) => 
                `${i+1}. [${new Date(f.timestamp).toLocaleString('tr-TR')}] #${f.channel}: ${f.name} (${(f.size/1024).toFixed(2)} KB)`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `😀 EN ÇOK KULLANILAN EMOJİLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            const emojiCounts = {};
            (logData.emojis || []).forEach(e => { emojiCounts[e.emoji] = (emojiCounts[e.emoji] || 0) + 1; });
            content += Object.entries(emojiCounts).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([emoji, count], i) => 
                `${i+1}. ${emoji}: ${count} kez`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `👥 ETİKETLEMELER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `Kimi Etiketledi (Son 30):\n`;
            content += (logData.mentions || []).slice(0, 30).map((m, i) => 
                `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`
            ).join('\n') || '• Kayıt yok';
            content += `\n\nKim Onu Etiketledi (Son 30):\n`;
            content += (logData.mentionedBy || []).slice(0, 30).map((m, i) => 
                `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `😊 TEPKİLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `Verdiği (Son 30):\n`;
            content += (logData.reactionsGiven || []).slice(0, 30).map((r, i) => 
                `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} → @${r.messageAuthor}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\nAldığı (Son 30):\n`;
            content += (logData.reactionsReceived || []).slice(0, 30).map((r, i) => 
                `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} ← @${r.from}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🎭 ROL DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.roles || []).slice(0, 30).map((r, i) => 
                `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.type}: ${r.roles?.join(', ')}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `✏️ NICK DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.nicknames || []).map((n, i) => 
                `${i+1}. [${new Date(n.timestamp).toLocaleString('tr-TR')}] ${n.old || '(yok)'} → ${n.new || '(yok)'}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `📛 KULLANICI ADI DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.usernameHistory || []).map((u, i) => 
                `${i+1}. [${new Date(u.timestamp).toLocaleString('tr-TR')}] ${u.old} → ${u.new}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🟢 DURUM GEÇMİŞİ (Son 50)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.statusHistory || []).slice(0, 50).map((s, i) => 
                `${i+1}. [${new Date(s.timestamp).toLocaleString('tr-TR')}] ${s.old} → ${s.new}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🎮 AKTİVİTE GEÇMİŞİ (Son 50)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.activityHistory || []).slice(0, 50).map((a, i) => 
                `${i+1}. [${new Date(a.timestamp).toLocaleString('tr-TR')}] ${a.old || '(yok)'} → ${a.new || '(yok)'}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `💻 KULLANILAN KOMUTLAR (Son 100)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.commands || []).slice(0, 100).map((c, i) => 
                `${i+1}. [${new Date(c.timestamp).toLocaleString('tr-TR')}] /${c.command} ${c.args || ''}`
            ).join('\n') || '• Kayıt yok';
            content += `\n\n`;

            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `RAPOR SONU - ${new Date().toLocaleString('tr-TR')}\n`;
            content += `UKRAYNAA Bot ${EMOJIS.trbayrak}\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;

            const buffer = Buffer.from(content, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `${target.username}-gecmis.log` });

            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} **${target.username}** kullanıcısının geçmişi (${totalRecords} kayıt):`, attachment);

            if (dmSuccess) {
                await interaction.editReply({ content: `${EMOJIS.yesil} Geçmiş raporu DM'ine gönderildi! (${totalRecords} kayıt)` });
            } else {
                await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
            }
        }

    } catch (e) {
        console.error('Komut hatası:', e);
        await interaction.editReply({ content: `${EMOJIS.kirmizi} Bir hata oluştu: ${e.message}` });
    }
});

// =========================== HATA ===========================
process.on('unhandledRejection', e => console.error('❌ Hata:', e));

client.login(token2);
