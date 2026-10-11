// test-sqlite.js — Node sürümü ve node:sqlite testi
console.log('═══════════════════════════════════════');
console.log('🔍 KALE SQLite Test');
console.log('═══════════════════════════════════════');
console.log('📌 Node sürümü:', process.version);
console.log('📌 Platform:', process.platform);
console.log('📌 Mimari:', process.arch);
console.log('');

// Node sürümünü parçala
const versionParts = process.version.replace('v', '').split('.');
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

console.log(`📊 Sürüm detayı: ${major}.${minor}.${patch}`);

// Gereksinim: Node 22.13.0+
const requiredMajor = 22;
const requiredMinor = 13;

const isVersionOk = (major > requiredMajor) || (major === requiredMajor && minor >= requiredMinor);

if (!isVersionOk) {
    console.log('');
    console.log('⚠️  UYARI: Node 22.13+ önerilir!');
    console.log(`   Mevcut: ${major}.${minor}.${patch}`);
    console.log('   node:sqlite deneysel bayrak olmadan çalışmayabilir.');
    console.log('');
}

// node:sqlite testi
console.log('───────────────────────────────────────');
console.log('🧪 node:sqlite test ediliyor...');
console.log('───────────────────────────────────────');

try {
    const { DatabaseSync } = require('node:sqlite');
    console.log('✅ node:sqlite modülü yüklendi!');
    
    // Bellek içi test veritabanı
    const db = new DatabaseSync(':memory:');
    console.log('✅ Veritabanı oluşturuldu (bellek içi)');
    
    // Tablo oluştur
    db.exec(`
        CREATE TABLE test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tablo oluşturuldu');
    
    // Veri ekle
    db.prepare('INSERT INTO test (name, message) VALUES (?, ?)').run('KALE', 'Merhaba Dünya!');
    db.prepare('INSERT INTO test (name, message) VALUES (?, ?)').run('Bot', 'SQLite çalışıyor');
    console.log('✅ 2 satır eklendi');
    
    // Veri oku
    const rows = db.prepare('SELECT * FROM test').all();
    console.log('✅ Veriler okundu:');
    rows.forEach(row => {
        console.log(`   → [${row.id}] ${row.name}: ${row.message} (${row.created_at})`);
    });
    
    // Güncelle
    db.prepare('UPDATE test SET message = ? WHERE name = ?').run('Güncellendi!', 'KALE');
    const updated = db.prepare('SELECT * FROM test WHERE name = ?').get('KALE');
    console.log(`✅ Güncelleme testi: ${updated.message}`);
    
    // Sil
    db.prepare('DELETE FROM test WHERE name = ?').run('Bot');
    const remaining = db.prepare('SELECT COUNT(*) as count FROM test').get();
    console.log(`✅ Silme testi: ${remaining.count} satır kaldı`);
    
    // WAL modu testi
    db.exec('PRAGMA journal_mode = WAL');
    const walMode = db.prepare('PRAGMA journal_mode').get();
    console.log(`✅ WAL modu: ${walMode.journal_mode}`);
    
    // Kapat
    db.close();
    console.log('✅ Veritabanı kapatıldı');
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 SONUÇ: node:sqlite ÇALIŞIYOR!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📌 SQLite planına devam edebiliriz.');
    console.log('📌 Node sürümü yeterli:', process.version);
    console.log('');
    
} catch (e) {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('❌ SONUÇ: node:sqlite ÇALIŞMIYOR!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🔴 Hata:', e.message);
    console.log('🔴 Kod:', e.code || 'YOK');
    console.log('');
    console.log('💡 Muhtemel sebepler:');
    console.log('   1. Node sürümü 22.13\'ten eski (mevcut: ' + process.version + ')');
    console.log('   2. node:sqlite modülü bu platformda yok');
    console.log('   3. FadeHost Node sürümünü desteklemiyor');
    console.log('');
    console.log('🔄 Alternatif plan: sql.js kullanılacak');
    console.log('');
}
