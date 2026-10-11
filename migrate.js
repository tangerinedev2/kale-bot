// ============================================================
// KALE BOT - JSON → SQLite Migration
// Sadece 1 kere çalıştırılır. Sonra JSON'lar arşivlenir.
// Kullanım: node migrate.js
// ============================================================

const fs = require('fs');
const path = require('path');
const db = require('./data/db.js');

const ARSIV_KLASORU = path.join(__dirname, 'arsiv');

// Arşiv klasörünü oluştur
if (!fs.existsSync(ARSIV_KLASORU)) {
    fs.mkdirSync(ARSIV_KLASORU, { recursive: true });
    console.log('📁 arsiv/ klasörü oluşturuldu');
}

// JSON dosyasını arşive taşı
function arsivle(dosyaAdi) {
    const kaynak = path.join(__dirname, dosyaAdi);
    if (!fs.existsSync(kaynak)) return false;
    const hedef = path.join(ARSIV_KLASORU, dosyaAdi + '.bak');
    try {
        fs.renameSync(kaynak, hedef);
        console.log(`📦 Arşivlendi: ${dosyaAdi} → arsiv/${dosyaAdi}.bak`);
        return true;
    } catch (e) {
        console.error(`❌ Arşivlenemedi: ${dosyaAdi}`, e.message);
        return false;
    }
}

// JSON oku
function okuJSON(dosyaAdi) {
    const yol = path.join(__dirname, dosyaAdi);
    if (!fs.existsSync(yol)) return null;
    try {
        return JSON.parse(fs.readFileSync(yol, 'utf8'));
    } catch (e) {
        console.error(`❌ ${dosyaAdi} okunamadı:`, e.message);
        return null;
    }
}

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('🚀 KALE BOT - JSON → SQLite Migration');
console.log('═══════════════════════════════════════════════');
console.log('');

// Veritabanını başlat
const database = db.getDB();
console.log('✅ SQLite veritabanı hazır');
console.log('');

// ============================================================
// 1. AYARLAR.JSON → settings
// ============================================================
console.log('📋 1/8: ayarlar.json → settings');
const ayarlar = okuJSON('ayarlar.json');
if (ayarlar) {
    let sayi = 0;
    for (const [key, value] of Object.entries(ayarlar)) {
        db.setSetting(key, value);
        sayi++;
    }
    console.log(`   ✅ ${sayi} ayar aktarıldı`);
    arsivle('ayarlar.json');
} else {
    console.log('   ⏭️  ayarlar.json yok, atlandı');
}

// ============================================================
// 2. APO_SAYAC.JSON → apo_sayac
// ============================================================
console.log('');
console.log('📋 2/8: apo_sayac.json → apo_sayac');
const apoSayac = okuJSON('apo_sayac.json');
if (apoSayac && typeof apoSayac.count === 'number') {
    database.prepare('UPDATE apo_sayac SET count = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 1').run(apoSayac.count);
    console.log(`   ✅ Apo sayaç aktarıldı: ${apoSayac.count}`);
    arsivle('apo_sayac.json');
} else {
    console.log('   ⏭️  apo_sayac.json yok veya geçersiz, atlandı');
}

// ============================================================
// 3. WARNS.JSON → warns
// ============================================================
console.log('');
console.log('📋 3/8: warns.json → warns');
const warns = okuJSON('warns.json');
if (warns) {
    let sayi = 0;
    for (const [userId, uyariListesi] of Object.entries(warns)) {
        if (!Array.isArray(uyariListesi)) continue;
        for (const uyari of uyariListesi) {
            db.addWarn(userId, uyari.reason || '', uyari.by || '', '');
            sayi++;
        }
    }
    console.log(`   ✅ ${sayi} uyarı aktarıldı`);
    arsivle('warns.json');
} else {
    console.log('   ⏭️  warns.json yok, atlandı');
}

// ============================================================
// 4. GOZALTINDA.JSON → custody
// ============================================================
console.log('');
console.log('📋 4/8: gozaltinda.json → custody');
const gozaltinda = okuJSON('gozaltinda.json');
if (gozaltinda) {
    let sayi = 0;
    for (const [userId, data] of Object.entries(gozaltinda)) {
        db.addCustody(userId, data.sebep || 'Belirtilmedi', data.yetkili || '', '');
        sayi++;
    }
    console.log(`   ✅ ${sayi} gözaltı kaydı aktarıldı`);
    arsivle('gozaltinda.json');
} else {
    console.log('   ⏭️  gozaltinda.json yok, atlandı');
}

// ============================================================
// 5. AKTIFLIK.JSON → users + activity
// ============================================================
console.log('');
console.log('📋 5/8: aktiflik.json → users + activity');
const aktiflik = okuJSON('aktiflik.json');
if (aktiflik) {
    let sayi = 0;
    for (const [userId, data] of Object.entries(aktiflik)) {
        db.ensureUser(userId, '', '', false);
        if (data.messages) {
            database.prepare('UPDATE users SET messageCount = ? WHERE userId = ?').run(data.messages, userId);
        }
        if (data.voiceMinutes) {
            database.prepare('UPDATE users SET voiceMinutes = ? WHERE userId = ?').run(data.voiceMinutes, userId);
        }
        if (data.lastMessage) {
            database.prepare('UPDATE users SET lastMessage = ? WHERE userId = ?').run(data.lastMessage, userId);
        }
        sayi++;
    }
    console.log(`   ✅ ${sayi} kullanıcı aktifliği aktarıldı`);
    arsivle('aktiflik.json');
} else {
    console.log('   ⏭️  aktiflik.json yok, atlandı');
}

// ============================================================
// 6. USERLOGS/ → tüm tablolar
// ============================================================
console.log('');
console.log('📋 6/8: userlogs/ → tüm tablolar');
const userlogsKlasoru = path.join(__dirname, 'userlogs');
if (fs.existsSync(userlogsKlasoru)) {
    const dosyalar = fs.readdirSync(userlogsKlasoru).filter(f => f.endsWith('.json'));
    console.log(`   📁 ${dosyalar.length} kullanıcı log dosyası bulundu`);
    
    let toplamIslenen = 0;
    let toplamMesaj = 0;
    let toplamKomut = 0;
    let toplamSes = 0;
    let toplamUyari = 0;
    
    for (const dosya of dosyalar) {
        const userId = dosya.replace('.json', '');
        try {
            const data = JSON.parse(fs.readFileSync(path.join(userlogsKlasoru, dosya), 'utf8'));
            
            // Kullanıcıyı kaydet
            db.ensureUser(userId, data.username || '', data.displayName || '', false);
            
            // Temel istatistikler
            if (data.messageCount) {
                database.prepare('UPDATE users SET messageCount = ? WHERE userId = ?').run(data.messageCount, userId);
            }
            if (data.voiceMinutes) {
                database.prepare('UPDATE users SET voiceMinutes = ? WHERE userId = ?').run(data.voiceMinutes, userId);
            }
            if (data.wordCount) {
                database.prepare('UPDATE users SET wordCount = ? WHERE userId = ?').run(data.wordCount, userId);
            }
            if (data.characterCount) {
                database.prepare('UPDATE users SET characterCount = ? WHERE userId = ?').run(data.characterCount, userId);
            }
            if (data.lastMessage) {
                database.prepare('UPDATE users SET lastMessage = ? WHERE userId = ?').run(data.lastMessage, userId);
            }
            
            // Mesajlar
            if (Array.isArray(data.messages)) {
                for (const m of data.messages.slice(-500)) {
                    db.addMessageLog(userId, m.id || '', m.channelId || '', m.channel || '', m.content || '', m.attachments || [], m.mentions || []);
                    toplamMesaj++;
                }
            }
            
            // Komutlar
            if (Array.isArray(data.commands)) {
                for (const c of data.commands.slice(-200)) {
                    db.addCommandLog(userId, c.command || '', c.args || '', '');
                    toplamKomut++;
                }
            }
            
            // Ses oturumları
            if (Array.isArray(data.voiceSessions)) {
                for (const v of data.voiceSessions.slice(-200)) {
                    db.addVoiceSession(userId, v.channelId || '', v.channel || '', v.type || '', v.duration || 0, v.startTime || '', v.endTime || '');
                    toplamSes++;
                }
            }
            
            // Ses periyotları
            if (Array.isArray(data.voicePeriods)) {
                for (const v of data.voicePeriods.slice(-200)) {
                    db.addVoicePeriod(userId, v.channelId || '', v.channel || '', v.startTime || '', v.endTime || '', v.duration || 0, v.formatted || '');
                }
            }
            
            // Uyarılar
            if (Array.isArray(data.warnings)) {
                for (const w of data.warnings) {
                    db.addWarn(userId, w.reason || '', w.by || '', '');
                    toplamUyari++;
                }
            }
            
            // Moderasyon
            if (Array.isArray(data.moderation)) {
                for (const m of data.moderation) {
                    db.addModeration(userId, m.type || '', m.reason || '', m.duration || 0, m.by || '', '');
                }
            }
            
            // Nick geçmişi
            if (Array.isArray(data.nicknames)) {
                for (const n of data.nicknames) {
                    db.addNicknameHistory(userId, n.old || '', n.new || '');
                }
            }
            
            // Kullanıcı adı geçmişi
            if (Array.isArray(data.usernameHistory)) {
                for (const u of data.usernameHistory) {
                    db.addUsernameHistory(userId, u.old || '', u.new || '');
                }
            }
            
            // Avatar geçmişi
            if (Array.isArray(data.avatarHistory)) {
                for (const a of data.avatarHistory) {
                    db.addAvatarHistory(userId, a.old || '', a.new || '');
                }
            }
            
            // Durum geçmişi
            if (Array.isArray(data.statusHistory)) {
                for (const s of data.statusHistory) {
                    db.addStatusHistory(userId, s.old || '', s.new || '');
                }
            }
            
            // Aktivite geçmişi
            if (Array.isArray(data.activityHistory)) {
                for (const a of data.activityHistory) {
                    db.addActivityHistory(userId, a.old || '', a.new || '');
                }
            }
            
            // Katılma/ayrılma
            if (Array.isArray(data.joins)) {
                for (const j of data.joins) {
                    db.addJoinLeave(userId, 'join', j.tag || '', 0);
                }
            }
            if (Array.isArray(data.leaves)) {
                for (const l of data.leaves) {
                    db.addJoinLeave(userId, 'leave', l.tag || '', 0);
                }
            }
            
            toplamIslenen++;
        } catch (e) {
            console.error(`   ❌ ${dosya} işlenemedi:`, e.message);
        }
    }
    
    console.log(`   ✅ ${toplamIslenen} kullanıcı işlendi`);
    console.log(`   📨 ${toplamMesaj} mesaj`);
    console.log(`   ⚡ ${toplamKomut} komut`);
    console.log(`   🔊 ${toplamSes} ses oturumu`);
    console.log(`   ⚠️  ${toplamUyari} uyarı`);
    
    // userlogs klasörünü arşivle
    const hedefKlasor = path.join(ARSIV_KLASORU, 'userlogs');
    try {
        if (fs.existsSync(hedefKlasor)) {
            fs.rmSync(hedefKlasor, { recursive: true, force: true });
        }
        fs.renameSync(userlogsKlasoru, hedefKlasor);
        console.log(`   📦 userlogs/ arşivlendi → arsiv/userlogs/`);
    } catch (e) {
        console.error('   ❌ userlogs arşivlenemedi:', e.message);
    }
} else {
    console.log('   ⏭️  userlogs/ yok, atlandı');
}

// ============================================================
// 7. DİĞER JSON DOSYALARI
// ============================================================
console.log('');
console.log('📋 7/8: Diğer JSON dosyaları');
const digerDosyalar = ['soundcloud_client_id.json', 'apo.json'];
for (const dosya of digerDosyalar) {
    if (arsivle(dosya)) {
        console.log(`   📦 ${dosya} arşivlendi`);
    }
}

// ============================================================
// 8. ÖZET
// ============================================================
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('📊 MIGRATION ÖZETİ');
console.log('═══════════════════════════════════════════════');

const toplamKullanici = database.prepare('SELECT COUNT(*) as c FROM users').get().c;
const toplamMesajDB = database.prepare('SELECT COUNT(*) as c FROM messages').get().c;
const toplamUyariDB = database.prepare('SELECT COUNT(*) as c FROM warns').get().c;
const toplamKomutDB = database.prepare('SELECT COUNT(*) as c FROM commands').get().c;
const toplamSesDB = database.prepare('SELECT COUNT(*) as c FROM voice_sessions').get().c;
const toplamGozaltiDB = database.prepare('SELECT COUNT(*) as c FROM custody').get().c;

console.log(`👥 Kullanıcı:     ${toplamKullanici}`);
console.log(`📨 Mesaj:         ${toplamMesajDB}`);
console.log(`⚠️  Uyarı:         ${toplamUyariDB}`);
console.log(`⚡ Komut:         ${toplamKomutDB}`);
console.log(`🔊 Ses oturumu:   ${toplamSesDB}`);
console.log(`🔒 Gözaltı:       ${toplamGözaltıDB}`);

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('🎉 MIGRATION TAMAMLANDI!');
console.log('═══════════════════════════════════════════════');
console.log('');
console.log('📌 Tüm JSON dosyaları arsiv/ klasörüne taşındı.');
console.log('📌 SQLite veritabanı: data/kale.db');
console.log('📌 Artık bot SQLite kullanabilir.');
console.log('');
console.log('⚠️  Bu dosyayı bir daha çalıştırmana gerek yok.');
console.log('');
