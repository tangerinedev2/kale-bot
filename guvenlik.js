// ============================================================
// KALE GUARD BOT - SQLite Sürümü
// Veri sahibi bot. Tüm veriler SQLite'ta.
// ============================================================

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
        .setDescription('7 günlük güvenlik raporu (DM\'den .log)')
];

// =========================== YARDIMCI ===========================
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
    console.log(`${EMOJIS.kalkan} ${client.user.tag} hazır! ${EMOJIS.trbayrak}`);
    console.log(`📊 SQLite veritabanı: data/kale.db`);

    // Slash komutlarını kaydet
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

    // Sabit ses kanalına katıl
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
            const list = db.getCustodyList();
            if (list.length === 0) {
                return interaction.editReply({ content: `${EMOJIS.sari} Gözaltında kimse yok.` });
            }

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           KALE GÜVENLİK - GÖZALTINDAKİLER LİSTESİ           ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Toplam: ${list.length} kişi\n\n`;

            for (const [i, data] of list.entries()) {
                const u = await client.users.fetch(data.userId).catch(() => null);
                content += `${i + 1}. ${u ? u.tag : 'Bilinmeyen'} (${data.userId})\n`;
                content += `   Sebep: ${data.reason}\n`;
                content += `   Yetkili: ${data.byUser}\n`;
                content += `   Tarih: ${new Date(data.date).toLocaleString('tr-TR')}\n\n`;
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
            db.addCustody(target.id, sebep, user.tag, user.id);

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
                    .setFooter({ text: `KALE Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed] });
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
            db.removeCustody(target.id);

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
                    .setFooter({ text: `KALE Güvenlik ${EMOJIS.trbayrak}` });
                await logChannel.send({ embeds: [embed] });
            }
        }

        // ==================== GÜVENLİK TARA ====================
        else if (commandName === 'guvenlik-tara') {
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║              KALE GÜVENLİK - TAM SUNUCU TARAMASI            ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Tarih: ${new Date().toLocaleString('tr-TR')}\n\n`;

            // Roller
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

            // Kanallar
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `KANALLAR (${guild.channels.cache.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, channel] of guild.channels.cache) {
                content += `${channel.name} (${id}) - Tip: ${channel.type}\n`;
            }
            content += `\n`;

            // Botlar
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

            // Webhook'lar
            const webhooks = await guild.fetchWebhooks();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `WEBHOOK'LAR (${webhooks.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, wh] of webhooks) {
                content += `${wh.name} (${id})\n`;
                content += `   Kanal: ${wh.channel?.name || 'Bilinmiyor'} | Sahip: ${wh.owner?.tag || 'Bilinmiyor'}\n`;
            }
            content += `\n`;

            // Davetler
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
            content += `║                 KALE GÜVENLİK - BOT DENETİMİ                ║\n`;
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
            content += `║                KALE GÜVENLİK - İZİN DENETİMİ                 ║\n`;
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
            content += `║                 KALE GÜVENLİK - ÜYE DENETİMİ                 ║\n`;
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
                const gozalti = db.isInCustody(id);
                if (riskliPerm || yeniHesap || gozalti) {
                    riskli.push({ member: m, riskliPerm, yeniHesap, gozalti });
                }
            }

            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║                KALE GÜVENLİK - RİSKLİ ÜYELER                 ║\n`;
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
            content += `║                KALE GÜVENLİK - DAVET DENETİMİ                ║\n`;
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
            content += `║               KALE GÜVENLİK - WEBHOOK DENETİMİ               ║\n`;
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
            content += `║              KALE GÜVENLİK - 7 GÜNLÜK RAPOR                 ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
            content += `Dönem: ${new Date(weekAgo).toLocaleString('tr-TR')} - ${new Date(now).toLocaleString('tr-TR')}\n\n`;

            // Yeni üyeler
            const newMembers = guild.members.cache.filter(m => m.joinedTimestamp > weekAgo);
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `YENİ ÜYELER (${newMembers.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, m] of newMembers) {
                content += `${m.user.tag} (${id}) - ${m.joinedAt.toLocaleString('tr-TR')}\n`;
            }
            content += `\n`;

            // Gözaltına alınanlar
            const gozaltiList = db.getCustodyList();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `GÖZALTINA ALINANLAR (${gozaltiList.length})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const g of gozaltiList) {
                const u = await client.users.fetch(g.userId).catch(() => null);
                content += `${u ? u.tag : 'Bilinmeyen'} (${g.userId})\n`;
                content += `   Sebep: ${g.reason}\n`;
                content += `   Yetkili: ${g.byUser}\n`;
                content += `   Tarih: ${new Date(g.date).toLocaleString('tr-TR')}\n\n`;
            }

            // Banlar
            const bans = await guild.bans.fetch();
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `TOPLAM BAN (${bans.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, ban] of bans) {
                content += `${ban.user.tag} (${id}) - Sebep: ${ban.reason || 'Belirtilmedi'}\n`;
            }
            content += `\n`;

            // Riskli üyeler
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

    } catch (e) {
        console.error('Komut hatası:', e);
        db.addErrorLog(interaction.commandName, e.message, e.stack, user.id, guild.id);
        await interaction.editReply({ content: `${EMOJIS.kirmizi} Bir hata oluştu: ${e.message}` });
    }
});

// =========================== HATA ===========================
process.on('unhandledRejection', e => console.error('❌ Hata:', e));

client.login(token2);
