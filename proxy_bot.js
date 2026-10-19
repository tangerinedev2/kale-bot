const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const { ProxyAgent } = require('undici');
require('dotenv').config();

const token3 = process.env.TOKEN3;
const PREFIX = 'c!';

const EMOJIS = {
    kalkan: '<:kalkan:1547954539817345044>',
    yesil: '<:yesil:1547954548876902460>',
    kirmizi: '<:kirmizi:1547954543671771146>',
    sari: '<:sari:1547954546251276419>',
    trbayrak: '<a:trbayrak:1547936258859475014>',
    logo: '<:logo:1561719099820609566>'
};

let proxyHavuzu = [];       // { ip, port, protocol, country, latency, lastCheck }
let sonGuncelleme = null;
let guncelleniyor = false;
let toplamKontrolEdilen = 0;
let toplamCalisan = 0;

const KAYNAKLAR = [
    {
        name: 'ProxyScrape',
        url: 'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/protocols/http/data.json',
        parse: (data) => (Array.isArray(data) ? data : []).map(p => ({ ip: p.ip, port: p.port, protocol: 'http', country: p.country || '?' }))
    },
    {
        name: 'Proxifly',
        url: 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.json',
        parse: (data) => (Array.isArray(data) ? data : []).map(p => ({ ip: p.ip, port: p.port, protocol: 'http', country: p.country || '?' }))
    },
    {
        name: 'Geonode',
        url: 'https://proxylist.geonode.com/api/proxy-list?limit=200&page=1&sort_by=lastChecked&sort_type=desc&protocols=http,https',
        parse: (data) => (data.data || []).map(p => ({ ip: p.ip, port: p.port, protocol: (p.protocols && p.protocols[0]) || 'http', country: p.country || '?' }))
    }
];

async function proxyleriCek() {
    const tum = [];
    for (const kaynak of KAYNAKLAR) {
        try {
            const res = await fetch(kaynak.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
            if (!res.ok) continue;
            const data = await res.json();
            const parsed = kaynak.parse(data);
            tum.push(...parsed);
            console.log(`[Proxy] ${kaynak.name}: ${parsed.length} proxy`);
        } catch (e) {
            console.error(`[Proxy] ${kaynak.name} hatası:`, e.message);
        }
    }
    const map = new Map();
    for (const p of tum) {
        const key = `${p.ip}:${p.port}`;
        if (!map.has(key)) map.set(key, p);
    }
    return Array.from(map.values());
}

async function proxyKontrol(proxy) {
    const baslangic = Date.now();
    try {
        const agent = new ProxyAgent(`http://${proxy.ip}:${proxy.port}`);
        const res = await fetch('https://httpbin.org/ip', {
            dispatcher: agent,
            signal: AbortSignal.timeout(8000),
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) return null;
        await res.text();
        return { ...proxy, latency: Date.now() - baslangic, lastCheck: Date.now() };
    } catch (e) {
        return null;
    }
}

// Her grup bittiğinde çalışanları ANINDA havuza ekle
async function havuzuGuncelle() {
    if (guncelleniyor) return;
    guncelleniyor = true;
    proxyHavuzu = [];
    toplamKontrolEdilen = 0;
    toplamCalisan = 0;
    console.log('[Proxy] Havuz güncelleniyor...');
    try {
        const adaylar = await proxyleriCek();
        console.log(`[Proxy] ${adaylar.length} aday, kontrol ediliyor...`);

        const parcalar = [];
        for (let i = 0; i < adaylar.length; i += 30) parcalar.push(adaylar.slice(i, i + 30));

        for (const parca of parcalar) {
            const sonuclar = await Promise.all(parca.map(p => proxyKontrol(p)));
            const calisanlar = sonuclar.filter(Boolean);
            // ANINDA havuza ekle
            proxyHavuzu.push(...calisanlar);
            toplamKontrolEdilen += parca.length;
            toplamCalisan = proxyHavuzu.length;
            console.log(`[Proxy] ${toplamKontrolEdilen} kontrol edildi, ${toplamCalisan} çalışan havuzda.`);
            // Çok hızlı döngü olmasın, hafif bekle
            await new Promise(r => setTimeout(r, 50));
        }
        sonGuncelleme = new Date();
        console.log(`[Proxy] Güncelleme tamamlandı. ${proxyHavuzu.length} çalışan proxy havuzda.`);
    } catch (e) {
        console.error('[Proxy] Güncelleme hatası:', e);
    } finally {
        guncelleniyor = false;
    }
}

function rastgeleProxy(adet = 1) {
    const kopya = [...proxyHavuzu];
    const secilen = [];
    for (let i = 0; i < adet && kopya.length > 0; i++) {
        const idx = Math.floor(Math.random() * kopya.length);
        secilen.push(kopya.splice(idx, 1)[0]);
    }
    return secilen;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages], partials: ['CHANNEL'] });

client.once('ready', async () => {
    console.log(`${EMOJIS.kalkan} Proxy Bot hazır: ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: 'Proxy Havuzu', type: 3 }], status: 'online' });
    await havuzuGuncelle();
    setInterval(havuzuGuncelle, 30 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();
    if (cmd !== 'proxy') return;

    const isAdmin = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);
    const altKomut = args[0]?.toLowerCase();

    if (!altKomut) {
        const embed = new EmbedBuilder()
            .setColor(0x4FC3F7)
            .setTitle(`${EMOJIS.logo} PROXY SİSTEMİ`)
            .setDescription(`**Kullanım:**\n\`${PREFIX}proxy kontrol\` — Proxyleri yeniden kontrol et (admin)\n\`${PREFIX}proxy al [adet]\` — Havuzdaki çalışan proxyleri **DM'den** gönderir (max 50)\n\`${PREFIX}proxy istatistik\` — Havuz durumu\n\n**Havuzda:** ${proxyHavuzu.length} çalışan proxy\n**Kontrol edilen:** ${toplamKontrolEdilen}\n**Son güncelleme:** ${sonGuncelleme ? `<t:${Math.floor(sonGuncelleme.getTime()/1000)}:R>` : 'Henüz yok'}`)
            .setFooter({ text: `CEZAİR Proxy ${EMOJIS.trbayrak}` });
        await message.reply({ embeds: [embed] });
        return;
    }

    if (altKomut === 'kontrol') {
        if (!isAdmin) return message.reply(`${EMOJIS.kirmizi} Bu komut sadece yöneticiler için.`);
        if (guncelleniyor) return message.reply(`${EMOJIS.sari} Zaten güncelleniyor, bekle.`);
        await message.reply(`${EMOJIS.sari} Proxy havuzu yeniden kontrol ediliyor. Çalışanlar anında havuza eklenecek.`);
        await havuzuGuncelle();
        await message.channel.send(`${EMOJIS.yesil} Kontrol tamamlandı. **${proxyHavuzu.length}** çalışan proxy havuzda.`);
        return;
    }

    if (altKomut === 'al') {
        const adet = Math.min(parseInt(args[1]) || 10, 50);
        if (proxyHavuzu.length === 0) {
            return message.reply(`${EMOJIS.sari} Havuzda henüz çalışan proxy yok. Kontrol devam ediyor, birkaç dakika sonra tekrar dene.`);
        }
        const secilen = rastgeleProxy(adet);
        let content = `CEZAİR PROXY LISTESI\nTarih: ${new Date().toLocaleString('tr-TR')}\nAdet: ${secilen.length}\n\n`;
        for (const p of secilen) {
            content += `${p.protocol}://${p.ip}:${p.port} | ${p.country} | ${p.latency}ms\n`;
        }
        const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: `proxies-${Date.now()}.txt` });
        try {
            await message.author.send({ content: `${EMOJIS.yesil} **${secilen.length}** proxy:`, files: [attachment] });
            if (message.guild) await message.reply(`${EMOJIS.yesil} Proxy listesi DM'ine gönderildi. (${secilen.length} adet)`);
        } catch (e) {
            await message.reply(`${EMOJIS.kirmizi} DM gönderilemedi! DM'in kapalı olabilir.`);
        }
        return;
    }

    if (altKomut === 'istatistik' || altKomut === 'stats') {
        const protokoller = {};
        const ulkeler = {};
        for (const p of proxyHavuzu) {
            protokoller[p.protocol] = (protokoller[p.protocol] || 0) + 1;
            ulkeler[p.country] = (ulkeler[p.country] || 0) + 1;
        }
        const topUlkeler = Object.entries(ulkeler).sort((a,b) => b[1]-a[1]).slice(0, 10);
        const ortLatency = proxyHavuzu.length > 0 ? Math.round(proxyHavuzu.reduce((s,p) => s + p.latency, 0) / proxyHavuzu.length) : 0;
        let desc = `**Havuzda çalışan:** ${proxyHavuzu.length}\n**Kontrol edilen:** ${toplamKontrolEdilen}\n**Ortalama gecikme:** ${ortLatency}ms\n**Son güncelleme:** ${sonGuncelleme ? `<t:${Math.floor(sonGuncelleme.getTime()/1000)}:R>` : 'Yok'}\n\n`;
        desc += `**Protokoller:**\n${Object.entries(protokoller).map(([k,v]) => `\`${k}\`: ${v}`).join('\n') || 'Yok'}\n\n`;
        desc += `**Ülkeler (top 10):**\n${topUlkeler.map(([k,v]) => `\`${k}\`: ${v}`).join('\n') || 'Yok'}`;
        const embed = new EmbedBuilder()
            .setColor(0x4FC3F7)
            .setTitle(`${EMOJIS.logo} PROXY İSTATİSTİKLERİ`)
            .setDescription(desc)
            .setFooter({ text: `CEZAİR Proxy ${EMOJIS.trbayrak}` });
        await message.reply({ embeds: [embed] });
        return;
    }

    message.reply(`${EMOJIS.kirmizi} Bilinmeyen komut. \`${PREFIX}proxy\` yaz.`);
});

process.on('unhandledRejection', e => console.error('Proxy Bot hata:', e));

client.login(token3);
