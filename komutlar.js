const PREFIX = 'mz!';
const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const db = require('./data/db.js');
const TRIVIA_SORULARI = require('./trivia.js');

const EPHEMERAL = 64;

// =========================== EMOJİLER ===========================
const EMOJI = {
    tik: '<a:tik:1546323559008178367>',
    carpi: '<a:carpi:1546323711567859712>',
    sari: '<:sari:1547953694631395389>',
    kirmizi: '<:kirmizi:1547953692836241468>',
    yesil: '<:yesil:1547953691577942048>',
    dogrulandi: '<:dogrulandi:1547953690202083358>',
    dogrulanmadi: '<:dogrulanmadi:1547953689006710945>',
    kelepce: '<:kelepce:1547953687333183609>',
    kurucu: '<:kurucu:1547953686376878090>',
    kalkan: '<:kalkan:1547953684942430308>',
    yukleniyor: '<a:yukleniyor:1547711418407583765>',
    trbayrak: '<a:trbayrak:1546565825304072365>',
    bbknk: '<a:bbknk:1546323191918624768>',
    hosgeldin: '<a:Hosgeldin:1546322757938188308>',
    kale: '<:logo:1561439840351035434>',
    bilgi: '<:bilgi:1559527127961837668>',
    banhammer: '<:banhammer:1559526130560794645>',
    kick: '<:kick:1559528100998414346>',
    mute: '<:mute:1559528855591587901>',
    lock: '<:lock:1559531602814439465>',
    temizle: '<a:temizle:1559531786923413504>',
    silah: '<:silah:1559531954649440356>',
    fire: '<a:fire:1559532089655959623>',
    ship: '<:ship:1559532385111113829>',
    kazanan: '<a:kazanan:1559532584277381130>',
    para: '<a:para:1559532687365247076>',
    dolar: '<:dolar:1559532900146225273>',
    kripto: '<:kripto:1559533103309922366>',
    github: '<:github:1559533853591207987>',
    roblox: '<a:roblox:1559533981802696734>',
    minecraft: '<a:minecraft:1559534152380981288>',
    nasa: '<:nasa:1559534362171801650>',
    deprem: '<:deprem:1559534536667308052>',
    iyi_ping: '<:iyi_ping:1559535196498436177>',
    kotu_ping: '<:kotu_ping:1559535195273830431>',
    saat: '<a:saat:1559535361401552967>',
    member: '<:member:1559535643111985253>',
    bot_logo: '<:bot_logo:1559536020436025344>',
    ayarlar: '<:ayarlar:1559536231006609449>',
    encode: '<:encode:1559536799028748419>',
    decode: '<:decode:1559536912216367176>'
};

const BAŞLIK = `${EMOJI.kale} `;
const FOOTER = `MELEZYA ${EMOJI.trbayrak}`;

async function safeFetch(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return response;
    } catch (e) {
        clearTimeout(timer);
        throw e;
    }
}

module.exports = async (client, EMOJIS, BAYRAK, LOADING, GUILD_ID, ADMIN_ID, LOG_CHANNEL_ID, KURAL_KANAL_ID, ACIL_DURUM_SIFRE, acilDurum, ayarlar, saveAyarlar, appendUserLog, loadUserLog, saveUserLog, getUserAktiflik, saveAktiflik, getUserWarns, saveWarns, warns, ATATURK_IMAGE, ATATURK_SOZLER, ATATURK_BILGI, RESIM_KLASORU, VIDEO_PATH, ISTIKLAL_PATH, ffmpegPath, audioSettings, playVideoWithAudio, playIstiklal, playCustomSound, playJumpscare, returnToFixedChannel, getMeemFiles, JUMPSCARE_COOLDOWN, JUMPSCARE_FILES, uyariRolGuncelle) => {

    Object.assign(EMOJIS, EMOJI);

    const ADMIN_ONLY_COMMANDS = [
        'temizle', 'sil', 'kick', 'ban', 'unban',
        'duyuru', 'oylama', 'embed',
        'yedek', 'ayar', 'debug',
        'uyar', 'uyarılar', 'uyarı-sil', 'uyarisil', 'sustur', 'susturma-kaldır', 'slowmode', 'kanal-kilit', 'kanal-aç'
    ];

    const FIKRALAR = [
        "Temel ile Dursun bir gün ava çıkmışlar. Temel bir kuş vurmuş, Dursun 'Bu ne?' demiş. Temel 'Kuş' demiş. Dursun 'Yok canım, bu kartal' demiş. Temel 'Ula kartal olsa kanadı olurdu' demiş.",
        "Adamın biri doktora gitmiş: 'Doktor, bacağımı kaldırınca acıyor.' Doktor: 'Kaldırma o zaman.'",
        "İki matematikçi bir restorana girmiş. Garson: 'Ne alırsınız?' Matematikçiler: 'Pi.' Garson: 'Kaç tane?' Matematikçiler: '3.14159...'",
        "Neden bilgisayarlar denize giremez? Çünkü Windows açık kalır.",
        "Bir programcı, eşine 'Markete git, bir ekmek al; eğer yumurta varsa 6 tane al' demiş. Eşi markete gitmiş, yumurta olduğunu görünce 6 ekmek almış."
    ];

    const ESPRILER = [
        "Neden bilgisayarlar hasta olmaz? Çünkü byte yiyorlar!",
        "Neden matematikçiler kötü komedyen? Çünkü şakaları kuru!",
        "Neden programcılar karanlıktan korkar? Çünkü çok fazla bug var!",
        "Neden balıklar okula gitmez? Çünkü zaten okulda yüzerler!",
        "Neden kediler bilgisayar kullanmaz? Çünkü fareyi kovalarlar!"
    ];

    const ARGO_SOZLUK = [
        { k: 'Kafayı yemek', a: 'Delirmek' },
        { k: 'Tüymek', a: 'Kaçmak' },
        { k: 'Yan çizmek', a: 'Sözünden dönmek' },
        { k: 'Pabucu dama atılmak', a: 'Gözden düşmek' },
        { k: 'Ağzı açık kalmak', a: 'Çok şaşırmak' },
        { k: 'Burnundan solumak', a: 'Çok sinirlenmek' },
        { k: 'Çam devirmek', a: 'Pot kırmak' },
        { k: 'Dolap çevirmek', a: 'Hile yapmak' },
        { k: 'Etekleri zil çalmak', a: 'Çok sevinmek' },
        { k: 'Gözüne girmek', a: 'Sevgisini kazanmak' }
    ];

    const KELIME_LISTESI = [
        'elma', 'armut', 'kedi', 'köpek', 'kuş', 'balık', 'aslan', 'kaplan', 'fil', 'zürafa',
        'masa', 'sandalye', 'kapı', 'pencere', 'kitap', 'defter', 'kalem', 'silgi', 'bilgisayar', 'telefon'
    ];

    const aktifKelime = new Map();
    const aktifTahmin = new Map();
    const aktifAdamAsmaca = new Map();
    const aktifTrivia = new Map();
    const ruletStats = new Map();

    client.on('messageCreate', async (message) => {
        try {
            if (message.author.bot) return;

            if (!message.guild && message.author.id === ADMIN_ID) {
                if (message.content.trim() === `${PREFIX}ACİLDURUM`) {
                    try {
                        await message.reply('🔐 **Acil durum şifresini girin:**');
                        const filter = m => m.author.id === ADMIN_ID;
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                        const sifre = collected.first().content.trim();
                        if (sifre === ACIL_DURUM_SIFRE) {
                            await message.reply('⚠️ **Acil durum başlatılıyor...**');
                            const guild = client.guilds.cache.get(GUILD_ID);
                            if (guild) {
                                const success = await acilDurum(guild);
                                if (success) await message.reply('✅ **Acil durum tamamlandı!**');
                                else await message.reply('❌ **Acil durum sırasında hata oluştu!**');
                            } else {
                                await message.reply('❌ Sunucu bulunamadı!');
                            }
                        } else {
                            await message.reply('❌ **Şifre yanlış!**');
                        }
                    } catch (e) {
                        await message.reply('⏰ **Süre doldu!**');
                    }
                }
                return;
            }

            if (message.guild?.id !== GUILD_ID) return;
            if (!message.content.startsWith(PREFIX)) return;

            const args = message.content.slice(PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const member = message.member;
            const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
            const userId = message.author.id;

            db.addCommandLog(userId, command, args.join(' '), message.channel.id);

            if (ADMIN_ONLY_COMMANDS.includes(command) && !isAdmin) {
                return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            }

            if (command === 'apoyabas') {
                const apoCount = db.incrementApoCount();
                const level = Math.floor(Math.random() * 100) + 1;
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.kale} APOYA BASILDI`)
                    .setDescription(`**APOYA ${apoCount} KEZ BASILDI**\n**BASMA SEVİYESİ: ${level}**`)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1194707901852430458/1280024005394567200/image.gif')
                    .setFooter({ text: FOOTER })
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'yedek') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                await message.reply(`${EMOJI.yukleniyor} **Yedek alınıyor...**`);
                try {
                    const guild = message.guild;
                    const yedek = { tarih: new Date().toISOString(), sunucu: { id: guild.id, name: guild.name, icon: guild.iconURL(), ownerId: guild.ownerId, memberCount: guild.memberCount }, kanallar: [], roller: [], uyeler: [], banlar: [] };
                    guild.channels.cache.forEach(ch => { yedek.kanallar.push({ id: ch.id, name: ch.name, type: ch.type, position: ch.position, parentId: ch.parentId }); });
                    guild.roles.cache.forEach(role => { if (role.id === guild.roles.everyone.id) return; yedek.roller.push({ id: role.id, name: role.name, color: role.color, hoist: role.hoist, position: role.position, permissions: role.permissions.toArray() }); });
                    guild.members.cache.forEach(m => { yedek.uyeler.push({ id: m.id, user: m.user.tag, nickname: m.nickname, roles: m.roles.cache.map(r => r.id), joinedAt: m.joinedAt }); });
                    const bans = await guild.bans.fetch();
                    bans.forEach(ban => { yedek.banlar.push({ user: ban.user.tag, id: ban.user.id, reason: ban.reason }); });
                    const buffer = Buffer.from(JSON.stringify(yedek, null, 2), 'utf-8');
                    const attachment = new AttachmentBuilder(buffer, { name: `yedek-${new Date().toISOString().split('T')[0]}.json` });
                    await message.reply({ content: `${EMOJI.tik} **Yedek alındı!**`, files: [attachment] });
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} **Yedek alınırken hata oluştu!**`);
                }
                return;
            }

            if (command === 'ayar') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const altKomut = args[0]?.toLowerCase();
                const logTuru = args[1]?.toLowerCase();
                if (altKomut === 'aç' || altKomut === 'ac') {
                    if (!logTuru) {
                        const aktifLoglar = Object.entries(ayarlar).filter(([k, v]) => v && k.startsWith('log_')).map(([k]) => k.replace('log_', ''));
                        return message.reply(`${EMOJI.bilgi} **Aktif loglar:** \`${aktifLoglar.join(', ') || 'Yok'}\``);
                    }
                    const key = `log_${logTuru}`;
                    if (!(key in ayarlar)) return message.reply(`${EMOJI.carpi} Geçersiz log türü!`);
                    ayarlar[key] = true;
                    db.setSetting(key, true);
                    return message.reply(`${EMOJI.tik} **\`${logTuru}\` logu açıldı!**`);
                }
                if (altKomut === 'kapa' || altKomut === 'kapat') {
                    if (!logTuru) {
                        const pasifLoglar = Object.entries(ayarlar).filter(([k, v]) => !v && k.startsWith('log_')).map(([k]) => k.replace('log_', ''));
                        return message.reply(`${EMOJI.bilgi} **Kapalı loglar:** \`${pasifLoglar.join(', ') || 'Yok'}\``);
                    }
                    const key = `log_${logTuru}`;
                    if (!(key in ayarlar)) return message.reply(`${EMOJI.carpi} Geçersiz log türü!`);
                    ayarlar[key] = false;
                    db.setSetting(key, false);
                    return message.reply(`${EMOJI.tik} **\`${logTuru}\` logu kapatıldı!**`);
                }
                if (altKomut === 'durum' || altKomut === 'liste') {
                    let desc = `**${EMOJI.ayarlar} Log Ayarları:**\n`;
                    for (const [key, value] of Object.entries(ayarlar)) {
                        if (key.startsWith('log_')) desc += `${value ? EMOJI.tik : EMOJI.carpi} \`${key.replace('log_', '')}\`\n`;
                    }
                    return message.reply({ embeds: [new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.ayarlar} LOG AYARLARI`).setDescription(desc).setFooter({ text: FOOTER })] });
                }
                return message.reply(`${EMOJI.carpi} Kullanım: \`${PREFIX}ayar aç/kapa/durum <log>\``);
            }

            if (command === 'debug') {
                if (userId !== ADMIN_ID) return message.reply(`${EMOJI.carpi} **Bu komutu sadece bot sahibi kullanabilir!**`);
                await message.reply(`${EMOJI.yukleniyor} **Debug başlatılıyor...**`);
                const testSonuclari = [];
                testSonuclari.push(`${EMOJI.iyi_ping} Bot Ping: ${client.ws.ping}ms`);
                const guild = client.guilds.cache.get(GUILD_ID);
                if (guild) testSonuclari.push(`${EMOJI.tik} Sunucu: ${guild.name} (${guild.memberCount} üye)`);
                testSonuclari.push(`${EMOJI.tik} SQLite Kullanıcı: ${db.getTotalUsers()}`);
                testSonuclari.push(`${EMOJI.tik} SQLite Mesaj: ${db.getTotalMessages()}`);
                testSonuclari.push(`${EMOJI.tik} SQLite Apo Sayaç: ${db.getApoCount()}`);
                const rapor = `MELEZYA BOT DEBUG RAPORU\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n${testSonuclari.join('\n')}`;
                const buffer = Buffer.from(rapor, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `debug-${Date.now()}.log` });
                try {
                    await message.author.send({ content: `${EMOJI.tik} **Debug raporu:**`, files: [attachment] });
                    await message.reply(`${EMOJI.tik} **Debug raporu DM'ine gönderildi!**`);
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} **DM gönderilemedi!** Rapor:\n\`\`\`${rapor}\`\`\``);
                }
                return;
            }

            if (command === 'temizle' || command === 'sil') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const amount = parseInt(args[0]);
                if (isNaN(amount) || amount < 1 || amount > 100) return message.reply(`${EMOJI.carpi} 1-100 arası sayı girin.`);
                await message.reply(`${EMOJI.yukleniyor} **${amount} mesaj siliniyor...**`);
                const messages = await message.channel.bulkDelete(amount, true);
                await message.channel.send(`${EMOJI.temizle} **${messages.size} mesaj silindi!**`).then(m => setTimeout(() => m.delete(), 5000));
                return;
            }

            if (command === 'kick') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const target = message.guild.members.cache.get(user.id);
                if (!target || !target.kickable) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı veya kicklenemiyor!`);
                const reason = args.slice(1).join(' ') || 'Sebep yok';
                await target.kick(reason);
                db.addModeration(user.id, 'kick', reason, 0, message.author.tag, message.author.id);
                await message.reply(`${EMOJI.kick} **${user.tag} kicklendi!** Sebep: \`${reason}\``);
                return;
            }

            if (command === 'ban') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const target = message.guild.members.cache.get(user.id);
                if (!target || !target.bannable) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı veya banlanamıyor!`);
                const reason = args.slice(1).join(' ') || 'Sebep yok';
                await target.ban({ reason });
                db.addModeration(user.id, 'ban', reason, 0, message.author.tag, message.author.id);
                await message.reply(`${EMOJI.banhammer} **${user.tag} banlandı!** Sebep: \`${reason}\``);
                return;
            }

            if (command === 'unban') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const id = args[0];
                if (!id) return message.reply(`${EMOJI.carpi} Bir kullanıcı ID'si girin!`);
                const bans = await message.guild.bans.fetch();
                const ban = bans.find(b => b.user.id === id);
                if (!ban) return message.reply(`${EMOJI.carpi} Bu ID'ye sahip banlı kullanıcı yok!`);
                await message.guild.members.unban(id);
                await message.reply(`${EMOJI.tik} **${ban.user.tag} banı kaldırıldı!**`);
                return;
            }

            // ==================== UYAR (kademeli rol) ====================
            if (command === 'uyar') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const reason = args.slice(1).join(' ') || 'Sebep yok';
                db.addWarn(user.id, reason, message.author.tag, message.author.id);
                const warnCount = db.getWarnCount(user.id);
                const target = message.guild.members.cache.get(user.id);
                if (target) await uyariRolGuncelle(message.guild, target, warnCount);
                await message.reply(`${EMOJI.sari} **${user.tag}** uyarıldı! Sebep: \`${reason}\` (Toplam: ${warnCount}) ${warnCount >= 5 ? '⚠️ **UYARI 5/5!**' : `(${warnCount}/5)`}`);
                return;
            }

            if (command === 'uyarılar') {
                const user = message.mentions.users.first() || message.author;
                const warnData = db.getWarns(user.id);
                if (warnData.length === 0) return message.reply(`${EMOJI.tik} **${user.tag}** kullanıcısının uyarısı yok.`);
                let desc = '';
                warnData.forEach((w, i) => { desc += `**${i+1}.** ${w.reason} - *${w.byUser}* (${new Date(w.date).toLocaleString('tr-TR')})\n`; });
                const embed = new EmbedBuilder().setColor(0xFFA500).setTitle(`${EMOJI.sari} ${user.tag} UYARILARI`).setDescription(desc).setFooter({ text: `Toplam: ${warnData.length} uyarı • Kaldırmak için: ${PREFIX}uyarı-sil @kullanıcı <numara>` });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'uyarı-sil' || command === 'uyarisil') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const numara = parseInt(args[1]);
                if (isNaN(numara)) return message.reply(`${EMOJI.carpi} Bir uyarı numarası belirt! (${PREFIX}uyarı-sil @kullanıcı 2)`);
                const warnData = db.getWarns(user.id);
                if (numara < 1 || numara > warnData.length) return message.reply(`${EMOJI.carpi} Geçersiz numara! Toplam ${warnData.length} uyarı var.`);
                const silinen = warnData[numara - 1];
                db.getDB().prepare('DELETE FROM warns WHERE id = ?').run(silinen.id);
                const yeniSayi = db.getWarnCount(user.id);
                const target = message.guild.members.cache.get(user.id);
                if (target) await uyariRolGuncelle(message.guild, target, yeniSayi);
                await message.reply(`${EMOJI.tik} **${user.tag}** kullanıcısının ${numara}. uyarısı silindi. Kalan: ${yeniSayi}`);
                return;
            }

            if (command === 'sustur') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const target = message.guild.members.cache.get(user.id);
                if (!target) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı!`);
                const sure = parseInt(args[1]) || 10;
                const reason = args.slice(2).join(' ') || 'Sebep yok';
                try {
                    await target.timeout(sure * 60 * 1000, reason);
                    db.addModeration(user.id, 'timeout', reason, sure, message.author.tag, message.author.id);
                    await message.reply(`${EMOJI.mute} **${user.tag}** ${sure} dakika susturuldu! Sebep: \`${reason}\``);
                } catch (e) { await message.reply(`${EMOJI.carpi} Susturma başarısız!`); }
                return;
            }

            if (command === 'susturma-kaldır') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const target = message.guild.members.cache.get(user.id);
                if (!target) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı!`);
                try { await target.timeout(null); await message.reply(`${EMOJI.tik} **${user.tag}** susturması kaldırıldı!`); }
                catch (e) { await message.reply(`${EMOJI.carpi} Susturma kaldırılamadı!`); }
                return;
            }

            if (command === 'slowmode') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const sure = parseInt(args[0]);
                if (isNaN(sure) || sure < 0 || sure > 21600) return message.reply(`${EMOJI.carpi} 0-21600 saniye arası bir değer girin.`);
                await message.channel.setRateLimitPerUser(sure);
                await message.reply(`${EMOJI.tik} **Slowmode ${sure} saniye olarak ayarlandı!**`);
                return;
            }

            if (command === 'kanal-kilit') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
                await message.reply(`${EMOJI.lock} **Kanal kilitlendi!**`);
                return;
            }

            if (command === 'kanal-aç') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
                await message.reply(`${EMOJI.tik} **Kanal açıldı!**`);
                return;
            }

            if (command === 'rusruleti' || command === 'rulet') {
                const kullanici = message.author;
                if (!ruletStats.has(kullanici.id)) ruletStats.set(kullanici.id, { oynanan: 0, kazanilan: 0, kaybedilen: 0 });
                const stats = ruletStats.get(kullanici.id);
                stats.oynanan++;
                const kursunSlot = Math.floor(Math.random() * 6) + 1;
                const cekilenSlot = Math.floor(Math.random() * 6) + 1;
                const oldu = kursunSlot === cekilenSlot;
                if (oldu) stats.kaybedilen++; else stats.kazanilan++;
                const sans = ((stats.kazanilan / stats.oynanan) * 100).toFixed(1);
                const renk = oldu ? 0xFF0000 : 0x00FF00;
                const embed = new EmbedBuilder()
                    .setColor(renk)
                    .setTitle(`${EMOJI.silah} RUS RULETİ ${EMOJI.silah}`)
                    .setDescription(oldu
                        ? `${EMOJI.fire} **${kullanici.username}** tetiğe bastı ve...\n\n**KURŞUN ${kursunSlot}. SLOTTAYDI!**\n\n💀 **ÖLDÜN!**`
                        : `${EMOJI.tik} **${kullanici.username}** tetiğe bastı ve...\n\n**KURŞUN ${kursunSlot}. SLOTTAYDI, SEN ${cekilenSlot}. SLOTU SEÇTİN!**\n\n🎉 **KURTULDUN!**`
                    )
                    .addFields(
                        { name: `${EMOJI.kazanan} İstatistiklerin`, value: `**Oynanan:** \`${stats.oynanan}\`\n**Kazanılan:** \`${stats.kazanilan}\`\n**Kaybedilen:** \`${stats.kaybedilen}\`\n**Kazanma Oranı:** \`${sans}%\``, inline: false }
                    )
                    .setFooter({ text: `${FOOTER} • Şansına güven!` })
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'ship') {
                const target = message.mentions.users.first();
                if (!target) return message.reply(`${EMOJI.carpi} Birini etiketle!`);
                if (target.id === userId) return message.reply(`${EMOJI.carpi} Kendinle ship olamazsın!`);
                const percentage = Math.floor(Math.random() * 100) + 1;
                let yorum = '';
                if (percentage >= 90) yorum = `${EMOJI.fire} **MÜKEMMEL UYUM!** Evlenin artık! 💍`;
                else if (percentage >= 70) yorum = `${EMOJI.ship} **Çok iyi uyum!** Ciddi düşünün! 💕`;
                else if (percentage >= 50) yorum = `${EMOJI.tik} **Fena değil!** Belki olur? 😊`;
                else if (percentage >= 30) yorum = `${EMOJI.sari} **Zor ama imkansız değil!** 🤔`;
                else if (percentage >= 10) yorum = `${EMOJI.carpi} **Pek uyumlu değil!** 😅`;
                else yorum = `${EMOJI.kirmizi} **Hiç olmaz!** Arkadaş kalın bari! 💔`;
                const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
                const embed = new EmbedBuilder()
                    .setColor(percentage >= 50 ? 0xFF6B9D : 0x2B2D31)
                    .setTitle(`${EMOJI.ship} AŞK ÖLÇER ${EMOJI.ship}`)
                    .setDescription(`**${message.author.username}** ${EMOJI.ship} **${target.username}**\n\n\`${bar}\` **${percentage}%**\n\n${yorum}`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: FOOTER })
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === '1vs1' || command === 'duello') {
                const target = message.mentions.users.first();
                if (!target) return message.reply(`${EMOJI.carpi} Birini etiketle!`);
                if (target.id === userId) return message.reply(`${EMOJI.carpi} Kendinle düello yapamazsın!`);
                if (target.bot) return message.reply(`${EMOJI.carpi} Botlarla düello yapamazsın!`);
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.silah} DÜELLO ${EMOJI.silah}`)
                    .setDescription(`⚔️ **${message.author.username}** ve **${target.username}** arasında düello başladı!\n\n**${target.username}**, düelloyu kabul ediyor musun?`)
                    .setFooter({ text: `${FOOTER} • 30 saniye içinde cevap ver` })
                    .setTimestamp();
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId(`duello_kabul_${userId}_${target.id}`).setLabel('⚔️ Kabul Et').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`duello_red_${userId}_${target.id}`).setLabel('❌ Reddet').setStyle(ButtonStyle.Danger)
                    );
                await message.reply({ embeds: [embed], components: [row] });
                return;
            }

            if (command === 'milyoner') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`mil_kat_tarih_${userId}`).setLabel('📜 Tarih').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_edebiyat_${userId}`).setLabel('📚 Edebiyat').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_cografya_${userId}`).setLabel('🌍 Coğrafya').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_bilim_${userId}`).setLabel('🔬 Bilim').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_karisik_${userId}`).setLabel('🎲 Karışık').setStyle(ButtonStyle.Success)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`mil_zor_kolay_${userId}`).setLabel('🟢 Kolay').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`mil_zor_orta_${userId}`).setLabel('🟡 Orta').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_zor_zor_${userId}`).setLabel('🟠 Zor').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`mil_zor_hepsi_${userId}`).setLabel('🎯 Hepsi').setStyle(ButtonStyle.Secondary)
                );
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.para} KİM MİLYONER OLMAK İSTER? ${EMOJI.para}`)
                    .setDescription(`**${message.author.username}**, yarışmaya hoş geldin!\n\n**13 soru** sorulacak.\n\n📚 **Önce kategoriyi seç:**`)
                    .setFooter({ text: `${FOOTER} • Kategori seç` })
                    .setTimestamp();
                const msg = await message.reply({ embeds: [embed], components: [row, row2] });
                const secimCollector = msg.createMessageComponentCollector({ filter: (i) => i.customId.startsWith('mil_') && i.user.id === userId, time: 60000 });
                let secilenKategori = null;
                let secilenZorluk = null;
                secimCollector.on('collect', async (interaction) => {
                    const parcalar = interaction.customId.split('_');
                    const tip = parcalar[1];
                    const deger = parcalar[2];
                    if (tip === 'kat') {
                        secilenKategori = deger;
                        await interaction.update({
                            embeds: [new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.para} KİM MİLYONER OLMAK İSTER?`).setDescription(`📚 **Kategori:** \`${secilenKategori === 'karisik' ? 'Karışık' : secilenKategori.charAt(0).toUpperCase() + secilenKategori.slice(1)}\`\n\n📊 **Şimdi zorluk seviyesini seç:**`).setFooter({ text: `${FOOTER} • Zorluk seç` }).setTimestamp()],
                            components: [row2]
                        });
                    } else if (tip === 'zor') {
                        if (!secilenKategori) return interaction.reply({ content: `${EMOJI.carpi} Önce kategori seç!`, flags: EPHEMERAL });
                        secilenZorluk = deger;
                        secimCollector.stop('basla');
                    }
                });
                secimCollector.on('end', async (collected, reason) => {
                    if (reason !== 'basla' || !secilenKategori || !secilenZorluk) {
                        try { await msg.edit({ components: [] }); } catch (e) {}
                        return;
                    }
                    let havuz = TRIVIA_SORULARI;
                    if (secilenKategori !== 'karisik') {
                        const kategoriAdi = { 'tarih': 'Tarih', 'edebiyat': 'Edebiyat', 'cografya': 'Coğrafya', 'bilim': 'Bilim' }[secilenKategori];
                        havuz = havuz.filter(s => s.kategori === kategoriAdi);
                    }
                    if (secilenZorluk !== 'hepsi') {
                        const zorlukAdi = { 'kolay': 'Kolay', 'orta': 'Orta', 'zor': 'Zor' }[secilenZorluk];
                        havuz = havuz.filter(s => s.zorluk === zorlukAdi);
                    }
                    if (havuz.length < 13) return message.reply(`${EMOJI.carpi} Bu kategoride yeterli soru yok! (${havuz.length} soru var, 13 gerekli)`);
                    const secilenSorular = [];
                    const kopyaHavuz = [...havuz];
                    for (let i = 0; i < 13; i++) {
                        const index = Math.floor(Math.random() * kopyaHavuz.length);
                        secilenSorular.push(kopyaHavuz.splice(index, 1)[0]);
                    }
                    let soruIndex = 0;
                    let dogruSayisi = 0;
                    let yanlisSayisi = 0;
                    const kategoriGoster = secilenKategori === 'karisik' ? 'Karışık' : secilenKategori.charAt(0).toUpperCase() + secilenKategori.slice(1);
                    const zorlukGoster = secilenZorluk === 'hepsi' ? 'Hepsi' : secilenZorluk.charAt(0).toUpperCase() + secilenZorluk.slice(1);
                    const soruSor = async () => {
                        if (soruIndex >= 13) {
                            const basari = dogruSayisi >= 10 ? EMOJI.kazanan : dogruSayisi >= 7 ? EMOJI.tik : EMOJI.carpi;
                            const sonucEmbed = new EmbedBuilder().setColor(dogruSayisi >= 10 ? 0x00FF00 : dogruSayisi >= 7 ? 0xFFD700 : 0xFF0000).setTitle(`${basari} YARIŞMA BİTTİ!`).setDescription(`**${message.author.username}**, işte sonuçların:`).addFields(
                                { name: '✅ Doğru', value: `\`${dogruSayisi}\``, inline: true },
                                { name: '❌ Yanlış', value: `\`${yanlisSayisi}\``, inline: true },
                                { name: '📊 Başarı', value: `\`${Math.round((dogruSayisi / 13) * 100)}%\``, inline: true },
                                { name: '📚 Kategori', value: `\`${kategoriGoster}\``, inline: true },
                                { name: '🎚️ Zorluk', value: `\`${zorlukGoster}\``, inline: true }
                            ).setFooter({ text: `${FOOTER} • Tebrikler!` }).setTimestamp();
                            return msg.edit({ embeds: [sonucEmbed], components: [] });
                        }
                        const soru = secilenSorular[soruIndex];
                        const secenekler = [...soru.secenekler];
                        const dogruCevap = secenekler[soru.dogru];
                        for (let i = secenekler.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [secenekler[i], secenekler[j]] = [secenekler[j], secenekler[i]];
                        }
                        const dogruIndex = secenekler.indexOf(dogruCevap);
                        const zorlukRenk = { 'Kolay': 0x00FF00, 'Orta': 0xFFD700, 'Zor': 0xFF8C00, 'Ekstra Zor': 0xFF0000, 'Efsane': 0x8B00FF };
                        const embedRenk = zorlukRenk[soru.zorluk] || 0xE30A17;
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`mil_c_0_${userId}`).setLabel(`A) ${secenekler[0]}`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId(`mil_c_1_${userId}`).setLabel(`B) ${secenekler[1]}`).setStyle(ButtonStyle.Secondary)
                        );
                        const row2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`mil_c_2_${userId}`).setLabel(`C) ${secenekler[2]}`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId(`mil_c_3_${userId}`).setLabel(`D) ${secenekler[3]}`).setStyle(ButtonStyle.Secondary)
                        );
                        const embed = new EmbedBuilder().setColor(embedRenk).setTitle(`🎯 SORU ${soruIndex + 1}/13`).setDescription(`**${soru.soru}**`).addFields(
                            { name: '📚 Kategori', value: `\`${soru.kategori}\``, inline: true },
                            { name: '📊 Zorluk', value: `\`${soru.zorluk}\``, inline: true },
                            { name: '🎮 Oynayan', value: `<@${userId}>`, inline: true },
                            { name: '✅ Doğru', value: `\`${dogruSayisi}\``, inline: true },
                            { name: '❌ Yanlış', value: `\`${yanlisSayisi}\``, inline: true }
                        ).setFooter({ text: `${FOOTER} • Süre: 30 saniye` }).setTimestamp();
                        try { await msg.edit({ embeds: [embed], components: [row, row2] }); } catch (e) { return; }
                        const filter = (i) => i.customId.startsWith('mil_c_') && i.user.id === userId;
                        const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });
                        collector.on('collect', async (interaction) => {
                            const secilenIndex = parseInt(interaction.customId.split('_')[2]);
                            const dogruMu = secilenIndex === dogruIndex;
                            if (dogruMu) dogruSayisi++; else yanlisSayisi++;
                            const disabledRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('mil_c_0').setLabel(`A) ${secenekler[0]}`).setStyle(secilenIndex === 0 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 0 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true),
                                new ButtonBuilder().setCustomId('mil_c_1').setLabel(`B) ${secenekler[1]}`).setStyle(secilenIndex === 1 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 1 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true)
                            );
                            const disabledRow2 = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('mil_c_2').setLabel(`C) ${secenekler[2]}`).setStyle(secilenIndex === 2 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 2 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true),
                                new ButtonBuilder().setCustomId('mil_c_3').setLabel(`D) ${secenekler[3]}`).setStyle(secilenIndex === 3 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 3 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true)
                            );
                            const sonucEmbed = new EmbedBuilder().setColor(dogruMu ? 0x00FF00 : 0xFF0000).setTitle(dogruMu ? `✅ DOĞRU! (Soru ${soruIndex + 1}/13)` : `❌ YANLIŞ! (Soru ${soruIndex + 1}/13)`).setDescription(`**${soru.soru}**`).addFields(
                                { name: '✅ Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                { name: '🎯 Senin Cevabın', value: `\`${secenekler[secilenIndex]}\``, inline: true },
                                { name: '📊 Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
                            ).setFooter({ text: FOOTER }).setTimestamp();
                            await interaction.update({ embeds: [sonucEmbed], components: [disabledRow, disabledRow2] });
                            setTimeout(() => { soruIndex++; soruSor(); }, 2500);
                        });
                        collector.on('end', (collected) => {
                            if (collected.size === 0) {
                                yanlisSayisi++;
                                const timeoutEmbed = new EmbedBuilder().setColor(0xFF0000).setTitle(`⏰ SÜRE DOLDU! (Soru ${soruIndex + 1}/13)`).setDescription(`**${soru.soru}**`).addFields(
                                    { name: '✅ Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                    { name: '📊 Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
                                ).setFooter({ text: FOOTER }).setTimestamp();
                                msg.edit({ embeds: [timeoutEmbed], components: [] });
                                setTimeout(() => { soruIndex++; soruSor(); }, 2500);
                            }
                        });
                    };
                    soruSor();
                });
                return;
            }

            if (command === 'atam' || command === 'atatürk') {
                if (ATATURK_IMAGE.length === 0) return message.reply(`${EMOJI.carpi} "resimler" klasörü boş!`);
                const randomImage = ATATURK_IMAGE[Math.floor(Math.random() * ATATURK_IMAGE.length)];
                const randomSoz = ATATURK_SOZLER[Math.floor(Math.random() * ATATURK_SOZLER.length)];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} MUSTAFA KEMAL ATATÜRK`).setDescription(`*"${randomSoz}"*`).setImage(`attachment://${path.basename(randomImage)}`).setFooter({ text: `Ne mutlu Türk'üm diyene! ${EMOJI.trbayrak}`, iconURL: message.guild.iconURL() });
                await message.reply({ embeds: [embed], files: [path.join(RESIM_KLASORU, randomImage)] });
                return;
            }

            if (command === 'gencligehitabe' || command === 'hitabe') {
                const voiceState = message.member.voice;
                if (!voiceState.channel) return message.reply(`${EMOJI.carpi} Bir ses kanalına girmelisin!`);
                if (!fs.existsSync(VIDEO_PATH)) return message.reply(`${EMOJI.carpi} **hitabe.mp4** bulunamadı!`);
                await playVideoWithAudio(message.guild.id, voiceState.channel.id, message.channel, userId);
                return;
            }

            if (command === 'istiklalmarsi' || command === 'istiklal' || command === 'mars') {
                const voiceState = message.member.voice;
                if (!voiceState.channel) return message.reply(`${EMOJI.carpi} Bir ses kanalına girmelisin!`);
                if (!fs.existsSync(ISTIKLAL_PATH)) return message.reply(`${EMOJI.carpi} **istiklal.mp3** bulunamadı!`);
                await playIstiklal(message.guild.id, voiceState.channel.id, message.channel, userId);
                return;
            }

            if (command === 'gununsozu') {
                const gun = new Date().getDate();
                const soz = ATATURK_SOZLER[gun % ATATURK_SOZLER.length];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} GÜNÜN ATATÜRK SÖZÜ`).setDescription(`*"${soz}"*`).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'ataturkbilgi') {
                const bilgi = ATATURK_BILGI[Math.floor(Math.random() * ATATURK_BILGI.length)];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} ATATÜRK HAKKINDA`).setDescription(bilgi).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'cumhuriyet') {
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} CUMHURİYET`).setDescription('Türkiye Cumhuriyeti, 29 Ekim 1923\'de Mustafa Kemal Atatürk tarafından kurulmuştur.').setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'nutuk') {
                const sozler = ['Nutuk, Atatürk\'ün 1927\'de okuduğu 36.5 saatlik konuşmadır.', 'Nutuk, Kurtuluş Savaşı\'nın resmi tarihidir.', '"Ey Türk gençliği!" ile başlayan bölüm en bilinenidir.'];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} NUTUK`).setDescription(sozler[Math.floor(Math.random() * sozler.length)]).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'bayrak') {
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} TÜRK BAYRAĞI`).setDescription('Türk bayrağı, kırmızı zemin üzerinde beyaz hilal ve yıldızdan oluşur. 29 Mayıs 1936\'da kabul edilmiştir.').setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/800px-Flag_of_Turkey.svg.png').setFooter({ text: `Ne mutlu Türk'üm diyene! ${EMOJI.trbayrak}` });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'saygi') {
                const embed = new EmbedBuilder().setColor(0x2B2D31).setTitle(`${EMOJI.trbayrak} SAYGI DURUŞU`).setDescription('Atatürk ve tüm şehitlerimiz için saygı duruşu... 🕊️\n\n*"Ne mutlu Türk\'üm diyene!"*').setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'vatan') {
                const sozler = ['Vatan sevgisi imandan gelir.', 'Vatanını en çok seven görevini en iyi yapandır.', 'Vatan toprağı kutsaldır.'];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} VATAN SEVGİSİ`).setDescription(sozler[Math.floor(Math.random() * sozler.length)]).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'ping') {
                const ping = client.ws.ping;
                const pingEmoji = ping < 100 ? EMOJI.iyi_ping : EMOJI.kotu_ping;
                const renk = ping < 100 ? 0x00FF00 : ping < 200 ? 0xFFD700 : 0xFF0000;
                const embed = new EmbedBuilder().setColor(renk).setTitle(`${pingEmoji} PING`).setDescription(`Bot gecikmesi: **${ping}ms**\n\n${ping < 100 ? '🚀 Mükemmel!' : ping < 200 ? '👍 İyi' : '⚠️ Yavaş'}`).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'zaman' || command === 'time') {
                const now = new Date();
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.saat} GÜNCEL ZAMAN`).setDescription(`**Tarih:** \`${now.toLocaleDateString('tr-TR')}\`\n**Saat:** \`${now.toLocaleTimeString('tr-TR')}\`\n**Hafta:** \`${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][now.getDay()]}\``).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'kullanıcı' || command === 'user' || command === 'profil') {
                const user = message.mentions.users.first() || message.author;
                const member = message.guild.members.cache.get(user.id);
                if (!member) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı.`);
                const userData = db.getUser(user.id);
                const warnCount = db.getWarnCount(user.id);
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.member} ${user.username}`).setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 })).addFields(
                    { name: 'ID', value: `\`${user.id}\``, inline: true },
                    { name: 'Katılım', value: member.joinedAt.toLocaleDateString('tr-TR'), inline: true },
                    { name: 'Mesaj', value: `\`${userData?.messageCount || 0}\``, inline: true },
                    { name: 'Ses', value: `\`${userData?.voiceMinutes || 0} dk\``, inline: true },
                    { name: 'Uyarı', value: `\`${warnCount}\``, inline: true },
                    { name: 'Roller', value: member.roles.cache.map(r => r.name).join(', ').slice(0, 1024) || 'Yok', inline: false }
                ).setFooter({ text: FOOTER, iconURL: message.guild.iconURL() });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'sunucu' || command === 'server') {
                const guild = message.guild;
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.kale} ${guild.name}`).setThumbnail(guild.iconURL({ dynamic: true })).addFields(
                    { name: `${EMOJI.member} Üye`, value: `\`${guild.memberCount}\``, inline: true },
                    { name: `${EMOJI.kurucu} Sahip`, value: `<@${guild.ownerId}>`, inline: true },
                    { name: '📅 Kuruluş', value: `<t:${Math.floor(guild.createdAt/1000)}:R>`, inline: true },
                    { name: '📢 Kanal', value: `\`${guild.channels.cache.size}\``, inline: true },
                    { name: '🎭 Rol', value: `\`${guild.roles.cache.size}\``, inline: true },
                    { name: '💎 Boost', value: `\`${guild.premiumSubscriptionCount}\``, inline: true }
                ).setFooter({ text: FOOTER, iconURL: guild.iconURL() });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'avatar') {
                const user = message.mentions.users.first() || message.author;
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.member} ${user.username} AVATAR`).setImage(user.displayAvatarURL({ dynamic: true, size: 1024 })).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'banner') {
                const user = message.mentions.users.first() || message.author;
                try {
                    const fetchedUser = await client.users.fetch(user.id, { force: true });
                    const bannerURL = fetchedUser.bannerURL({ dynamic: true, size: 1024 });
                    if (!bannerURL) return message.reply(`${EMOJI.carpi} **${user.username}** kullanıcısının banner'ı yok.`);
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.member} ${user.username} BANNER`).setImage(bannerURL).setFooter({ text: FOOTER });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Banner alınamadı.`); }
                return;
            }

            if (command === 'bot' || command === 'info') {
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.bot_logo} MELEZYA BOT`).setDescription(`**Geliştirici:** <@${ADMIN_ID}>\n**Sunucu:** ${message.guild.name}\n**Hizmet:** \`${message.guild.memberCount}\`\n**Ping:** \`${client.ws.ping}ms\`\n**Çalışma:** \`${Math.floor(process.uptime()/3600)} saat\`\n**Veritabanı:** \`SQLite\`\n**Komut:** \`80+\``).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'aktif' || command === 'liderlik') {
                const topUsers = db.getTopMessageUsers(10);
                let desc = '';
                let rank = 1;
                for (const u of topUsers) {
                    const user = await client.users.fetch(u.userId).catch(() => null);
                    if (user) {
                        const madalya = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${EMOJI.kazanan}`;
                        desc += `${madalya} **${rank}.** **${user.username}** - \`${u.messageCount} mesaj\`\n`;
                        rank++;
                    }
                }
                if (!desc) desc = '*Henüz veri yok.*';
                const embed = new EmbedBuilder().setColor(0xFFD700).setTitle(`${EMOJI.kazanan} LİDERLİK TABLOSU`).setDescription(desc).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'günlük-istatistik' || command === 'gunluk-istatistik') {
                const userData = db.getUser(userId);
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.bilgi} GÜNLÜK İSTATİSTİK`).setDescription(`**Toplam Mesaj:** \`${userData?.messageCount || 0}\`\n**Toplam Ses:** \`${userData?.voiceMinutes || 0} dk\`\n**Kelime:** \`${userData?.wordCount || 0}\`\n**Karakter:** \`${userData?.characterCount || 0}\``).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }
            const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, AttachmentBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
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

const commands = [
    new SlashCommandBuilder().setName('gozaltindakiler').setDescription('Gözaltındaki üyeleri listeler (DM\'den .log)'),
    new SlashCommandBuilder().setName('gozaltina-al').setDescription('Bir üyeyi gözaltına alır')
        .addUserOption(option => option.setName('kisi').setDescription('Gözaltına alınacak kişi').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Gözaltına alma sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('gozaltindan-cikar').setDescription('Bir üyeyi gözaltından çıkarır')
        .addUserOption(option => option.setName('kisi').setDescription('Gözaltından çıkarılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('guvenlik-tara').setDescription('Sunucuyu güvenlik açısından tarar (DM\'den .log)'),
    new SlashCommandBuilder().setName('bot-denetle').setDescription('Sunucudaki botları denetler (DM\'den .log)'),
    new SlashCommandBuilder().setName('izin-denetle').setDescription('Rol veya kanal izinlerini denetler')
        .addRoleOption(option => option.setName('rol').setDescription('Denetlenecek rol').setRequired(false))
        .addChannelOption(option => option.setName('kanal').setDescription('Denetlenecek kanal').setRequired(false)),
    new SlashCommandBuilder().setName('uye-denetle').setDescription('Bir üyeyi detaylı denetler')
        .addUserOption(option => option.setName('kisi').setDescription('Denetlenecek kişi').setRequired(true)),
    new SlashCommandBuilder().setName('riskli-uyeler').setDescription('Riskli üyeleri listeler (DM\'den .log)'),
    new SlashCommandBuilder().setName('davet-denetle').setDescription('Sunucudaki davet linklerini denetler (DM\'den .log)'),
    new SlashCommandBuilder().setName('webhook-denetle').setDescription('Sunucudaki webhook\'ları denetler (DM\'den .log)'),
    new SlashCommandBuilder().setName('guvenlik-rapor').setDescription('7 günlük güvenlik raporu (DM\'den .log)'),
    new SlashCommandBuilder().setName('gecmissorgula').setDescription('Bir kullanıcının tüm geçmişini DM\'den .log olarak gönderir')
        .addUserOption(option => option.setName('kisi').setDescription('Geçmişi sorgulanacak kişi').setRequired(true))
];

function createLogFile(content, fileName) {
    const buffer = Buffer.from(content, 'utf-8');
    return new AttachmentBuilder(buffer, { name: fileName });
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
        console.log(`${EMOJIS.yesil} Slash komutları kaydedildi!`);
    } catch (e) { console.error('Komut kaydetme hatası:', e); }
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
        if (commandName === 'gozaltindakiler') {
            const list = Object.values(gozaltinda);
            if (list.length === 0) return interaction.editReply({ content: `${EMOJIS.sari} Gözaltında kimse yok.` });
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           MELEZYA GÜVENLİK - GÖZALTINDAKİLER LİSTESİ        ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Liste DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
        }
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
        else if (commandName === 'guvenlik-tara') {
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║          MELEZYA GÜVENLİK - TAM SUNUCU TARAMASI             ║\n`;
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
            for (const [id, channel] of guild.channels.cache) content += `${channel.name} (${id}) - Tip: ${channel.type}\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Tarama raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'bot-denetle') {
            const bots = guild.members.cache.filter(m => m.user.bot);
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║              MELEZYA GÜVENLİK - BOT DENETİMİ                ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Bot denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'izin-denetle') {
            const rol = interaction.options.getRole('rol');
            const kanal = interaction.options.getChannel('kanal');
            if (!rol && !kanal) return interaction.editReply({ content: `${EMOJIS.kirmizi} Bir rol veya kanal belirtmelisin!` });
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║            MELEZYA GÜVENLİK - İZİN DENETİMİ                 ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} İzin denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'uye-denetle') {
            const target = interaction.options.getUser('kisi');
            const targetMember = await guild.members.fetch(target.id).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `${EMOJIS.kirmizi} Kullanıcı sunucuda bulunamadı!` });
            const userData = db.getUser(target.id);
            const warns = db.getWarns(target.id);
            const isCustody = db.isInCustody(target.id);
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║              MELEZYA GÜVENLİK - ÜYE DENETİMİ                ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Üye denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
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
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║             MELEZYA GÜVENLİK - RİSKLİ ÜYELER                 ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Riskli üyeler raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'davet-denetle') {
            const invites = await guild.invites.fetch();
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║            MELEZYA GÜVENLİK - DAVET DENETİMİ                 ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Davet denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'webhook-denetle') {
            const webhooks = await guild.fetchWebhooks();
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           MELEZYA GÜVENLİK - WEBHOOK DENETİMİ                ║\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Webhook denetim raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
        else if (commandName === 'guvenlik-rapor') {
            const now = Date.now();
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            let content = `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           MELEZYA GÜVENLİK - 7 GÜNLÜK RAPOR                  ║\n`;
            content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
            content += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
            content += `Dönem: ${new Date(weekAgo).toLocaleString('tr-TR')} - ${new Date(now).toLocaleString('tr-TR')}\n\n`;
            const newMembers = guild.members.cache.filter(m => m.joinedTimestamp > weekAgo);
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `YENİ ÜYELER (${newMembers.size})\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            for (const [id, m] of newMembers) content += `${m.user.tag} (${id}) - ${m.joinedAt.toLocaleString('tr-TR')}\n`;
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
            for (const [id, ban] of bans) content += `${ban.user.tag} (${id}) - Sebep: ${ban.reason || 'Belirtilmedi'}\n`;
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
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Güvenlik raporu DM'ine gönderildi!` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi!` });
        }
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
            let content = '';
            content += `╔══════════════════════════════════════════════════════════════╗\n`;
            content += `║           MELEZYA GÜVENLİK - KULLANICI RAPORU                ║\n`;
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
            content += (logData.messages || []).slice(0, 100).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] #${m.channel}: ${m.content || '(boş)'}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🔗 PAYLAŞILAN LİNKLER (Son 30)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.links || []).slice(0, 30).map((l, i) => `${i+1}. [${new Date(l.timestamp).toLocaleString('tr-TR')}] #${l.channel}: ${l.url}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `📎 PAYLAŞILAN DOSYALAR (Son 30)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.files || []).slice(0, 30).map((f, i) => `${i+1}. [${new Date(f.timestamp).toLocaleString('tr-TR')}] #${f.channel}: ${f.name} (${(f.size/1024).toFixed(2)} KB)`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `😀 EN ÇOK KULLANILAN EMOJİLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            const emojiCounts = {};
            (logData.emojis || []).forEach(e => { emojiCounts[e.emoji] = (emojiCounts[e.emoji] || 0) + 1; });
            content += Object.entries(emojiCounts).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([emoji, count], i) => `${i+1}. ${emoji}: ${count} kez`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `👥 ETİKETLEMELER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `Kimi Etiketledi (Son 30):\n`;
            content += (logData.mentions || []).slice(0, 30).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`).join('\n') || '• Kayıt yok';
            content += `\n\nKim Onu Etiketledi (Son 30):\n`;
            content += (logData.mentionedBy || []).slice(0, 30).map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleString('tr-TR')}] @${m.username} (#${m.channel})`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `😊 TEPKİLER\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `Verdiği (Son 30):\n`;
            content += (logData.reactionsGiven || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} → @${r.messageAuthor}`).join('\n') || '• Kayıt yok';
            content += `\n\nAldığı (Son 30):\n`;
            content += (logData.reactionsReceived || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.emoji} ← @${r.from}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🎭 ROL DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.roles || []).slice(0, 30).map((r, i) => `${i+1}. [${new Date(r.timestamp).toLocaleString('tr-TR')}] ${r.type}: ${r.roles?.join(', ')}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `✏️ NICK DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.nicknames || []).map((n, i) => `${i+1}. [${new Date(n.timestamp).toLocaleString('tr-TR')}] ${n.old || '(yok)'} → ${n.new || '(yok)'}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `📛 KULLANICI ADI DEĞİŞİKLİKLERİ\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.usernameHistory || []).map((u, i) => `${i+1}. [${new Date(u.timestamp).toLocaleString('tr-TR')}] ${u.old} → ${u.new}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🟢 DURUM GEÇMİŞİ (Son 50)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.statusHistory || []).slice(0, 50).map((s, i) => `${i+1}. [${new Date(s.timestamp).toLocaleString('tr-TR')}] ${s.old} → ${s.new}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `🎮 AKTİVİTE GEÇMİŞİ (Son 50)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.activityHistory || []).slice(0, 50).map((a, i) => `${i+1}. [${new Date(a.timestamp).toLocaleString('tr-TR')}] ${a.old || '(yok)'} → ${a.new || '(yok)'}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `💻 KULLANILAN KOMUTLAR (Son 100)\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += (logData.commands || []).slice(0, 100).map((c, i) => `${i+1}. [${new Date(c.timestamp).toLocaleString('tr-TR')}] /${c.command} ${c.args || ''}`).join('\n') || '• Kayıt yok';
            content += `\n\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            content += `RAPOR SONU - ${new Date().toLocaleString('tr-TR')}\n`;
            content += `MELEZYA Bot ${EMOJIS.trbayrak}\n`;
            content += `═══════════════════════════════════════════════════════════════\n`;
            const buffer = Buffer.from(content, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `${target.username}-gecmis.log` });
            const dmSuccess = await sendDM(user, `${EMOJIS.kalkan} **${target.username}** kullanıcısının geçmişi (${totalRecords} kayıt):`, attachment);
            if (dmSuccess) await interaction.editReply({ content: `${EMOJIS.yesil} Geçmiş raporu DM'ine gönderildi! (${totalRecords} kayıt)` });
            else await interaction.editReply({ content: `${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.` });
        }
    } catch (e) {
        console.error('Komut hatası:', e);
        await interaction.editReply({ content: `${EMOJIS.kirmizi} Bir hata oluştu: ${e.message}` });
    }
});

process.on('unhandledRejection', e => console.error('❌ Hata:', e));

client.login(token2);
