const PREFIX = 'mz!';
const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const db = require('./data/db.js');
const TRIVIA_SORULARI = require('./trivia.js');
const KUFUR_LISTESI = require('./kufur_listesi.js');

const EPHEMERAL = 64;
const OWNER_ID = '1332226105221971988';

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
    decode: '<:decode:1559536912216367176>',
    spotify: '🎧',
    steam: '🎮',
    twitch: '📺'
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

    // Başlangıç küfür listesini DB'ye yükle (yoksa)
    try {
        for (const k of KUFUR_LISTESI) {
            db.addAutomodKelime(k);
        }
    } catch (e) { console.error('Küfür listesi yükleme hatası:', e); }

    const ADMIN_ONLY_COMMANDS = [
        'temizle', 'sil', 'kick', 'ban', 'unban',
        'duyuru', 'oylama', 'embed',
        'yedek', 'ayar', 'debug',
        'uyar', 'uyarılar', 'uyarı-sil', 'uyarisil', 'uyarı-sıfırla', 'sustur', 'susturma-kaldır',
        'slowmode', 'kanal-kilit', 'kanal-aç',
        'ban-list', 'banlist', 'log-ara', 'log-istatistik',
        'otomod-kelime-ekle', 'otomod-kelime-sil', 'otomod-kelime-liste',
        'otomod-izinli-kanal-ekle', 'otomod-izinli-kanal-sil', 'otomod-izinli-kanal-liste',
        'otomod-durum', 'otomod-aç', 'otomod-ac', 'otomod-kapa',
        'yedek-al'
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
                        await message.reply('Acil durum şifresini girin:');
                        const filter = m => m.author.id === ADMIN_ID;
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                        const sifre = collected.first().content.trim();
                        if (sifre === ACIL_DURUM_SIFRE) {
                            await message.reply('Acil durum başlatılıyor...');
                            const guild = client.guilds.cache.get(GUILD_ID);
                            if (guild) {
                                const success = await acilDurum(guild);
                                if (success) await message.reply('Acil durum tamamlandı!');
                                else await message.reply('Acil durum sırasında hata oluştu!');
                            } else {
                                await message.reply('Sunucu bulunamadı!');
                            }
                        } else {
                            await message.reply('Şifre yanlış!');
                        }
                    } catch (e) {
                        await message.reply('Süre doldu!');
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
            const isOwner = userId === OWNER_ID;

            db.addCommandLog(userId, command, args.join(' '), message.channel.id);

            if (ADMIN_ONLY_COMMANDS.includes(command) && !isAdmin) {
                return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            }

            // ==================== YEDEK AL (OWNER ONLY) ====================
            if (command === 'yedek-al' || command === 'yedekal') {
                if (!isOwner) return message.reply(`${EMOJI.carpi} **Bu komutu sadece bot sahibi kullanabilir!**`);
                await message.reply(`${EMOJI.yukleniyor} **Veritabanı yedeği alınıyor...**`);
                try {
                    const dbPath = path.join(__dirname, 'data', 'kale.db');
                    if (!fs.existsSync(dbPath)) return message.reply(`${EMOJI.carpi} Veritabanı dosyası bulunamadı!`);
                    const buffer = fs.readFileSync(dbPath);
                    const tarih = new Date().toISOString().replace(/[:.]/g, '-');
                    const attachment = new AttachmentBuilder(buffer, { name: `kale-yedek-${tarih}.db` });
                    await message.reply({ content: `${EMOJI.tik} **Veritabanı yedeği alındı!** Boyut: ${(buffer.length/1024/1024).toFixed(2)} MB`, files: [attachment] });
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} Yedek alınamadı: \`${e.message}\``);
                }
                return;
            }

            // ==================== APOYA BAS ====================
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

            // ==================== YEDEK (eski, sunucu yedeği) ====================
            if (command === 'yedek') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                await message.reply(`${EMOJI.yukleniyor} **Sunucu yedeği alınıyor...**`);
                try {
                    const guild = message.guild;
                    const yedek = { tarih: new Date().toISOString(), sunucu: { id: guild.id, name: guild.name, icon: guild.iconURL(), ownerId: guild.ownerId, memberCount: guild.memberCount }, kanallar: [], roller: [], uyeler: [], banlar: [] };
                    guild.channels.cache.forEach(ch => { yedek.kanallar.push({ id: ch.id, name: ch.name, type: ch.type, position: ch.position, parentId: ch.parentId }); });
                    guild.roles.cache.forEach(role => { if (role.id === guild.roles.everyone.id) return; yedek.roller.push({ id: role.id, name: role.name, color: role.color, hoist: role.hoist, position: role.position, permissions: role.permissions.toArray() }); });
                    guild.members.cache.forEach(m => { yedek.uyeler.push({ id: m.id, user: m.user.tag, nickname: m.nickname, roles: m.roles.cache.map(r => r.id), joinedAt: m.joinedAt }); });
                    const bans = await guild.bans.fetch();
                    bans.forEach(ban => { yedek.banlar.push({ user: ban.user.tag, id: ban.user.id, reason: ban.reason }); });
                    const buffer = Buffer.from(JSON.stringify(yedek, null, 2), 'utf-8');
                    const attachment = new AttachmentBuilder(buffer, { name: `sunucu-yedek-${new Date().toISOString().split('T')[0]}.json` });
                    await message.reply({ content: `${EMOJI.tik} **Sunucu yedeği alındı!**`, files: [attachment] });
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} **Yedek alınırken hata oluştu!**`);
                }
                return;
            }

            // ==================== AYAR ====================
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

            // ==================== DEBUG ====================
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
                testSonuclari.push(`${EMOJI.tik} Automod Kelime: ${db.getAutomodKelimeler().length}`);
                testSonuclari.push(`${EMOJI.tik} Automod İzinli Kanal: ${db.getAutomodIzinliKanallar().length}`);
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

            // ==================== MODERASYON ====================
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

            // ==================== BAN LIST ====================
            if (command === 'ban-list' || command === 'banlist') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                try {
                    const bans = await message.guild.bans.fetch();
                    if (bans.size === 0) return message.reply(`${EMOJI.bilgi} Sunucuda banlı kullanıcı yok.`);
                    let desc = `**Toplam: ${bans.size} ban**\n\n`;
                    let i = 1;
                    for (const [id, ban] of bans) {
                        desc += `**${i}.** ${ban.user.tag} (\`${id}\`)\n   Sebep: ${ban.reason || 'Belirtilmedi'}\n\n`;
                        i++;
                        if (desc.length > 3800) { desc += `*... ve ${bans.size - i + 1} ban daha*`; break; }
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle(`${EMOJI.banhammer} BAN LİSTESİ`)
                        .setDescription(desc)
                        .setFooter({ text: FOOTER })
                        .setTimestamp();
                    await message.reply({ embeds: [embed] });
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} Ban listesi alınamadı: \`${e.message}\``);
                }
                return;
            }

            // ==================== UYAR ====================
            if (command === 'uyar') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const reason = args.slice(1).join(' ') || 'Sebep yok';
                db.addWarn(user.id, reason, message.author.tag, message.author.id);
                const warnCount = db.getWarnCount(user.id);
                const target = message.guild.members.cache.get(user.id);
                if (target) await uyariRolGuncelle(message.guild, target, warnCount);
                // DM bildirimi
                try {
                    await user.send({ embeds: [new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`${EMOJI.sari} UYARI ALDIN`)
                        .setDescription(`**${message.guild.name}** sunucusunda uyarı aldın.`)
                        .addFields(
                            { name: 'Sebep', value: reason, inline: false },
                            { name: 'Yetkili', value: message.author.tag, inline: true },
                            { name: 'Toplam Uyarı', value: `${warnCount}/5`, inline: true }
                        )
                        .setFooter({ text: FOOTER })
                        .setTimestamp()] });
                } catch (e) {}
                await message.reply(`${EMOJI.sari} **${user.tag}** uyarıldı! Sebep: \`${reason}\` (Toplam: ${warnCount}) ${warnCount >= 5 ? '**UYARI 5/5!**' : `(${warnCount}/5)`}`);
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
                db.removeWarn(silinen.id);
                const yeniSayi = db.getWarnCount(user.id);
                const target = message.guild.members.cache.get(user.id);
                if (target) await uyariRolGuncelle(message.guild, target, yeniSayi);
                await message.reply(`${EMOJI.tik} **${user.tag}** kullanıcısının ${numara}. uyarısı silindi. Kalan: ${yeniSayi}`);
                return;
            }

            if (command === 'uyarı-sıfırla' || command === 'uyarisifirla') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const oncekiSayi = db.getWarnCount(user.id);
                if (oncekiSayi === 0) return message.reply(`${EMOJI.bilgi} **${user.tag}** kullanıcısının zaten uyarısı yok.`);
                db.clearWarns(user.id);
                const target = message.guild.members.cache.get(user.id);
                if (target) await uyariRolGuncelle(message.guild, target, 0);
                await message.reply(`${EMOJI.tik} **${user.tag}** kullanıcısının tüm uyarıları silindi. (${oncekiSayi} uyarı silindi)`);
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

            // ==================== LOG ARAMA ====================
            if (command === 'log-ara') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const user = message.mentions.users.first();
                if (!user) return message.reply(`${EMOJI.carpi} Bir kullanıcı etiketle!`);
                const kelime = args.slice(1).join(' ');
                if (!kelime) return message.reply(`${EMOJI.carpi} Aranacak kelimeyi belirt! (${PREFIX}log-ara @kullanıcı selam)`);
                try {
                    const sonuclar = db.searchMessages(user.id, kelime);
                    if (sonuclar.length === 0) return message.reply(`${EMOJI.bilgi} **${user.tag}** kullanıcısının mesajlarında \`${kelime}\` bulunamadı.`);
                    let content = `MELEZYA LOG ARAMA\nKullanıcı: ${user.tag} (${user.id})\nAranan: "${kelime}"\nSonuç: ${sonuclar.length} mesaj\n\n`;
                    for (const m of sonuclar) {
                        content += `[${new Date(m.date).toLocaleString('tr-TR')}] #${m.channelName}: ${m.content}\n`;
                    }
                    const buffer = Buffer.from(content, 'utf-8');
                    const attachment = new AttachmentBuilder(buffer, { name: `log-ara-${user.username}-${Date.now()}.log` });
                    try {
                        await message.author.send({ content: `${EMOJI.tik} **Log arama sonucu:**`, files: [attachment] });
                        await message.reply(`${EMOJI.tik} **${sonuclar.length} sonuç DM'ine gönderildi!**`);
                    } catch (e) {
                        await message.reply({ content: `${EMOJI.carpi} DM gönderilemedi, sonuçlar:`, files: [attachment] });
                    }
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} Arama hatası: \`${e.message}\``);
                }
                return;
            }

            if (command === 'log-istatistik' || command === 'logistatistik') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kanal kullanabilir!**`);
                try {
                    const stats = db.getLogStats();
                    let desc = '';
                    for (const [tablo, sayi] of Object.entries(stats)) {
                        desc += `**${tablo}:** \`${sayi}\`\n`;
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0x4FC3F7)
                        .setTitle(`${EMOJI.bilgi} LOG İSTATİSTİKLERİ`)
                        .setDescription(desc)
                        .setFooter({ text: FOOTER })
                        .setTimestamp();
                    await message.reply({ embeds: [embed] });
                } catch (e) {
                    await message.reply(`${EMOJI.carpi} İstatistik alınamadı: \`${e.message}\``);
                }
                return;
            }

            // ==================== OTOMOD YÖNETİMİ ====================
            if (command === 'otomod-durum') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const modlar = ['kufur', 'spam', 'link', 'caps', 'mention', 'emoji', 'flood'];
                let desc = `**Genel:** ${db.getSetting('automod_enabled') === 'true' ? EMOJI.tik + ' Açık' : EMOJI.carpi + ' Kapalı'}\n\n`;
                for (const m of modlar) {
                    const aktif = db.getSetting(`automod_${m}`) === 'true';
                    desc += `**${m}:** ${aktif ? EMOJI.tik + ' Açık' : EMOJI.carpi + ' Kapalı'}\n`;
                }
                desc += `\n**Küfür kelime sayısı:** \`${db.getAutomodKelimeler().length}\``;
                desc += `\n**İzinli kanal sayısı:** \`${db.getAutomodIzinliKanallar().length}\``;
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.ayarlar} OTOMOD DURUM`).setDescription(desc).setFooter({ text: FOOTER }).setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'otomod-aç' || command === 'otomod-ac') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                db.setSetting('automod_enabled', 'true');
                await message.reply(`${EMOJI.tik} **Otomatik moderasyon genel olarak açıldı.**`);
                return;
            }

            if (command === 'otomod-kapa') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                db.setSetting('automod_enabled', 'false');
                await message.reply(`${EMOJI.tik} **Otomatik moderasyon genel olarak kapatıldı.**`);
                return;
            }

            if (command === 'otomod-kelime-ekle') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kelime = args.join(' ').toLowerCase().trim();
                if (!kelime) return message.reply(`${EMOJI.carpi} Eklenecek kelimeyi belirt!`);
                const basarili = db.addAutomodKelime(kelime);
                if (basarili) await message.reply(`${EMOJI.tik} **\`${kelime}\`** kelimesi küfür listesine eklendi.`);
                else await message.reply(`${EMOJI.bilgi} **\`${kelime}\`** kelimesi zaten listede.`);
                return;
            }

            if (command === 'otomod-kelime-sil') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kelime = args.join(' ').toLowerCase().trim();
                if (!kelime) return message.reply(`${EMOJI.carpi} Silinecek kelimeyi belirt!`);
                const basarili = db.removeAutomodKelime(kelime);
                if (basarili) await message.reply(`${EMOJI.tik} **\`${kelime}\`** kelimesi küfür listesinden silindi.`);
                else await message.reply(`${EMOJI.bilgi} **\`${kelime}\`** kelimesi listede yok.`);
                return;
            }

            if (command === 'otomod-kelime-liste') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kelimeler = db.getAutomodKelimeler();
                if (kelimeler.length === 0) return message.reply(`${EMOJI.bilgi} Küfür listesi boş.`);
                let content = `MELEZYA KÜFÜR LİSTESİ (${kelimeler.length} kelime)\n\n${kelimeler.join(', ')}`;
                const buffer = Buffer.from(content, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `kufur-listesi-${Date.now()}.txt` });
                try {
                    await message.author.send({ content: `${EMOJI.tik} **Küfür listesi:**`, files: [attachment] });
                    await message.reply(`${EMOJI.tik} **${kelimeler.length} kelime DM'ine gönderildi!**`);
                } catch (e) {
                    await message.reply({ content: `${EMOJI.carpi} DM gönderilemedi:`, files: [attachment] });
                }
                return;
            }

            if (command === 'otomod-izinli-kanal-ekle') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
                if (!kanal) return message.reply(`${EMOJI.carpi} Bir kanal etiketle!`);
                db.addAutomodIzinliKanal(kanal.id);
                await message.reply(`${EMOJI.tik} ${kanal} kanalı otomatik moderasyondan muaf tutuldu.`);
                return;
            }

            if (command === 'otomod-izinli-kanal-sil') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
                if (!kanal) return message.reply(`${EMOJI.carpi} Bir kanal etiketle!`);
                db.removeAutomodIzinliKanal(kanal.id);
                await message.reply(`${EMOJI.tik} ${kanal} kanalı otomatik moderasyon muafiyetinden çıkarıldı.`);
                return;
            }

            if (command === 'otomod-izinli-kanal-liste') {
                if (!isAdmin) return message.reply(`${EMOJI.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
                const kanallar = db.getAutomodIzinliKanallar();
                if (kanallar.length === 0) return message.reply(`${EMOJI.bilgi} Muaf kanal yok.`);
                let desc = '';
                for (const chId of kanallar) {
                    const ch = message.guild.channels.cache.get(chId);
                    desc += `${ch || `<#${chId}>`} (\`${chId}\`)\n`;
                }
                const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.ayarlar} OTOMOD İZİNLİ KANALLAR`).setDescription(desc).setFooter({ text: FOOTER }).setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            // ==================== RULET ====================
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
                        ? `${EMOJI.fire} **${kullanici.username}** tetiğe bastı ve...\n\n**KURŞUN ${kursunSlot}. SLOTTAYDI!**\n\n**ÖLDÜN!**`
                        : `${EMOJI.tik} **${kullanici.username}** tetiğe bastı ve...\n\n**KURŞUN ${kursunSlot}. SLOTTAYDI, SEN ${cekilenSlot}. SLOTU SEÇTİN!**\n\n**KURTULDUN!**`
                    )
                    .addFields(
                        { name: `${EMOJI.kazanan} İstatistiklerin`, value: `**Oynanan:** \`${stats.oynanan}\`\n**Kazanılan:** \`${stats.kazanilan}\`\n**Kaybedilen:** \`${stats.kaybedilen}\`\n**Kazanma Oranı:** \`${sans}%\``, inline: false }
                    )
                    .setFooter({ text: `${FOOTER} • Şansına güven!` })
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

            // ==================== SHIP ====================
            if (command === 'ship') {
                const target = message.mentions.users.first();
                if (!target) return message.reply(`${EMOJI.carpi} Birini etiketle!`);
                if (target.id === userId) return message.reply(`${EMOJI.carpi} Kendinle ship olamazsın!`);
                const percentage = Math.floor(Math.random() * 100) + 1;
                let yorum = '';
                if (percentage >= 90) yorum = `${EMOJI.fire} **MÜKEMMEL UYUM!** Evlenin artık!`;
                else if (percentage >= 70) yorum = `${EMOJI.ship} **Çok iyi uyum!** Ciddi düşünün!`;
                else if (percentage >= 50) yorum = `${EMOJI.tik} **Fena değil!** Belki olur?`;
                else if (percentage >= 30) yorum = `${EMOJI.sari} **Zor ama imkansız değil!**`;
                else if (percentage >= 10) yorum = `${EMOJI.carpi} **Pek uyumlu değil!**`;
                else yorum = `${EMOJI.kirmizi} **Hiç olmaz!** Arkadaş kalın bari!`;
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

            // ==================== 1VS1 DÜELLO ====================
            if (command === '1vs1' || command === 'duello') {
                const target = message.mentions.users.first();
                if (!target) return message.reply(`${EMOJI.carpi} Birini etiketle!`);
                if (target.id === userId) return message.reply(`${EMOJI.carpi} Kendinle düello yapamazsın!`);
                if (target.bot) return message.reply(`${EMOJI.carpi} Botlarla düello yapamazsın!`);
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.silah} DÜELLO ${EMOJI.silah}`)
                    .setDescription(`**${message.author.username}** ve **${target.username}** arasında düello başladı!\n\n**${target.username}**, düelloyu kabul ediyor musun?`)
                    .setFooter({ text: `${FOOTER} • 30 saniye içinde cevap ver` })
                    .setTimestamp();
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId(`duello_kabul_${userId}_${target.id}`).setLabel('Kabul Et').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`duello_red_${userId}_${target.id}`).setLabel('Reddet').setStyle(ButtonStyle.Danger)
                    );
                await message.reply({ embeds: [embed], components: [row] });
                return;
            }

            // ==================== MİLYONER ====================
            if (command === 'milyoner') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`mil_kat_tarih_${userId}`).setLabel('Tarih').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_edebiyat_${userId}`).setLabel('Edebiyat').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_cografya_${userId}`).setLabel('Coğrafya').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_bilim_${userId}`).setLabel('Bilim').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_kat_karisik_${userId}`).setLabel('Karışık').setStyle(ButtonStyle.Success)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`mil_zor_kolay_${userId}`).setLabel('Kolay').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`mil_zor_orta_${userId}`).setLabel('Orta').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`mil_zor_zor_${userId}`).setLabel('Zor').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`mil_zor_hepsi_${userId}`).setLabel('Hepsi').setStyle(ButtonStyle.Secondary)
                );
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.para} KİM MİLYONER OLMAK İSTER? ${EMOJI.para}`)
                    .setDescription(`**${message.author.username}**, yarışmaya hoş geldin!\n\n**13 soru** sorulacak.\n\n**Önce kategoriyi seç:**`)
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
                            embeds: [new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.para} KİM MİLYONER OLMAK İSTER?`).setDescription(`**Kategori:** \`${secilenKategori === 'karisik' ? 'Karışık' : secilenKategori.charAt(0).toUpperCase() + secilenKategori.slice(1)}\`\n\n**Şimdi zorluk seviyesini seç:**`).setFooter({ text: `${FOOTER} • Zorluk seç` }).setTimestamp()],
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
                                { name: 'Doğru', value: `\`${dogruSayisi}\``, inline: true },
                                { name: 'Yanlış', value: `\`${yanlisSayisi}\``, inline: true },
                                { name: 'Başarı', value: `\`${Math.round((dogruSayisi / 13) * 100)}%\``, inline: true },
                                { name: 'Kategori', value: `\`${kategoriGoster}\``, inline: true },
                                { name: 'Zorluk', value: `\`${zorlukGoster}\``, inline: true }
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
                        const embed = new EmbedBuilder().setColor(embedRenk).setTitle(`SORU ${soruIndex + 1}/13`).setDescription(`**${soru.soru}**`).addFields(
                            { name: 'Kategori', value: `\`${soru.kategori}\``, inline: true },
                            { name: 'Zorluk', value: `\`${soru.zorluk}\``, inline: true },
                            { name: 'Oynayan', value: `<@${userId}>`, inline: true },
                            { name: 'Doğru', value: `\`${dogruSayisi}\``, inline: true },
                            { name: 'Yanlış', value: `\`${yanlisSayisi}\``, inline: true }
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
                            const sonucEmbed = new EmbedBuilder().setColor(dogruMu ? 0x00FF00 : 0xFF0000).setTitle(dogruMu ? `DOĞRU! (Soru ${soruIndex + 1}/13)` : `YANLIŞ! (Soru ${soruIndex + 1}/13)`).setDescription(`**${soru.soru}**`).addFields(
                                { name: 'Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                { name: 'Senin Cevabın', value: `\`${secenekler[secilenIndex]}\``, inline: true },
                                { name: 'Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
                            ).setFooter({ text: FOOTER }).setTimestamp();
                            await interaction.update({ embeds: [sonucEmbed], components: [disabledRow, disabledRow2] });
                            setTimeout(() => { soruIndex++; soruSor(); }, 2500);
                        });
                        collector.on('end', (collected) => {
                            if (collected.size === 0) {
                                yanlisSayisi++;
                                const timeoutEmbed = new EmbedBuilder().setColor(0xFF0000).setTitle(`SÜRE DOLDU! (Soru ${soruIndex + 1}/13)`).setDescription(`**${soru.soru}**`).addFields(
                                    { name: 'Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                    { name: 'Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
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

            // ==================== MİLLİ DEĞERLER ====================
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
                const embed = new EmbedBuilder().setColor(0x2B2D31).setTitle(`${EMOJI.trbayrak} SAYGI DURUŞU`).setDescription('Atatürk ve tüm şehitlerimiz için saygı duruşu...\n\n*"Ne mutlu Türk\'üm diyene!"*').setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'vatan') {
                const sozler = ['Vatan sevgisi imandan gelir.', 'Vatanını en çok seven görevini en iyi yapandır.', 'Vatan toprağı kutsaldır.'];
                const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.trbayrak} VATAN SEVGİSİ`).setDescription(sozler[Math.floor(Math.random() * sozler.length)]).setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            // ==================== BİLGİ ====================
            if (command === 'ping') {
                const ping = client.ws.ping;
                const pingEmoji = ping < 100 ? EMOJI.iyi_ping : EMOJI.kotu_ping;
                const renk = ping < 100 ? 0x00FF00 : ping < 200 ? 0xFFD700 : 0xFF0000;
                const embed = new EmbedBuilder().setColor(renk).setTitle(`${pingEmoji} PING`).setDescription(`Bot gecikmesi: **${ping}ms**\n\n${ping < 100 ? 'Mükemmel!' : ping < 200 ? 'İyi' : 'Yavaş'}`).setFooter({ text: FOOTER });
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
                    { name: 'Kuruluş', value: `<t:${Math.floor(guild.createdAt/1000)}:R>`, inline: true },
                    { name: 'Kanal', value: `\`${guild.channels.cache.size}\``, inline: true },
                    { name: 'Rol', value: `\`${guild.roles.cache.size}\``, inline: true },
                    { name: 'Boost', value: `\`${guild.premiumSubscriptionCount}\``, inline: true }
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
            
            // ==================== FİNANS & HAVA ====================
            if (command === 'döviz' || command === 'doviz' || command === 'currency') {
                try {
                    const response = await safeFetch('https://open.er-api.com/v6/latest/USD');
                    const data = await response.json();
                    const rates = data.rates;
                    const embed = new EmbedBuilder().setColor(0x00FF00).setTitle(`${EMOJI.dolar} DÖVİZ KURLARI (TRY)`).setDescription(`**USD:** ${rates.TRY.toFixed(2)} ₺\n**EUR:** ${(rates.TRY / rates.EUR).toFixed(2)} ₺\n**GBP:** ${(rates.TRY / rates.GBP).toFixed(2)} ₺\n**JPY:** ${((rates.TRY / rates.JPY) * 100).toFixed(2)} ₺ (100 JPY)\n**CHF:** ${(rates.TRY / rates.CHF).toFixed(2)} ₺\n**CAD:** ${(rates.TRY / rates.CAD).toFixed(2)} ₺\n**AUD:** ${(rates.TRY / rates.AUD).toFixed(2)} ₺\n**CNY:** ${(rates.TRY / rates.CNY).toFixed(2)} ₺`).setFooter({ text: `open.er-api.com ${EMOJI.trbayrak}` }).setTimestamp();
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Döviz kurları alınamadı.`); }
                return;
            }

            if (command === 'hava' || command === 'weather') {
                const sehir = args.join(' ') || 'Istanbul';
                try {
                    const response = await safeFetch(`https://wttr.in/${encodeURIComponent(sehir)}?format=j1`);
                    const data = await response.json();
                    const current = data.current_condition[0];
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${sehir.toUpperCase()} HAVA DURUMU`).setDescription(`**Durum:** ${current.weatherDesc[0].value}\n**Sıcaklık:** ${current.temp_C}°C (Hissedilen: ${current.FeelsLikeC}°C)\n**Nem:** %${current.humidity}\n**Rüzgar:** ${current.windspeedKmph} km/s`).setFooter({ text: `wttr.in ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Hava durumu alınamadı.`); }
                return;
            }

            if (command === 'kripto' || command === 'crypto') {
                const embed = new EmbedBuilder().setColor(0xF7931A).setTitle(`${EMOJI.kripto} KRİPTO PARA`).setDescription('*CoinGecko üzerinden gerçek zamanlı veriler*');
                const cryptos = [{ id: 'bitcoin', name: 'Bitcoin' }, { id: 'ethereum', name: 'Ethereum' }, { id: 'solana', name: 'Solana' }, { id: 'ripple', name: 'XRP' }, { id: 'dogecoin', name: 'Dogecoin' }];
                try {
                    const ids = cryptos.map(c => c.id).join(',');
                    const response = await safeFetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur`);
                    const data = await response.json();
                    let desc = '';
                    for (const crypto of cryptos) {
                        const price = data[crypto.id];
                        desc += `**${crypto.name}:** ${price ? `$${price.usd} (€${price.eur})` : 'Veri yok'}\n`;
                    }
                    embed.setDescription(desc);
                } catch (e) { embed.setDescription('Kripto verileri alınamadı.'); }
                embed.setFooter({ text: FOOTER });
                await message.reply({ embeds: [embed] });
                return;
            }

            if (command === 'borsa' || command === 'hisse') {
                const symbol = args[0]?.toUpperCase();
                if (!symbol) return message.reply(`${EMOJI.carpi} Bir hisse sembolü belirt! Örnek: \`${PREFIX}borsa AAPL\``);
                try {
                    const response = await safeFetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
                    const data = await response.json();
                    const result = data.chart?.result?.[0];
                    if (!result) return message.reply(`${EMOJI.carpi} Hisse bulunamadı.`);
                    const meta = result.meta;
                    const fiyat = meta.regularMarketPrice;
                    const oncekiKapanis = meta.chartPreviousClose || meta.previousClose;
                    const degisim = oncekiKapanis ? ((fiyat - oncekiKapanis) / oncekiKapanis * 100) : 0;
                    const embed = new EmbedBuilder().setColor(degisim >= 0 ? 0x00FF00 : 0xFF0000).setTitle(`${degisim >= 0 ? 'Yükseliş' : 'Düşüş'} ${meta.symbol} - ${meta.shortName || meta.symbol}`).setDescription(`**Fiyat:** \`${fiyat} ${meta.currency}\`\n**Değişim:** \`${degisim >= 0 ? '+' : ''}${degisim.toFixed(2)}%\`\n**Önceki Kapanış:** \`${oncekiKapanis}\``).setFooter({ text: `Yahoo Finance ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Hisse verisi alınamadı.`); }
                return;
            }

            // ==================== HABER & BİLGİ ====================
            if (command === 'haber') {
                try {
                    const response = await safeFetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/sondakika_articles.rss');
                    const data = await response.json();
                    if (data.items && data.items.length > 0) {
                        let desc = '';
                        data.items.slice(0, 5).forEach((a, i) => { desc += `${i+1}. **[${a.title}](${a.link})**\n`; });
                        const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`${EMOJI.bilgi} SON DAKİKA HABERLERİ`).setDescription(desc).setFooter({ text: `TRT Haber ${EMOJI.trbayrak}` });
                        await message.reply({ embeds: [embed] });
                    } else message.reply('Haber bulunamadı.');
                } catch (e) { message.reply('Hata!'); }
                return;
            }

            if (command === 'namaz') {
                const sehir = args.join(' ') || 'Istanbul';
                try {
                    const response = await safeFetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sehir)}&country=Turkey&method=13`);
                    const data = await response.json();
                    if (data.data && data.data.timings) {
                        const t = data.data.timings;
                        const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`NAMAZ VAKİTLERİ - ${sehir.toUpperCase()}`).setDescription(`**İmsak:** \`${t.Fajr}\`\n**Güneş:** \`${t.Sunrise}\`\n**Öğle:** \`${t.Dhuhr}\`\n**İkindi:** \`${t.Asr}\`\n**Akşam:** \`${t.Maghrib}\`\n**Yatsı:** \`${t.Isha}\``).setFooter({ text: `aladhan.com ${EMOJI.trbayrak}` });
                        await message.reply({ embeds: [embed] });
                    } else message.reply('Namaz vakitleri alınamadı.');
                } catch (e) { message.reply('Hata!'); }
                return;
            }

            if (command === 'wiki') {
                const query = args.join(' ');
                if (!query) return message.reply(`${EMOJI.carpi} Bir konu belirt! Örnek: \`${PREFIX}wiki Atatürk\``);
                try {
                    const response = await safeFetch(`https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                    const data = await response.json();
                    if (data.title && data.extract) {
                        const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${data.title}`).setDescription(data.extract.length > 4000 ? data.extract.slice(0, 4000) + '...' : data.extract).setFooter({ text: `Wikipedia ${EMOJI.trbayrak}` });
                        if (data.thumbnail?.source) embed.setThumbnail(data.thumbnail.source);
                        await message.reply({ embeds: [embed] });
                    } else message.reply('Bulunamadı!');
                } catch (e) { message.reply('Hata!'); }
                return;
            }

            if (command === 'tarihte-bugün' || command === 'tarihtebugun') {
                try {
                    const now = new Date();
                    const ay = now.getMonth() + 1;
                    const gun = now.getDate();
                    const response = await safeFetch(`https://tr.wikipedia.org/api/rest_v1/feed/onthisday/events/${ay}/${gun}`);
                    const data = await response.json();
                    if (!data.events || data.events.length === 0) return message.reply(`${EMOJI.carpi} Bugün için tarihi olay bulunamadı.`);
                    let desc = '';
                    data.events.slice(0, 5).forEach((e) => { desc += `**${e.year}** - ${e.text.slice(0, 200)}\n\n`; });
                    const embed = new EmbedBuilder().setColor(0xE30A17).setTitle(`TARİHTE BUGÜN - ${gun}/${ay}`).setDescription(desc).setFooter({ text: `Wikipedia ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Veri alınamadı.`); }
                return;
            }

            // ==================== API KOMUTLARI ====================
            if (command === 'github' || command === 'gh') {
                const username = args[0];
                if (!username) return message.reply(`${EMOJI.carpi} Bir GitHub kullanıcı adı belirt!`);
                try {
                    const response = await safeFetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
                    if (!response.ok) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı.`);
                    const data = await response.json();
                    const embed = new EmbedBuilder().setColor(0x333333).setTitle(`${EMOJI.github} ${data.login}`).setURL(data.html_url).setThumbnail(data.avatar_url).addFields(
                        { name: 'İsim', value: data.name || 'Yok', inline: true },
                        { name: 'Repo', value: `\`${data.public_repos}\``, inline: true },
                        { name: 'Takipçi', value: `\`${data.followers}\``, inline: true },
                        { name: 'Takip', value: `\`${data.following}\``, inline: true },
                        { name: 'Konum', value: data.location || 'Yok', inline: true },
                        { name: 'Katılım', value: new Date(data.created_at).toLocaleDateString('tr-TR'), inline: true }
                    ).setFooter({ text: `GitHub ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} GitHub verisi alınamadı.`); }
                return;
            }

            if (command === 'roblox') {
                const username = args[0];
                if (!username) return message.reply(`${EMOJI.carpi} Bir Roblox kullanıcı adı belirt!`);
                try {
                    const idResponse = await safeFetch('https://users.roblox.com/v1/usernames/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
                    });
                    const idData = await idResponse.json();
                    if (!idData.data || idData.data.length === 0) return message.reply(`${EMOJI.carpi} Kullanıcı bulunamadı.`);
                    const user = idData.data[0];
                    const userIdR = user.id;
                    const userResponse = await safeFetch(`https://users.roblox.com/v1/users/${userIdR}`);
                    const userData = await userResponse.json();
                    const avatarResponse = await safeFetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIdR}&size=420x420&format=Png&isCircular=false`);
                    const avatarData = await avatarResponse.json();
                    const avatarUrl = avatarData.data?.[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${userIdR}&width=420&height=420&format=png`;
                    const embed = new EmbedBuilder().setColor(0x00B2FF).setTitle(`${EMOJI.roblox} ROBLOX - ${userData.name}`).setThumbnail(avatarUrl).addFields(
                        { name: 'ID', value: `\`${userIdR}\``, inline: true },
                        { name: 'Kullanıcı', value: userData.name, inline: true },
                        { name: 'Görünen Ad', value: userData.displayName || userData.name, inline: true },
                        { name: 'Profil', value: `[Tıkla](https://www.roblox.com/users/${userIdR}/profile)`, inline: true },
                        { name: 'Hesap Oluşturma', value: userData.created ? new Date(userData.created).toLocaleDateString('tr-TR') : 'Bilinmiyor', inline: true }
                    ).setFooter({ text: `Roblox ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Roblox API hatası!`); }
                return;
            }

            if (command === 'minecraft' || command === 'mc') {
                const player = args[0];
                if (!player) return message.reply(`${EMOJI.carpi} Bir oyuncu adı belirt!`);
                try {
                    const response = await safeFetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player)}`);
                    const data = await response.json();
                    if (!data || !data.id) return message.reply(`${EMOJI.carpi} Oyuncu bulunamadı.`);
                    const uuid = data.id;
                    const embed = new EmbedBuilder().setColor(0x00B2FF).setTitle(`${EMOJI.minecraft} MINECRAFT - ${data.name}`).setDescription(`**Oyuncu:** ${data.name}\n**UUID:** \`${uuid}\``).setThumbnail(`https://crafatar.com/avatars/${uuid}?size=256&overlay`).setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`).setFooter({ text: `Minecraft ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Minecraft API hatası!`); }
                return;
            }

            if (command === 'deprem') {
                try {
                    const response = await safeFetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live?limit=5');
                    const data = await response.json();
                    const depremler = data.result || data;
                    if (!depremler || depremler.length === 0) return message.reply(`${EMOJI.carpi} Deprem verisi bulunamadı.`);
                    let desc = '';
                    depremler.slice(0, 5).forEach((d, i) => {
                        const mag = d.mag || d.magnitude || '?';
                        const yer = d.title || d.place || 'Bilinmiyor';
                        const tarih = d.date || d.time || '';
                        desc += `**${i + 1}.** \`${mag}\` - ${yer}\n`;
                        if (tarih) desc += `   ${new Date(tarih).toLocaleString('tr-TR')}\n`;
                    });
                    const embed = new EmbedBuilder().setColor(0xFF6B6B).setTitle(`${EMOJI.deprem} SON DEPREMLER`).setDescription(desc).setFooter({ text: `Kandilli Rasathanesi ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Deprem verisi alınamadı.`); }
                return;
            }

            if (command === 'ülke' || command === 'ulke' || command === 'country') {
                const ulke = args.join(' ');
                if (!ulke) return message.reply(`${EMOJI.carpi} Bir ülke adı belirt! Örnek: \`${PREFIX}ülke Türkiye\``);
                try {
                    const response = await safeFetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ulke)}`);
                    if (!response.ok) return message.reply(`${EMOJI.carpi} Ülke bulunamadı.`);
                    const data = await response.json();
                    const c = data[0];
                    const diller = c.languages ? Object.values(c.languages).join(', ') : 'Yok';
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${c.name.common}`).setThumbnail(c.flags?.png || c.flags?.svg).addFields(
                        { name: 'Resmi Ad', value: c.name.official || c.name.common, inline: true },
                        { name: 'Başkent', value: c.capital?.[0] || 'Yok', inline: true },
                        { name: 'Bölge', value: c.region || 'Yok', inline: true },
                        { name: 'Nüfus', value: `\`${c.population.toLocaleString('tr-TR')}\``, inline: true },
                        { name: 'Alan', value: `\`${c.area.toLocaleString('tr-TR')} km²\``, inline: true },
                        { name: 'Diller', value: diller.slice(0, 100), inline: true }
                    ).setFooter({ text: `REST Countries ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Ülke verisi alınamadı.`); }
                return;
            }

            if (command === 'nasa') {
                const apiKey = process.env.NASA_API_KEY;
                if (!apiKey) return message.reply(`${EMOJI.carpi} **NASA_API_KEY** eksik!`);
                try {
                    const response = await safeFetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
                    const data = await response.json();
                    if (data.error) return message.reply(`${EMOJI.carpi} NASA API hatası: ${data.error.message}`);
                    const embed = new EmbedBuilder().setColor(0x0B3D91).setTitle(`${EMOJI.nasa} NASA - ${data.title}`).setDescription(data.explanation ? data.explanation.slice(0, 1000) : 'Açıklama yok').setFooter({ text: `NASA APOD ${EMOJI.trbayrak} • ${data.date}` });
                    if (data.media_type === 'image') embed.setImage(data.url);
                    else if (data.media_type === 'video') embed.addFields({ name: 'Video', value: `[Tıkla](${data.url})` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} NASA verisi alınamadı.`); }
                return;
            }

            // ==================== SPOTIFY ====================
            if (command === 'spotify') {
                const query = args.join(' ');
                if (!query) return message.reply(`${EMOJI.carpi} Bir şarkı adı belirt! Örnek: \`${PREFIX}spotify Shape of You\``);
                try {
                    const tokenRes = await safeFetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    const tokenData = await tokenRes.json();
                    if (!tokenData.accessToken) return message.reply(`${EMOJI.carpi} Spotify token alınamadı.`);
                    const searchRes = await safeFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
                        headers: { 'Authorization': `Bearer ${tokenData.accessToken}` }
                    });
                    const searchData = await searchRes.json();
                    const track = searchData.tracks?.items?.[0];
                    if (!track) return message.reply(`${EMOJI.carpi} Şarkı bulunamadı.`);
                    const sanatcilar = track.artists.map(a => a.name).join(', ');
                    const embed = new EmbedBuilder()
                        .setColor(0x1DB954)
                        .setTitle(`${EMOJI.spotify} ${track.name}`)
                        .setURL(track.external_urls.spotify)
                        .setDescription(`**Sanatçı:** ${sanatcilar}\n**Albüm:** ${track.album.name}\n**Süre:** ${Math.floor(track.duration_ms/60000)}:${String(Math.floor((track.duration_ms%60000)/1000)).padStart(2,'0')}\n**Popülerlik:** ${track.popularity}/100`)
                        .setThumbnail(track.album.images?.[0]?.url || null)
                        .setFooter({ text: `Spotify ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Spotify hatası: \`${e.message}\``); }
                return;
            }

            // ==================== STEAM ====================
            if (command === 'steam') {
                const input = args[0];
                if (!input) return message.reply(`${EMOJI.carpi} Bir Steam ID veya kullanıcı adı belirt! Örnek: \`${PREFIX}steam gabelogannewell\``);
                try {
                    let steamId = input;
                    if (!/^\d{17}$/.test(steamId)) {
                        const resolveRes = await safeFetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY || ''}&vanityurl=${encodeURIComponent(steamId)}`);
                        const resolveData = await resolveRes.json();
                        if (resolveData.response?.success !== 1) return message.reply(`${EMOJI.carpi} Steam kullanıcısı bulunamadı.`);
                        steamId = resolveData.response.steamid;
                    }
                    const summaryRes = await safeFetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY || ''}&steamids=${steamId}`);
                    const summaryData = await summaryRes.json();
                    const player = summaryData.response?.players?.[0];
                    if (!player) return message.reply(`${EMOJI.carpi} Steam profili bulunamadı.`);
                    const embed = new EmbedBuilder()
                        .setColor(0x171A21)
                        .setTitle(`${EMOJI.steam} ${player.personaname}`)
                        .setURL(player.profileurl)
                        .setThumbnail(player.avatarfull)
                        .addFields(
                            { name: 'SteamID', value: `\`${steamId}\``, inline: true },
                            { name: 'Durum', value: `\`${player.personastate === 1 ? 'Çevrimiçi' : 'Çevrimdışı'}\``, inline: true },
                            { name: 'Ülke', value: `\`${player.loccountrycode || 'Gizli'}\``, inline: true }
                        )
                        .setFooter({ text: `Steam ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Steam hatası: \`${e.message}\``); }
                return;
            }

            // ==================== TWITCH ====================
            if (command === 'twitch') {
                const kanal = args[0];
                if (!kanal) return message.reply(`${EMOJI.carpi} Bir Twitch kanal adı belirt! Örnek: \`${PREFIX}twitch shroud\``);
                const clientId = process.env.TWITCH_CLIENT_ID;
                const accessToken = process.env.TWITCH_ACCESS_TOKEN;
                if (!clientId || !accessToken) return message.reply(`${EMOJI.carpi} Twitch API anahtarları eksik! (\`TWITCH_CLIENT_ID\`, \`TWITCH_ACCESS_TOKEN\`)`);
                try {
                    const userRes = await safeFetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(kanal)}`, {
                        headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${accessToken}` }
                    });
                    const userData = await userRes.json();
                    const user = userData.data?.[0];
                    if (!user) return message.reply(`${EMOJI.carpi} Twitch kanalı bulunamadı.`);
                    const streamRes = await safeFetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(kanal)}`, {
                        headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${accessToken}` }
                    });
                    const streamData = await streamRes.json();
                    const stream = streamData.data?.[0];
                    let desc = `**Kanal:** ${user.display_name}\n`;
                    if (stream) {
                        desc += `**Durum:** Yayında\n**Oyun:** ${stream.game_name}\n**İzleyici:** ${stream.viewer_count}\n**Başlık:** ${stream.title}`;
                    } else {
                        desc += `**Durum:** Yayında değil`;
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0x9146FF)
                        .setTitle(`${EMOJI.twitch} ${user.display_name}`)
                        .setURL(`https://twitch.tv/${user.login}`)
                        .setThumbnail(user.profile_image_url)
                        .setDescription(desc)
                        .setFooter({ text: `Twitch ${EMOJI.trbayrak}` });
                    await message.reply({ embeds: [embed] });
                } catch (e) { message.reply(`${EMOJI.carpi} Twitch hatası: \`${e.message}\``); }
                return;
            }

            // ==================== TARAMA ====================
            if (command === 'tarama' || command === 'tara') {
                let url = args[0];
                if (!url) return message.reply(`${EMOJI.carpi} Bir URL belirt! Örnek: \`${PREFIX}tarama google.com\``);
                if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
                const yukleniyorMsg = await message.channel.send(`${EMOJI.yukleniyor} **Site taranıyor...** \`${url}\``);
                try {
                    const startTime = Date.now();
                    const response = await safeFetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (MELEZYA Bot Scanner)' } }, 15000);
                    const sure = Date.now() - startTime;
                    const html = await response.text();
                    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                    const title = titleMatch ? titleMatch[1].trim().slice(0, 100) : 'Yok';
                    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
                    const metaDesc = descMatch ? descMatch[1].trim().slice(0, 200) : 'Yok';
                    const teknolojiler = [];
                    if (html.includes('wp-content') || html.includes('wordpress')) teknolojiler.push('WordPress');
                    if (html.includes('react') || html.includes('__REACT')) teknolojiler.push('React');
                    if (html.includes('next.js') || html.includes('__NEXT_DATA__')) teknolojiler.push('Next.js');
                    if (html.includes('vue') || html.includes('__VUE__')) teknolojiler.push('Vue.js');
                    if (html.includes('angular')) teknolojiler.push('Angular');
                    if (html.includes('bootstrap')) teknolojiler.push('Bootstrap');
                    if (html.includes('jquery')) teknolojiler.push('jQuery');
                    if (response.headers.get('server')?.includes('cloudflare')) teknolojiler.push('Cloudflare');
                    const guvenlik = {
                        hsts: response.headers.get('strict-transport-security') ? 'Var' : 'Yok',
                        csp: response.headers.get('content-security-policy') ? 'Var' : 'Yok',
                        xframe: response.headers.get('x-frame-options') ? 'Var' : 'Yok',
                        xcontent: response.headers.get('x-content-type-options') ? 'Var' : 'Yok',
                        xxss: response.headers.get('x-xss-protection') ? 'Var' : 'Yok',
                        referrer: response.headers.get('referrer-policy') ? 'Var' : 'Yok'
                    };
                    let robotsInfo = 'Yok';
                    try {
                        const robotsRes = await safeFetch(new URL('/robots.txt', url).href, {}, 5000);
                        if (robotsRes.ok) {
                            const robotsTxt = await robotsRes.text();
                            robotsInfo = `Var (${robotsTxt.split('\n').length} satır)`;
                        }
                    } catch (e) {}
                    let sitemapInfo = 'Yok';
                    try {
                        const sitemapRes = await safeFetch(new URL('/sitemap.xml', url).href, {}, 5000);
                        if (sitemapRes.ok) {
                            const sitemapTxt = await sitemapRes.text();
                            const urlCount = (sitemapTxt.match(/<url>/g) || []).length;
                            sitemapInfo = `Var (${urlCount} URL)`;
                        }
                    } catch (e) {}
                    let apiInfo = 'Bulunamadı';
                    const apiPaths = ['/openapi.json', '/swagger.json', '/api-docs', '/swagger-ui.html'];
                    for (const path of apiPaths) {
                        try {
                            const apiRes = await safeFetch(new URL(path, url).href, {}, 5000);
                            if (apiRes.ok) {
                                const apiText = await apiRes.text();
                                if (apiText.includes('openapi') || apiText.includes('swagger')) {
                                    apiInfo = `Bulundu: \`${path}\``;
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0x4FC3F7)
                        .setTitle(`SİTE TARAMA: ${new URL(url).hostname}`)
                        .setDescription(`**URL:** \`${url}\`\n**Durum:** \`${response.status} ${response.statusText}\`\n**Yanıt Süresi:** \`${sure}ms\``)
                        .addFields(
                            { name: 'Sayfa Başlığı', value: `\`${title}\``, inline: false },
                            { name: 'Meta Açıklama', value: `\`${metaDesc}\``, inline: false },
                            { name: 'Sunucu', value: `\`${response.headers.get('server') || 'Bilinmiyor'}\``, inline: true },
                            { name: 'Content-Type', value: `\`${response.headers.get('content-type') || 'Bilinmiyor'}\``, inline: true },
                            { name: 'Teknolojiler', value: teknolojiler.length > 0 ? teknolojiler.join(', ') : 'Bilinmiyor', inline: false },
                            { name: 'Güvenlik Başlıkları', value: `HSTS: ${guvenlik.hsts} | CSP: ${guvenlik.csp} | X-Frame: ${guvenlik.xframe}\nX-Content: ${guvenlik.xcontent} | X-XSS: ${guvenlik.xxss} | Referrer: ${guvenlik.referrer}`, inline: false },
                            { name: 'robots.txt', value: `\`${robotsInfo}\``, inline: true },
                            { name: 'sitemap.xml', value: `\`${sitemapInfo}\``, inline: true },
                            { name: 'OpenAPI/Swagger', value: apiInfo, inline: false }
                        )
                        .setFooter({ text: `${FOOTER} • Sadece herkese açık bilgiler` })
                        .setTimestamp();
                    await yukleniyorMsg.edit({ content: null, embeds: [embed] });
                } catch (e) {
                    console.error('Tarama hatası:', e);
                    await yukleniyorMsg.edit({ content: `${EMOJI.carpi} Site taranamadı: \`${e.message}\`` });
                }
                return;
            }

            // ==================== CIPHER ====================
            if (command === 'cipher') {
                const altKomut = args[0]?.toLowerCase();
                const tip = args[1]?.toLowerCase();
                const metin = args.slice(3).join(' ');
                if (!altKomut) {
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.encode} CIPHER KOMUTLARI`).setDescription(`**Kullanım:**\n\`${PREFIX}cipher encode base64 <metin>\`\n\`${PREFIX}cipher decode base64 <metin>\`\n\`${PREFIX}cipher hash <metin>\`\n\`${PREFIX}cipher timestamp\``).setFooter({ text: FOOTER });
                    return message.reply({ embeds: [embed] });
                }
                if (altKomut === 'encode') {
                    if (!tip || !metin) return message.reply(`${EMOJI.carpi} Kullanım: \`${PREFIX}cipher encode base64 <metin>\``);
                    let sonuc = '';
                    if (tip === 'base64') sonuc = Buffer.from(metin, 'utf-8').toString('base64');
                    else if (tip === 'hex') sonuc = Buffer.from(metin, 'utf-8').toString('hex');
                    else if (tip === 'url') sonuc = encodeURIComponent(metin);
                    else if (tip === 'binary') sonuc = metin.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                    else return message.reply(`${EMOJI.carpi} Desteklenen tipler: \`base64\`, \`hex\`, \`url\`, \`binary\``);
                    const embed = new EmbedBuilder().setColor(0x00FF00).setTitle(`${EMOJI.encode} ENCODE - ${tip.toUpperCase()}`).addFields(
                        { name: 'Girdi', value: `\`\`\`${metin.slice(0, 500)}\`\`\`` },
                        { name: 'Sonuç', value: `\`\`\`${sonuc.slice(0, 1000)}\`\`\`` }
                    ).setFooter({ text: FOOTER });
                    return message.reply({ embeds: [embed] });
                }
                if (altKomut === 'decode') {
                    if (!tip || !metin) return message.reply(`${EMOJI.carpi} Kullanım: \`${PREFIX}cipher decode base64 <metin>\``);
                    try {
                        let sonuc = '';
                        if (tip === 'base64') sonuc = Buffer.from(metin, 'base64').toString('utf-8');
                        else if (tip === 'hex') sonuc = Buffer.from(metin, 'hex').toString('utf-8');
                        else if (tip === 'url') sonuc = decodeURIComponent(metin);
                        else if (tip === 'binary') sonuc = metin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
                        else return message.reply(`${EMOJI.carpi} Desteklenen tipler: \`base64\`, \`hex\`, \`url\`, \`binary\``);
                        const embed = new EmbedBuilder().setColor(0x00FF00).setTitle(`${EMOJI.decode} DECODE - ${tip.toUpperCase()}`).addFields(
                            { name: 'Girdi', value: `\`\`\`${metin.slice(0, 500)}\`\`\`` },
                            { name: 'Sonuç', value: `\`\`\`${sonuc.slice(0, 1000)}\`\`\`` }
                        ).setFooter({ text: FOOTER });
                        return message.reply({ embeds: [embed] });
                    } catch (e) {
                        return message.reply(`${EMOJI.carpi} Decode başarısız: \`${e.message}\``);
                    }
                }
                if (altKomut === 'hash') {
                    const hashMetin = args.slice(2).join(' ');
                    if (!hashMetin) return message.reply(`${EMOJI.carpi} Kullanım: \`${PREFIX}cipher hash <metin>\``);
                    const md5 = crypto.createHash('md5').update(hashMetin).digest('hex');
                    const sha1 = crypto.createHash('sha1').update(hashMetin).digest('hex');
                    const sha256 = crypto.createHash('sha256').update(hashMetin).digest('hex');
                    const sha512 = crypto.createHash('sha512').update(hashMetin).digest('hex');
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.encode} CIPHER - HASH`).addFields(
                        { name: 'MD5', value: `\`${md5}\`` },
                        { name: 'SHA1', value: `\`${sha1}\`` },
                        { name: 'SHA256', value: `\`${sha256}\`` },
                        { name: 'SHA512', value: `\`${sha512}\`` }
                    ).setFooter({ text: FOOTER });
                    return message.reply({ embeds: [embed] });
                }
                if (altKomut === 'timestamp' || altKomut === 'ts') {
                    const now = Math.floor(Date.now() / 1000);
                    const embed = new EmbedBuilder().setColor(0x4FC3F7).setTitle(`${EMOJI.saat} CIPHER - TIMESTAMP`).setDescription(`**Saniye:** \`${now}\`\n**Milisaniye:** \`${Date.now()}\`\n**Discord:** \`<t:${now}:f>\` → <t:${now}:f>\n**Discord (R):** \`<t:${now}:R>\` → <t:${now}:R>`).setFooter({ text: FOOTER });
                    return message.reply({ embeds: [embed] });
                }
                return message.reply(`${EMOJI.carpi} Bilinmeyen komut. \`${PREFIX}cipher\` yaz.`);
            }

            // ==================== YARDIM ====================
            if (command === 'yardim' || command === 'yardım' || command === 'help') {
                if (args[0]) {
                    const arananKomut = args[0].toLowerCase();
                    const komutBilgileri = {
                        'apoyabas': { aciklama: 'Apo sayacını arttırır.', kullanim: `${PREFIX}apoyabas` },
                        'milyoner': { aciklama: '13 soruluk bilgi yarışması başlatır.', kullanim: `${PREFIX}milyoner` },
                        'rusruleti': { aciklama: 'Rus ruleti oynar (istatistikli).', kullanim: `${PREFIX}rusruleti` },
                        'ship': { aciklama: 'İki kişi arasında aşk ölçer.', kullanim: `${PREFIX}ship @kullanıcı` },
                        '1vs1': { aciklama: 'Düello başlatır.', kullanim: `${PREFIX}1vs1 @kullanıcı` },
                        'temizle': { aciklama: 'Belirtilen sayıda mesaj siler.', kullanim: `${PREFIX}temizle <1-100>` },
                        'kick': { aciklama: 'Kullanıcıyı sunucudan atar.', kullanim: `${PREFIX}kick @kullanıcı [sebep]` },
                        'ban': { aciklama: 'Kullanıcıyı sunucudan yasaklar.', kullanim: `${PREFIX}ban @kullanıcı [sebep]` },
                        'ban-list': { aciklama: 'Tüm banları listeler.', kullanim: `${PREFIX}ban-list` },
                        'uyar': { aciklama: 'Kullanıcıya uyarı verir (kademeli rol + DM).', kullanim: `${PREFIX}uyar @kullanıcı [sebep]` },
                        'uyarı-sil': { aciklama: 'Kullanıcının belirtilen uyarısını siler.', kullanim: `${PREFIX}uyarı-sil @kullanıcı <numara>` },
                        'uyarı-sıfırla': { aciklama: 'Kullanıcının tüm uyarılarını siler.', kullanim: `${PREFIX}uyarı-sıfırla @kullanıcı` },
                        'hava': { aciklama: 'Belirtilen şehrin hava durumunu gösterir.', kullanim: `${PREFIX}hava [şehir]` },
                        'döviz': { aciklama: 'Güncel döviz kurlarını gösterir.', kullanim: `${PREFIX}döviz` },
                        'kripto': { aciklama: 'Güncel kripto para fiyatlarını gösterir.', kullanim: `${PREFIX}kripto` },
                        'wiki': { aciklama: 'Wikipedia\'dan bilgi getirir.', kullanim: `${PREFIX}wiki <konu>` },
                        'github': { aciklama: 'GitHub kullanıcı bilgilerini gösterir.', kullanim: `${PREFIX}github <kullanıcı>` },
                        'roblox': { aciklama: 'Roblox kullanıcı bilgilerini gösterir.', kullanim: `${PREFIX}roblox <kullanıcı>` },
                        'minecraft': { aciklama: 'Minecraft oyuncu bilgilerini gösterir.', kullanim: `${PREFIX}minecraft <oyuncu>` },
                        'borsa': { aciklama: 'Hisse senedi fiyatını gösterir.', kullanim: `${PREFIX}borsa <sembol>` },
                        'deprem': { aciklama: 'Son depremleri listeler.', kullanim: `${PREFIX}deprem` },
                        'ülke': { aciklama: 'Ülke bilgilerini gösterir.', kullanim: `${PREFIX}ülke <ülke>` },
                        'nasa': { aciklama: 'NASA APOD fotoğrafını gösterir.', kullanim: `${PREFIX}nasa` },
                        'spotify': { aciklama: 'Spotify\'da şarkı arar.', kullanim: `${PREFIX}spotify <şarkı>` },
                        'steam': { aciklama: 'Steam kullanıcı bilgilerini gösterir.', kullanim: `${PREFIX}steam <kullanıcı/ID>` },
                        'twitch': { aciklama: 'Twitch kanal durumunu gösterir.', kullanim: `${PREFIX}twitch <kanal>` },
                        'banner': { aciklama: 'Kullanıcının banner\'ını gösterir.', kullanim: `${PREFIX}banner [@kullanıcı]` },
                        'cipher': { aciklama: 'Encode/decode/hash/timestamp yapar.', kullanim: `${PREFIX}cipher encode/decode/hash/timestamp` },
                        'tarama': { aciklama: 'Bir siteyi güvenlik açısından tarar.', kullanim: `${PREFIX}tarama <url>` },
                        'profil': { aciklama: 'Kullanıcı profilini gösterir.', kullanim: `${PREFIX}profil [@kullanıcı]` },
                        'atam': { aciklama: 'Rastgele Atatürk fotoğrafı ve sözü gönderir.', kullanim: `${PREFIX}atam` },
                        'log-ara': { aciklama: 'Kullanıcının mesajlarında kelime arar.', kullanim: `${PREFIX}log-ara @kullanıcı <kelime>` },
                        'log-istatistik': { aciklama: 'Veritabanı tablo istatistiklerini gösterir.', kullanim: `${PREFIX}log-istatistik` },
                        'yedek-al': { aciklama: 'Veritabanı yedeği alır (sadece bot sahibi).', kullanim: `${PREFIX}yedek-al` },
                        'otomod-durum': { aciklama: 'Otomatik moderasyon durumunu gösterir.', kullanim: `${PREFIX}otomod-durum` },
                        'otomod-kelime-ekle': { aciklama: 'Küfür listesine kelime ekler.', kullanim: `${PREFIX}otomod-kelime-ekle <kelime>` },
                        'otomod-kelime-sil': { aciklama: 'Küfür listesinden kelime siler.', kullanim: `${PREFIX}otomod-kelime-sil <kelime>` },
                        'otomod-kelime-liste': { aciklama: 'Küfür listesini DM\'e gönderir.', kullanim: `${PREFIX}otomod-kelime-liste` },
                        'otomod-izinli-kanal-ekle': { aciklama: 'Kanalı otomatik moddan muaf tutar.', kullanim: `${PREFIX}otomod-izinli-kanal-ekle #kanal` },
                        'otomod-izinli-kanal-sil': { aciklama: 'Kanal muafiyetini kaldırır.', kullanim: `${PREFIX}otomod-izinli-kanal-sil #kanal` },
                        'otomod-izinli-kanal-liste': { aciklama: 'Muaf kanalları listeler.', kullanim: `${PREFIX}otomod-izinli-kanal-liste` },
                        'otomod-aç': { aciklama: 'Otomatik moderasyonu açar.', kullanim: `${PREFIX}otomod-aç` },
                        'otomod-kapa': { aciklama: 'Otomatik moderasyonu kapatır.', kullanim: `${PREFIX}otomod-kapa` }
                    };
                    const bilgi = komutBilgileri[arananKomut];
                    if (!bilgi) return message.reply(`${EMOJI.carpi} **\`${arananKomut}\`** komutu hakkında bilgi bulunamadı!`);
                    const embed = new EmbedBuilder()
                        .setColor(0x4FC3F7)
                        .setTitle(`\`${PREFIX}${arananKomut}\` KOMUTU`)
                        .addFields(
                            { name: 'Açıklama', value: bilgi.aciklama, inline: false },
                            { name: 'Kullanım', value: `\`${bilgi.kullanim}\``, inline: false }
                        )
                        .setFooter({ text: `${FOOTER} • ${PREFIX}yardim <komut>` })
                        .setTimestamp();
                    await message.reply({ embeds: [embed] });
                    return;
                }
                const embed = new EmbedBuilder()
                    .setColor(0xE30A17)
                    .setTitle(`${EMOJI.kale} MELEZYA BOT KOMUTLARI ${EMOJI.trbayrak}`)
                    .setDescription(`Merhaba **${message.author.username}**! Toplam **90+ komut** ile hizmetindeyim.\n\n**Detaylı yardım için:** \`${PREFIX}yardim <komut>\``)
                    .addFields(
                        { name: `${EMOJI.kalkan} MODERASYON (ADMIN)`, value: '`temizle` `kick` `ban` `unban` `ban-list` `uyar` `uyarılar` `uyarı-sil` `uyarı-sıfırla` `sustur` `susturma-kaldır` `slowmode` `kanal-kilit` `kanal-aç`', inline: false },
                        { name: `${EMOJI.silah} EĞLENCE`, value: '`milyoner` `rusruleti` `ship` `1vs1` `apoyabas`', inline: false },
                        { name: `${EMOJI.trbayrak} MİLLİ DEĞERLER`, value: '`atam` `gencligehitabe` `istiklalmarsi` `gununsozu` `ataturkbilgi` `cumhuriyet` `nutuk` `bayrak` `saygi` `vatan`', inline: false },
                        { name: `${EMOJI.dolar} FİNANS & HAVA`, value: '`döviz` `hava` `kripto` `borsa`', inline: false },
                        { name: `${EMOJI.bilgi} HABER & BİLGİ`, value: '`haber` `namaz` `wiki` `tarihte-bugün`', inline: false },
                        { name: `${EMOJI.github} API & OYUN`, value: '`github` `roblox` `minecraft` `deprem` `ülke` `nasa` `spotify` `steam` `twitch`', inline: false },
                        { name: `${EMOJI.member} BİLGİ`, value: '`ping` `zaman` `kullanıcı` `sunucu` `avatar` `banner` `bot` `aktif` `profil` `günlük-istatistik`', inline: false },
                        { name: `${EMOJI.encode} CIPHER & ARAÇLAR`, value: '`cipher encode base64 <metin>` `cipher decode base64 <metin>` `cipher hash <metin>` `cipher timestamp` `tarama <url>`', inline: false },
                        { name: `${EMOJI.ayarlar} YÖNETİM (ADMIN)`, value: '`yedek` `yedek-al` `log-ara` `log-istatistik` `otomod-durum` `otomod-aç` `otomod-kapa` `otomod-kelime-ekle` `otomod-kelime-sil` `otomod-kelime-liste` `otomod-izinli-kanal-ekle` `otomod-izinli-kanal-sil` `otomod-izinli-kanal-liste`', inline: false }
                    )
                    .setFooter({ text: `${FOOTER} • Toplam 90+ komut • İyi eğlenceler!` })
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }

        } catch (e) {
            console.error('Komut hatası:', e);
            try {
                db.addErrorLog('messageCreate', e.message, e.stack, message.author.id, message.guild?.id || '');
            } catch (err) {}
            try {
                await message.reply(`${EMOJI.carpi} Bir hata oluştu! Hata kaydedildi.`);
            } catch (err) {}
        }
    });

    // =========================== BUTON ETKİLEŞİMLERİ ===========================
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId.startsWith('duello_')) {
                const parts = interaction.customId.split('_');
                const tip = parts[1];
                const davetEden = parts[2];
                const davetEdilen = parts[3];
                if (interaction.user.id !== davetEdilen) {
                    return interaction.reply({ content: `${EMOJI.carpi} Bu düello sana ait değil!`, flags: EPHEMERAL });
                }
                if (tip === 'red') {
                    return interaction.update({
                        embeds: [new EmbedBuilder().setColor(0x2B2D31).setTitle(`${EMOJI.carpi} DÜELLO REDDEDİLDİ`).setDescription(`**${interaction.user.username}** düelloyu reddetti.`).setFooter({ text: FOOTER })],
                        components: []
                    });
                }
                if (tip === 'kabul') {
                    const kazanan = Math.random() < 0.5 ? davetEden : davetEdilen;
                    const kazananUser = await client.users.fetch(kazanan).catch(() => null);
                    const kaybedenUser = await client.users.fetch(kazanan === davetEden ? davetEdilen : davetEden).catch(() => null);
                    const embed = new EmbedBuilder()
                        .setColor(0xFFD700)
                        .setTitle(`${EMOJI.kazanan} DÜELLO SONUCU ${EMOJI.kazanan}`)
                        .setDescription(`**${kazananUser?.username || 'Bilinmiyor'}** kazandı!\n\n**${kaybedenUser?.username || 'Bilinmiyor'}** kaybetti!`)
                        .setFooter({ text: FOOTER })
                        .setTimestamp();
                    return interaction.update({ embeds: [embed], components: [] });
                }
            }
        } catch (e) {
            console.error('Buton hatası:', e);
        }
    });
};
