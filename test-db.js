// test-db.js — SQLite dosya testi
const db = require('./data/db.js');

console.log('🧪 SQLite dosya testi başlıyor...\n');

// 1. Test kullanıcısı ekle
db.ensureUser('test_user_123', 'TestUser', 'Test Kullanıcı', false);
console.log('✅ Test kullanıcısı eklendi');

// 2. Mesaj sayısını arttır
db.incrementUserMessages('test_user_123', 5, 50);
console.log('✅ Mesaj sayısı arttırıldı');

// 3. Uyarı ekle
db.addWarn('test_user_123', 'Test uyarısı', 'TestAdmin', 'admin_123');
console.log('✅ Uyarı eklendi');

// 4. Uyarıları oku
const warns = db.getWarns('test_user_123');
console.log(`✅ Uyarılar okundu: ${warns.length} adet`);

// 5. Kullanıcıyı oku
const user = db.getUser('test_user_123');
console.log('✅ Kullanıcı okundu:');
console.log(`   → Mesaj: ${user.messageCount}`);
console.log(`   → Kelime: ${user.wordCount}`);
console.log(`   → Karakter: ${user.characterCount}`);

// 6. Apo sayacı test
const apoBefore = db.getApoCount();
const apoAfter = db.incrementApoCount();
console.log(`✅ Apo sayaç: ${apoBefore} → ${apoAfter}`);

// 7. Ayarları oku
const settings = db.loadSettings();
console.log(`✅ Ayarlar okundu: ${Object.keys(settings).length} adet`);

// 8. Toplam kullanıcı sayısı
const total = db.getTotalUsers();
console.log(`✅ Toplam kullanıcı: ${total}`);

console.log('\n🎉 TÜM TESTLER BAŞARILI!');
console.log('📌 SQLite dosyası çalışıyor: data/kale.db');
