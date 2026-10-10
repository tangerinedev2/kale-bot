const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// =========================== APO SAYACI (KALICI) ===========================
const APO_SAYAC_PATH = path.join(__dirname, 'apo_sayac.json');

function loadApoCount() {
    try {
        if (fs.existsSync(APO_SAYAC_PATH)) {
            const data = JSON.parse(fs.readFileSync(APO_SAYAC_PATH, 'utf-8'));
            return data.count || 0;
        }
    } catch (e) { console.error('[rat] apo sayac okunamadi:', e); }
    return 0;
}

function saveApoCount(count) {
    try {
        fs.writeFileSync(APO_SAYAC_PATH, JSON.stringify({ count }, null, 2), 'utf-8');
    } catch (e) { console.error('[rat] apo sayac yazilamadi:', e); }
}

module.exports = async (client, EMOJIS, BAYRAK, LOADING, GUILD_ID, ADMIN_ID, LOG_CHANNEL_ID, KURAL_KANAL_ID, ACIL_DURUM_SIFRE, acilDurum, ayarlar, saveAyarlar, appendUserLog, loadUserLog, saveUserLog, getUserAktiflik, saveAktiflik, getUserWarns, saveWarns, warns, ATATURK_IMAGE, ATATURK_SOZLER, ATATURK_BILGI, RESIM_KLASORU, VIDEO_PATH, ISTIKLAL_PATH, ffmpegPath, audioSettings, playVideoWithAudio, playIstiklal, playCustomSound, playJumpscare, returnToFixedChannel, getMeemFiles, JUMPSCARE_COOLDOWN, JUMPSCARE_FILES) => {

    // =========================== APO SAYACI ===========================
    let apoCount = loadApoCount();

    // =========================== YETKİ KONTROLÜ ===========================
    const ADMIN_ONLY_COMMANDS = [
        'temizle', 'sil', 'kick', 'ban', 'unban',
        'duyuru', 'oylama', 'embed',
        'yedek', 'ayar', 'debug',
        'uyar', 'sustur', 'susturma-kaldır', 'slowmode', 'kanal-kilit', 'kanal-aç'
    ];

    // =========================== FIKRA VE ESPRİ ===========================
    const FIKRALAR = [
        "Temel ile Dursun bir gün ava çıkmışlar. Temel bir kuş vurmuş, Dursun 'Bu ne?' demiş. Temel 'Kuş' demiş. Dursun 'Yok canım, bu kartal' demiş. Temel 'Ula kartal olsa kanadı olurdu' demiş.",
        "Adamın biri doktora gitmiş: 'Doktor, bacağımı kaldırınca acıyor.' Doktor: 'Kaldırma o zaman.'",
        "İki matematikçi bir restorana girmiş. Garson: 'Ne alırsınız?' Matematikçiler: 'Pi.' Garson: 'Kaç tane?' Matematikçiler: '3.14159...'",
        "Neden bilgisayarlar denize giremez? Çünkü Windows açık kalır.",
        "Bir programcı, eşine 'Markete git, bir ekmek al; eğer yumurta varsa 6 tane al' demiş. Eşi markete gitmiş, yumurta olduğunu görünce 6 ekmek almış.",
        "Adam iş görüşmesine gitmiş. Mülakatçı: 'Bize kendinizden bahsedin.' Adam: 'Kendimden bahsetmeyi sevmem.' Mülakatçı: 'Peki, neden?' Adam: 'Çünkü kendimden bahsetmeyi sevmem.'",
        "Doktor: 'Hastam, size kötü haberim var. Kanseriniz var.' Hasta: 'Ama doktor, ben kanser değilim, sadece başım ağrıyor.' Doktor: 'Evet, baş ağrısı da kanserin ilk belirtisidir.'",
        "Bir gün bir atom, diğerine 'Elektronumu kaybettim' demiş. Diğeri: 'Emin misin?' Atom: 'Evet, pozitifim.'",
        "Neden İsveç'te evlerin pencereleri yok? Çünkü İsveç'te her şey açık.",
        "Bir adam eczaneye girmiş ve 'Aspirin var mı?' diye sormuş. Eczacı: 'Baş ağrısı için mi?' Adam: 'Yok, karım için. Onu içeri sokamadım.'"
    ];

    const ESPRILER = [
        "Neden bilgisayarlar hasta olmaz? Çünkü byte yiyorlar!",
        "Neden matematikçiler kötü komedyen? Çünkü şakaları kuru!",
        "Neden programcılar karanlıktan korkar? Çünkü çok fazla bug var!",
        "Neden balıklar okula gitmez? Çünkü zaten okulda yüzerler!",
        "Neden kediler bilgisayar kullanmaz? Çünkü fareyi kovalarlar!",
        "Neden aynalar asla yalan söylemez? Çünkü yansıtırlar!",
        "Neden kitaplar asla yalnız hissetmez? Çünkü onların çok sayfası var!",
        "Neden bilgisayar denize giremez? Çünkü Windows açık kalır!",
        "Neden programcılar kahve içer? Çünkü Java onları uyanık tutar!",
        "Neden matematik kitabı üzgündü? Çünkü çok problemi vardı!"
    ];

    // =========================== ARGO SÖZLÜK ===========================
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
        { k: 'Gözüne girmek', a: 'Sevgisini kazanmak' },
        { k: 'Göze almak', a: 'Tehlikeyi kabul etmek' },
        { k: 'Hapı yutmak', a: 'Kötü duruma düşmek' },
        { k: 'İpe un sermek', a: 'Bahane uydurmak' },
        { k: 'Kılını bile kıpırdatmamak', a: 'Hiç aldırış etmemek' },
        { k: 'Kulağına küpe olmak', a: 'Ders almak' },
        { k: 'Lafı ağzına tıkamak', a: 'Sözünü kesmek' },
        { k: 'Mumla aramak', a: 'Çok aramak' },
        { k: 'Nal toplamak', a: 'Yenilmek' },
        { k: 'Parmak basmak', a: 'Önem vermek' },
        { k: 'Rüzgar ekmek, fırtına biçmek', a: 'Kötülük yapıp kötülük bulmak' },
        { k: 'Saman altından su yürütmek', a: 'Gizli iş çevirmek' },
        { k: 'Şeytana uymak', a: 'Kötü bir iş yapmak' },
        { k: 'Tavşana kaç, tazıya tut demek', a: 'İki taraflı oynamak' },
        { k: 'Ulu orta konuşmak', a: 'Herkesin önünde konuşmak' },
        { k: 'Vur deyince öldürmek', a: 'Aşırıya kaçmak' },
        { k: 'Yelkenleri suya indirmek', a: 'Boyun eğmek' },
        { k: 'Zıvanadan çıkmak', a: 'Çok sinirlenmek' },
        { k: 'Aba altından değnek göstermek', a: 'Üstü kapalı tehdit etmek' },
        { k: 'Baltayı taşa vurmak', a: 'Hata yapmak' },
        { k: 'Cambazlık yapmak', a: 'Zor işler başarmak' },
        { k: 'Çenesi düşmek', a: 'Çok konuşmak' },
        { k: 'Dili bir karış dışarı çıkmak', a: 'Çok yorulmak' },
        { k: 'Eli kulağında olmak', a: 'Çok yakında olmak' },
        { k: 'Foyası meydana çıkmak', a: 'Gerçek yüzü ortaya çıkmak' },
        { k: 'Gözden çıkarmak', a: 'Vazgeçmek' },
        { k: 'Havanda su dövmek', a: 'Boşuna uğraşmak' },
        { k: 'İki ayağı bir pabuca sokmak', a: 'Çok sıkışmak' },
        { k: 'Kafayı üşütmek', a: 'Delirmek' },
        { k: 'Lafını balla kestim', a: 'Sözünü kestim' },
        { k: 'Midesi bulanmak', a: 'İğrenmek' },
        { k: 'Nabzını yoklamak', a: 'Düşüncesini öğrenmek' },
        { k: 'Pireyi deve yapmak', a: 'Küçük şeyi büyütmek' },
        { k: 'Rencide olmak', a: 'Kırılmak' },
        { k: 'Sözünü bilmek', a: 'Terbiyeli konuşmak' },
        { k: 'Şirazesi kaymak', a: 'Dengesi bozulmak' },
        { k: 'Tepesi atmak', a: 'Çok sinirlenmek' },
        { k: 'Uçkuruna düşkün olmak', a: 'Zevkine düşkün olmak' },
        { k: 'Vakit öldürmek', a: 'Boşuna zaman geçirmek' },
        { k: 'Yağma yok', a: 'İmkansız' },
        { k: 'Zokayı yutmak', a: 'Tuzağa düşmek' }
    ];

    // =========================== TRIVIA SORULARI (KİM MİLYONER) ===========================
    const TRIVIA_SORULARI = [
        // ============================ TARİH - KOLAY ============================
        { soru: "Türkiye Cumhuriyeti hangi yıl kurulmuştur?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 3, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "İstanbul hangi yıl fethedilmiştir?", secenekler: ["1451", "1452", "1453", "1454"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Kurtuluş Savaşı hangi yıl başlamıştır?", secenekler: ["1918", "1919", "1920", "1921"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "TBMM hangi yıl açılmıştır?", secenekler: ["1919", "1920", "1921", "1922"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nin kurucusu kimdir?", secenekler: ["Osman Bey", "Orhan Bey", "I. Murat", "Yıldırım Bayezid"], dogru: 0, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Mustafa Kemal Atatürk hangi yıl doğmuştur?", secenekler: ["1876", "1881", "1885", "1890"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Çanakkale Zaferi hangi yıl kazanılmıştır?", secenekler: ["1914", "1915", "1916", "1917"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Cumhuriyet'in ilk cumhurbaşkanı kimdir?", secenekler: ["İsmet İnönü", "Fevzi Çakmak", "Mustafa Kemal Atatürk", "Celal Bayar"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Atatürk hangi yıl vefat etmiştir?", secenekler: ["1936", "1937", "1938", "1939"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Türkiye'nin ilk kadın pilotu kimdir?", secenekler: ["Sabiha Gökçen", "Bedriye Tahir", "Nezihe Muhiddin", "Halide Edip"], dogru: 0, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Ankara hangi yıl başkent olmuştur?", secenekler: ["1920", "1921", "1923", "1924"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "İlk Türkçe gazete hangisidir?", secenekler: ["Takvim-i Vekayi", "Tercüman-ı Ahval", "Ceride-i Havadis", "Hürriyet"], dogru: 0, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Saltanat hangi yıl kaldırılmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Kurtuluş Savaşı hangi antlaşma ile sona ermiştir?", secenekler: ["Mondros", "Mudanya", "Lozan", "Sevr"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Türkiye NATO'ya hangi yıl üye olmuştur?", secenekler: ["1950", "1951", "1952", "1955"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Atatürk'ün soyadı hangi yıl verilmiştir?", secenekler: ["1930", "1932", "1934", "1936"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "İlk Türk kadın milletvekili kimdir?", secenekler: ["Sabiha Gökçen", "Halide Edip", "Satı Kadın", "Nezihe Muhiddin"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Fatih Sultan Mehmet kaç yaşında tahta çıkmıştır?", secenekler: ["12", "19", "21", "25"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Türkiye Cumhuriyeti'nin ilk başbakanı kimdir?", secenekler: ["Fevzi Çakmak", "İsmet İnönü", "Celal Bayar", "Adnan Menderes"], dogru: 1, zorluk: "Kolay", kategori: "Tarih" },
        { soru: "Osmanlı Devleti kaç yıl hüküm sürmüştür?", secenekler: ["500", "600", "623", "700"], dogru: 2, zorluk: "Kolay", kategori: "Tarih" },

        // ============================ TARİH - ORTA ============================
        { soru: "Malazgirt Savaşı hangi yıl yapılmıştır?", secenekler: ["1048", "1071", "1176", "1243"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Lozan Barış Antlaşması hangi yıl imzalanmıştır?", secenekler: ["1921", "1922", "1923", "1924"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Fatih Sultan Mehmet'in babası kimdir?", secenekler: ["I. Murat", "II. Murat", "Yıldırım Bayezid", "Çelebi Mehmet"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Yavuz Sultan Selim hangi seferiyle halifeliği Osmanlı'ya getirmiştir?", secenekler: ["Çaldıran Seferi", "Mısır Seferi", "Irakeyn Seferi", "Belgrad Seferi"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Fransız İhtilali hangi yıl başlamıştır?", secenekler: ["1776", "1789", "1799", "1804"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Birinci Dünya Savaşı hangi yıllar arasında olmuştur?", secenekler: ["1912-1916", "1913-1917", "1914-1918", "1915-1919"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "İkinci Dünya Savaşı hangi yıllar arasında olmuştur?", secenekler: ["1937-1943", "1938-1944", "1939-1945", "1940-1946"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Roma İmparatorluğu hangi yıl kurulmuştur?", secenekler: ["MÖ 753", "MÖ 509", "MÖ 330", "MÖ 27"], dogru: 0, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Kavimler Göçü hangi yıl başlamıştır?", secenekler: ["375", "395", "476", "535"], dogru: 0, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Kanuni Sultan Süleyman kaç yıl tahtta kalmıştır?", secenekler: ["36", "40", "46", "50"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Amerika hangi yıl keşfedilmiştir?", secenekler: ["1453", "1492", "1517", "1520"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Berlin Duvarı hangi yıl yıkılmıştır?", secenekler: ["1985", "1987", "1989", "1991"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Sovyetler Birliği hangi yıl dağılmıştır?", secenekler: ["1989", "1990", "1991", "1992"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Mısır piramitleri hangi uygarlığa aittir?", secenekler: ["Sümerler", "Mısırlılar", "Hititler", "Persler"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Rönesans hangi ülkede başlamıştır?", secenekler: ["Fransa", "Almanya", "İtalya", "İngiltere"], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Reform hareketini başlatan kimdir?", secenekler: ["Martin Luther", "Calvin", "Henry VIII", "Papa"], dogru: 0, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Coğrafi Keşifler hangi yüzyılda başlamıştır?", secenekler: ["13.", "14.", "15.", "16."], dogru: 2, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Sanayi Devrimi hangi ülkede başlamıştır?", secenekler: ["Fransa", "İngiltere", "Almanya", "ABD"], dogru: 1, zorluk: "Orta", kategori: "Tarih" },
        { soru: "Osmanlı'da Tanzimat Fermanı hangi yıl ilan edilmiştir?", secenekler: ["1839", "1856", "1876", "1908"], dogru: 0, zorluk: "Orta", kategori: "Tarih" },
        { soru: "I. Meşrutiyet hangi yıl ilan edilmiştir?", secenekler: ["1876", "1878", "1908", "1909"], dogru: 0, zorluk: "Orta", kategori: "Tarih" },

        // ============================ TARİH - ZOR ============================
        { soru: "Sakarya Savaşı hangi yıl yapılmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Büyük Taarruz hangi yıl başlamıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 2, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Halifelik hangi yıl kaldırılmıştır?", secenekler: ["1922", "1923", "1924", "1925"], dogru: 2, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Soyadı Kanunu hangi yıl çıkarılmıştır?", secenekler: ["1928", "1930", "1934", "1938"], dogru: 2, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Türk kadınlarına milletvekili seçme ve seçilme hakkı hangi yıl verilmiştir?", secenekler: ["1926", "1930", "1933", "1934"], dogru: 3, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Mondros Ateşkes Antlaşması hangi yıl imzalanmıştır?", secenekler: ["1917", "1918", "1919", "1920"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Amasya Genelgesi hangi yıl yayınlanmıştır?", secenekler: ["1918", "1919", "1920", "1921"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Sivas Kongresi hangi yıl toplanmıştır?", secenekler: ["1918", "1919", "1920", "1921"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Erzurum Kongresi hangi yıl toplanmıştır?", secenekler: ["1918", "1919", "1920", "1921"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Mudanya Ateşkes Antlaşması hangi yıl imzalanmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 2, zorluk: "Zor", kategori: "Tarih" },
        { soru: "İzmir hangi tarihte kurtarılmıştır?", secenekler: ["9 Eylül 1921", "9 Eylül 1922", "26 Ağustos 1922", "18 Eylül 1922"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Kütahya-Eskişehir Savaşları hangi yıl yapılmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "I. İnönü Savaşı hangi yıl yapılmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "II. İnönü Savaşı hangi yıl yapılmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Kars Antlaşması hangi yıl imzalanmıştır?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Ankara Antlaşması hangi ülke ile imzalanmıştır?", secenekler: ["İngiltere", "Fransa", "İtalya", "Yunanistan"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Moskova Antlaşması hangi ülke ile imzalanmıştır?", secenekler: ["Almanya", "Rusya", "Fransa", "İngiltere"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Tekalif-i Milliye Emirleri hangi savaş öncesi yayınlanmıştır?", secenekler: ["I. İnönü", "II. İnönü", "Sakarya", "Büyük Taarruz"], dogru: 2, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Osmanlı'da ilk anayasa hangisidir?", secenekler: ["Kanun-i Esasi", "Tanzimat", "Islahat", "Sened-i İttifak"], dogru: 0, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Sened-i İttifak hangi padişah döneminde imzalanmıştır?", secenekler: ["II. Mahmut", "III. Selim", "I. Abdülhamid", "IV. Murat"], dogru: 0, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Yeniçeri Ocağı hangi yıl kaldırılmıştır?", secenekler: ["1808", "1826", "1839", "1876"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Tanzimat Fermanı hangi padişah döneminde ilan edilmiştir?", secenekler: ["II. Mahmut", "Abdülmecid", "Abdülaziz", "II. Abdülhamid"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },
        { soru: "I. Dünya Savaşı'nda Osmanlı hangi cephede savaşmamıştır?", secenekler: ["Kafkas", "Kanal", "Galiçya", "Batı"], dogru: 3, zorluk: "Zor", kategori: "Tarih" },
        { soru: "Çanakkale Savaşı'nda Osmanlı'nın komutanı kimdir?", secenekler: ["Enver Paşa", "Mustafa Kemal", "Cemal Paşa", "Fevzi Paşa"], dogru: 1, zorluk: "Zor", kategori: "Tarih" },

        // ============================ TARİH - EKSTRA ZOR ============================
        { soru: "Anadolu'da kurulan ilk Türk beyliklerinden biri hangisidir?", secenekler: ["Danişmentliler", "Karamanoğulları", "Osmanoğulları", "Akkoyunlular"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde ilk kağıt para hangi padişah döneminde basılmıştır?", secenekler: ["II. Mahmut", "Abdülmecid", "Abdülaziz", "II. Abdülhamid"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "İlk Türk denizcisi kimdir?", secenekler: ["Turgut Reis", "Barbaros Hayrettin", "Çaka Bey", "Piri Reis"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nin son padişahı kimdir?", secenekler: ["V. Mehmed", "VI. Mehmed (Vahdettin)", "II. Abdülhamid", "V. Murat"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Orhun Yazıtları hangi Türk devletine aittir?", secenekler: ["Uygurlar", "Göktürkler", "Hunlar", "Avarlar"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Uygurlar hangi dini resmen kabul etmiştir?", secenekler: ["Budizm", "Mani dini", "Hristiyanlık", "İslamiyet"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Talas Savaşı hangi yıl yapılmıştır?", secenekler: ["751", "752", "840", "1048"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Anadolu Selçuklu Devleti'nin kurucusu kimdir?", secenekler: ["Alparslan", "Süleyman Şah", "Kılıçarslan", "Tuğrul Bey"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nin ilk başkenti neresidir?", secenekler: ["Bursa", "Söğüt", "İznik", "Edirne"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "İlk Osmanlı padişahı hangisidir?", secenekler: ["Orhan Bey", "Osman Bey", "I. Murat", "Yıldırım Bayezid"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Anadolu Selçuklu Devleti hangi savaştan sonra yıkılmıştır?", secenekler: ["Malazgirt", "Miryokefalon", "Kösedağ", "Ankara"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde ilk matbaa hangi padişah döneminde kurulmuştur?", secenekler: ["II. Mahmut", "III. Ahmet", "I. Mahmut", "III. Selim"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde ilk nüfus sayımı hangi padişah döneminde yapılmıştır?", secenekler: ["II. Mahmut", "Abdülmecid", "II. Abdülhamid", "III. Selim"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Lale Devri hangi padişah döneminde yaşanmıştır?", secenekler: ["III. Ahmet", "IV. Murat", "II. Mustafa", "I. Mahmut"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde 'Köprülüler Devri' hangi padişah döneminde başlamıştır?", secenekler: ["IV. Mehmet", "II. Mustafa", "III. Ahmet", "I. Mahmut"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Kutsal Roma Germen İmparatorluğu hangi yıl kurulmuştur?", secenekler: ["800", "962", "1000", "1071"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Magna Carta hangi yıl imzalanmıştır?", secenekler: ["1215", "1250", "1300", "1350"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Yüz Yıl Savaşı hangi iki ülke arasında yapılmıştır?", secenekler: ["İngiltere-Fransa", "İngiltere-İspanya", "Fransa-Almanya", "İtalya-İspanya"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "İstanbul'un fethi sırasında Bizans İmparatoru kimdir?", secenekler: ["Konstantin XI", "Justinian", "Theodosius", "Herakleios"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde 'Çelebi' unvanı kime verilirdi?", secenekler: ["Şehzadelere", "Sadrazamlara", "Yeniçerilere", "Kadılara"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Yeniçeri Ocağı hangi padişah tarafından kurulmuştur?", secenekler: ["Osman Bey", "Orhan Bey", "I. Murat", "Yıldırım Bayezid"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde ilk divan hangi padişah döneminde kurulmuştur?", secenekler: ["Osman Bey", "Orhan Bey", "I. Murat", "Yıldırım Bayezid"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Tarih" },
        { soru: "Osmanlı Devleti'nde 'Kapıkulu Ocakları' hangi padişah döneminde kurulmuştur?", secenekler: ["Osman Bey", "Orhan Bey", "I. Murat", "Yıldırım Bayezid"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Tarih" },

        // ============================ TARİH - EFSANE ============================
        { soru: "İlk Türk-İslam devleti hangisidir?", secenekler: ["Gazneliler", "Karahanlılar", "Büyük Selçuklular", "Tolunoğulları"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Kadeş Antlaşması hangi iki devlet arasında imzalanmıştır?", secenekler: ["Hitit-Mısır", "Sümer-Akad", "Roma-Kartaca", "Pers-Yunan"], dogru: 0, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Yazının icadı hangi uygarlığa aittir?", secenekler: ["Mısırlılar", "Sümerler", "Hititler", "Babilliler"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "İlk yazılı antlaşma hangisidir?", secenekler: ["Kadeş", "Mısır-Sümer", "Roma-Kartaca", "Pers-Yunan"], dogru: 0, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte bilinen ilk imparatorluk hangisidir?", secenekler: ["Roma", "Akkad", "Mısır", "Pers"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte bilinen ilk yazılı kanunlar kime aittir?", secenekler: ["Hammurabi", "Urgakina", "Solon", "Justinian"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Hammurabi Kanunları hangi uygarlığa aittir?", secenekler: ["Sümerler", "Babilliler", "Hititler", "Asurlular"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk güneş takvimini bulan uygarlık hangisidir?", secenekler: ["Sümerler", "Mısırlılar", "Hititler", "Babilliler"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk ay takvimini bulan uygarlık hangisidir?", secenekler: ["Sümerler", "Mısırlılar", "Hititler", "Babilliler"], dogru: 0, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte parayı ilk kez kim kullanmıştır?", secenekler: ["Sümerler", "Lidyalılar", "Mısırlılar", "Yunanlılar"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte alfabeyi ilk kez kim kullanmıştır?", secenekler: ["Sümerler", "Fenikeliler", "Mısırlılar", "Yunanlılar"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk kütüphane hangi uygarlığa aittir?", secenekler: ["Sümerler", "Asurlular", "Mısırlılar", "Yunanlılar"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk olimpiyatlar hangi ülkede yapılmıştır?", secenekler: ["Roma", "Yunanistan", "Mısır", "Pers"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk demokrasi hangi ülkede ortaya çıkmıştır?", secenekler: ["Roma", "Atina", "Sparta", "Mısır"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk cumhuriyet hangi devlette kurulmuştur?", secenekler: ["Atina", "Roma", "Sparta", "Kartaca"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk yazılı destan hangisidir?", secenekler: ["İlyada", "Gılgamış", "Odisseia", "Şehname"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Gılgamış Destanı hangi uygarlığa aittir?", secenekler: ["Sümerler", "Mısırlılar", "Yunanlılar", "Persler"], dogru: 0, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk yazılı barış antlaşması hangisidir?", secenekler: ["Kadeş", "Verdun", "Westphalia", "Mondros"], dogru: 0, zorluk: "Efsane", kategori: "Tarih" },
        { soru: "Tarihte ilk yazılı anayasa hangisidir?", secenekler: ["Magna Carta", "ABD Anayasası", "Fransa Anayasası", "Kanun-i Esasi"], dogru: 1, zorluk: "Efsane", kategori: "Tarih" },

        // ============================ EDEBİYAT - KOLAY ============================
        { soru: "İstiklal Marşı'nın yazarı kimdir?", secenekler: ["Mehmet Akif Ersoy", "Yahya Kemal", "Nazım Hikmet", "Orhan Veli"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "İstiklal Marşı hangi yıl kabul edilmiştir?", secenekler: ["1920", "1921", "1922", "1923"], dogru: 1, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Kürk Mantolu Madonna'nın yazarı kimdir?", secenekler: ["Sabahattin Ali", "Yaşar Kemal", "Peyami Safa", "Orhan Kemal"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "İnce Memed'in yazarı kimdir?", secenekler: ["Yaşar Kemal", "Orhan Kemal", "Kemal Tahir", "Sabahattin Ali"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk Nobel Ödülü'nü kazanan kimdir?", secenekler: ["Aziz Sancar", "Orhan Pamuk", "Yaşar Kemal", "Nazım Hikmet"], dogru: 1, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Don Kişot'un yazarı kimdir?", secenekler: ["Cervantes", "Shakespeare", "Dante", "Goethe"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Romeo ve Juliet'in yazarı kimdir?", secenekler: ["Shakespeare", "Cervantes", "Victor Hugo", "Tolstoy"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Sefiller'in yazarı kimdir?", secenekler: ["Victor Hugo", "Balzac", "Flaubert", "Zola"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Suç ve Ceza'nın yazarı kimdir?", secenekler: ["Tolstoy", "Dostoyevski", "Gogol", "Turgenyev"], dogru: 1, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "1984 romanının yazarı kimdir?", secenekler: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Küçük Prens'in yazarı kimdir?", secenekler: ["Antoine de Saint-Exupéry", "Victor Hugo", "Jules Verne", "Camus"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Harry Potter'ın yazarı kimdir?", secenekler: ["J.K. Rowling", "Tolkien", "C.S. Lewis", "Roald Dahl"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Yüzüklerin Efendisi'nin yazarı kimdir?", secenekler: ["J.R.R. Tolkien", "C.S. Lewis", "J.K. Rowling", "George R.R. Martin"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Sherlock Holmes'un yaratıcısı kimdir?", secenekler: ["Arthur Conan Doyle", "Agatha Christie", "Edgar Allan Poe", "Charles Dickens"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Nutuk'u kim yazmıştır?", secenekler: ["Mustafa Kemal Atatürk", "İsmet İnönü", "Fevzi Çakmak", "Kazım Karabekir"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Çalıkuşu'nun yazarı kimdir?", secenekler: ["Reşat Nuri Güntekin", "Halide Edip", "Yakup Kadri", "Peyami Safa"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Aşk-ı Memnu'nun yazarı kimdir?", secenekler: ["Halit Ziya Uşaklıgil", "Mehmet Rauf", "Hüseyin Rahmi", "Yakup Kadri"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Mai ve Siyah'ın yazarı kimdir?", secenekler: ["Halit Ziya Uşaklıgil", "Mehmet Rauf", "Hüseyin Cahit", "Ahmet Hikmet"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Tutunamayanlar'ın yazarı kimdir?", secenekler: ["Oğuz Atay", "Orhan Pamuk", "Ahmet Hamdi Tanpınar", "Yusuf Atılgan"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },
        { soru: "Huzur romanının yazarı kimdir?", secenekler: ["Ahmet Hamdi Tanpınar", "Peyami Safa", "Yakup Kadri", "Halide Edip"], dogru: 0, zorluk: "Kolay", kategori: "Edebiyat" },

        // ============================ EDEBİYAT - ORTA ============================
        { soru: "Araba Sevdası'nın yazarı kimdir?", secenekler: ["Namık Kemal", "Recaizade Mahmut Ekrem", "Ahmet Mithat", "Şemsettin Sami"], dogru: 1, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "İntibah'ın yazarı kimdir?", secenekler: ["Namık Kemal", "Recaizade Mahmut Ekrem", "Halit Ziya", "Ahmet Mithat"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Savaş ve Barış'ın yazarı kimdir?", secenekler: ["Tolstoy", "Dostoyevski", "Turgenyev", "Gogol"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Yüzyıllık Yalnızlık'ın yazarı kimdir?", secenekler: ["Gabriel Garcia Marquez", "Jorge Luis Borges", "Pablo Neruda", "Isabel Allende"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Dönüşüm (Değişim) eserinin yazarı kimdir?", secenekler: ["Franz Kafka", "Albert Camus", "Jean-Paul Sartre", "Hermann Hesse"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "İlahi Komedya'nın yazarı kimdir?", secenekler: ["Dante", "Petrarca", "Boccaccio", "Virgilius"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Faust'un yazarı kimdir?", secenekler: ["Goethe", "Schiller", "Kant", "Nietzsche"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Yaban romanının yazarı kimdir?", secenekler: ["Yakup Kadri", "Peyami Safa", "Reşat Nuri", "Halide Edip"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Ateşten Gömlek'in yazarı kimdir?", secenekler: ["Halide Edip Adıvar", "Yakup Kadri", "Reşat Nuri", "Peyami Safa"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Kuyucaklı Yusuf'un yazarı kimdir?", secenekler: ["Sabahattin Ali", "Yaşar Kemal", "Orhan Kemal", "Kemal Tahir"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Dokuzuncu Hariciye Koğuşu'nun yazarı kimdir?", secenekler: ["Peyami Safa", "Ahmet Hamdi Tanpınar", "Yakup Kadri", "Reşat Nuri"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Fatih Harbiye'nin yazarı kimdir?", secenekler: ["Peyami Safa", "Yakup Kadri", "Reşat Nuri", "Halide Edip"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Saatleri Ayarlama Enstitüsü'nün yazarı kimdir?", secenekler: ["Ahmet Hamdi Tanpınar", "Oğuz Atay", "Orhan Pamuk", "Yusuf Atılgan"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Benim Adım Kırmızı'nın yazarı kimdir?", secenekler: ["Orhan Pamuk", "Oğuz Atay", "Ahmet Hamdi", "Yusuf Atılgan"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Kar romanının yazarı kimdir?", secenekler: ["Orhan Pamuk", "Oğuz Atay", "Ahmet Hamdi", "Yaşar Kemal"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Yaprak Dökümü'nün yazarı kimdir?", secenekler: ["Reşat Nuri Güntekin", "Halide Edip", "Yakup Kadri", "Peyami Safa"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Acımak romanının yazarı kimdir?", secenekler: ["Reşat Nuri Güntekin", "Halide Edip", "Yakup Kadri", "Peyami Safa"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Bereketli Topraklar Üzerinde'nin yazarı kimdir?", secenekler: ["Orhan Kemal", "Yaşar Kemal", "Kemal Tahir", "Sabahattin Ali"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Devlet Ana'nın yazarı kimdir?", secenekler: ["Kemal Tahir", "Orhan Kemal", "Yaşar Kemal", "Tarık Buğra"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },
        { soru: "Küçük Ağa'nın yazarı kimdir?", secenekler: ["Tarık Buğra", "Kemal Tahir", "Yakup Kadri", "Peyami Safa"], dogru: 0, zorluk: "Orta", kategori: "Edebiyat" },

        // ============================ EDEBİYAT - ZOR ============================
        { soru: "İlk Türkçe roman hangisidir?", secenekler: ["Telemak", "Taaşşuk-ı Talat ve Fitnat", "İntibah", "Araba Sevdası"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "İlk Türk kadın romancı kimdir?", secenekler: ["Halide Edip", "Fatma Aliye", "Nezihe Muhiddin", "Emine Semiye"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Kutadgu Bilig'in yazarı kimdir?", secenekler: ["Kaşgarlı Mahmut", "Yusuf Has Hacip", "Edip Ahmet", "Ahmet Yesevi"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Divanü Lugati't-Türk'ün yazarı kimdir?", secenekler: ["Yusuf Has Hacip", "Kaşgarlı Mahmut", "Edip Ahmet", "Ahmet Yesevi"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Mesnevi'nin yazarı kimdir?", secenekler: ["Yunus Emre", "Mevlana", "Hacı Bektaş Veli", "Ahmet Yesevi"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Hüsn ü Aşk'ın yazarı kimdir?", secenekler: ["Fuzuli", "Şeyh Galip", "Nedim", "Baki"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Leyla ile Mecnun mesnevisinin yazarı kimdir?", secenekler: ["Fuzuli", "Şeyh Galip", "Nedim", "Nef'i"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Garip akımının öncüsü kimdir?", secenekler: ["Orhan Veli Kanık", "Cahit Sıtkı Tarancı", "Ahmet Haşim", "Yahya Kemal"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Memleketimden İnsan Manzaraları'nın yazarı kimdir?", secenekler: ["Nazım Hikmet", "Orhan Veli", "Cemal Süreya", "Attila İlhan"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Matmazel Noraliya'nın Koltuğu'nun yazarı kimdir?", secenekler: ["Peyami Safa", "Ahmet Hamdi Tanpınar", "Yakup Kadri", "Hüseyin Rahmi"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Aşk-ı Memnu'nun başkarakteri kimdir?", secenekler: ["Bihter", "Nihal", "Feride", "Rabia"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Sinekli Bakkal'ın başkarakteri kimdir?", secenekler: ["Rabia", "Feride", "Bihter", "Nihal"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Anayurt Oteli'nin yazarı kimdir?", secenekler: ["Yusuf Atılgan", "Oğuz Atay", "Ahmet Hamdi", "Orhan Pamuk"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Aylak Adam'ın yazarı kimdir?", secenekler: ["Yusuf Atılgan", "Oğuz Atay", "Ahmet Hamdi", "Orhan Pamuk"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Orhan Pamuk hangi yıl Nobel kazanmıştır?", secenekler: ["2004", "2005", "2006", "2007"], dogru: 2, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Aziz Sancar hangi yıl Nobel kazanmıştır?", secenekler: ["2013", "2014", "2015", "2016"], dogru: 2, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Manas Destanı hangi Türk boyuna aittir?", secenekler: ["Kırgız", "Kazak", "Özbek", "Türkmen"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Oğuz Kağan Destanı hangi Türk devletine aittir?", secenekler: ["Hunlar", "Göktürkler", "Uygurlar", "Selçuklular"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Dede Korkut Kitabı'nda kaç boy vardır?", secenekler: ["10", "12", "14", "16"], dogru: 1, zorluk: "Zor", kategori: "Edebiyat" },
        { soru: "Safahat'ın yazarı kimdir?", secenekler: ["Mehmet Akif Ersoy", "Tevfik Fikret", "Yahya Kemal", "Ziya Gökalp"], dogru: 0, zorluk: "Zor", kategori: "Edebiyat" },

        // ============================ EDEBİYAT - EKSTRA ZOR ============================
        { soru: "Atabetü'l Hakayık'ın yazarı kimdir?", secenekler: ["Edip Ahmet Yükneki", "Yusuf Has Hacip", "Kaşgarlı Mahmut", "Ahmet Yesevi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Divan-ı Hikmet'in yazarı kimdir?", secenekler: ["Ahmet Yesevi", "Yunus Emre", "Mevlana", "Hacı Bektaş Veli"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk psikolojik roman hangisidir?", secenekler: ["Eylül", "İntibah", "Araba Sevdası", "Aşk-ı Memnu"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Eylül romanının yazarı kimdir?", secenekler: ["Mehmet Rauf", "Halit Ziya", "Hüseyin Rahmi", "Yakup Kadri"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "İlk realist Türk romanı hangisidir?", secenekler: ["Araba Sevdası", "İntibah", "Eylül", "Taaşşuk-ı Talat ve Fitnat"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatının ilk edebi romanı hangisidir?", secenekler: ["İntibah", "Taaşşuk-ı Talat ve Fitnat", "Araba Sevdası", "Eylül"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Sinekli Bakkal'ın yazarı kimdir?", secenekler: ["Halide Edip Adıvar", "Yakup Kadri", "Peyami Safa", "Reşat Nuri"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "İlk köy romanı hangisidir?", secenekler: ["Karabibik", "İnce Memed", "Yaban", "Küçük Ağa"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Karabibik'in yazarı kimdir?", secenekler: ["Nabizade Nazım", "Namık Kemal", "Ahmet Mithat", "Recaizade"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk mesnevi hangisidir?", secenekler: ["Kutadgu Bilig", "Divanü Lugati't-Türk", "Atabetü'l Hakayık", "Divan-ı Hikmet"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Servet-i Fünun edebiyatının en önemli şairi kimdir?", secenekler: ["Tevfik Fikret", "Mehmet Akif", "Yahya Kemal", "Ahmet Haşim"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Fecr-i Ati edebiyatının kurucusu kimdir?", secenekler: ["Faik Ali Ozansoy", "Ahmet Haşim", "Yakup Kadri", "Refik Halit"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Milli Edebiyat akımının öncüsü kimdir?", secenekler: ["Ziya Gökalp", "Mehmet Akif", "Yahya Kemal", "Ömer Seyfettin"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Genç Kalemler dergisinin kurucusu kimdir?", secenekler: ["Ömer Seyfettin", "Ziya Gökalp", "Ali Canip", "Hepsi"], dogru: 3, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk hikaye kitabı hangisidir?", secenekler: ["Letâif-i Rivayat", "Küçük Şeyler", "Yüksek Ökçeler", "Bahar ve Kelebekler"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Küçük Şeyler'in yazarı kimdir?", secenekler: ["Samipaşazade Sezai", "Nabizade Nazım", "Ahmet Mithat", "Recaizade"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk şiir çevirisi kime aittir?", secenekler: ["Şinasi", "Namık Kemal", "Ziya Paşa", "Ahmet Mithat"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "İlk Türkçe sözlük hangisidir?", secenekler: ["Divanü Lugati't-Türk", "Kamus-ı Türki", "Lehçe-i Osmani", "Sözlük"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Kamus-ı Türki'nin yazarı kimdir?", secenekler: ["Şemsettin Sami", "Ahmet Vefik Paşa", "Sami Frashëri", "Hepsi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },
        { soru: "Türk edebiyatında ilk roman çevirisi hangisidir?", secenekler: ["Telemak", "Robinson Crusoe", "Sefiller", "Don Kişot"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Edebiyat" },

        // ============================ COĞRAFYA - KOLAY ============================
        { soru: "Türkiye'nin başkenti neresidir?", secenekler: ["İstanbul", "Ankara", "İzmir", "Bursa"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en kalabalık şehri hangisidir?", secenekler: ["Ankara", "İzmir", "İstanbul", "Bursa"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en yüksek dağı hangisidir?", secenekler: ["Uludağ", "Ağrı Dağı", "Erciyes", "Kaçkar"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en yüksek dağı hangisidir?", secenekler: ["K2", "Everest", "Lhotse", "Makalu"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en uzun nehri hangisidir?", secenekler: ["Amazon", "Nil", "Yangtze", "Mississippi"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük okyanusu hangisidir?", secenekler: ["Atlantik", "Hint", "Pasifik", "Arktik"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük gölü hangisidir?", secenekler: ["Tuz Gölü", "Van Gölü", "Beyşehir", "Eğirdir"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük adası hangisidir?", secenekler: ["Madagaskar", "Grönland", "Borneo", "Yeni Gine"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye kaç coğrafi bölgeye ayrılmıştır?", secenekler: ["5", "6", "7", "8"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye'de kaç il vardır?", secenekler: ["67", "76", "81", "85"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük kıtası hangisidir?", secenekler: ["Afrika", "Asya", "Avrupa", "Amerika"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en küçük kıtası hangisidir?", secenekler: ["Avustralya", "Avrupa", "Antarktika", "Güney Amerika"], dogru: 0, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük ülkesi hangisidir?", secenekler: ["Rusya", "Kanada", "Çin", "ABD"], dogru: 0, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en kalabalık ülkesi hangisidir?", secenekler: ["Çin", "Hindistan", "ABD", "Endonezya"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük çölü hangisidir?", secenekler: ["Gobi", "Sahara", "Kalahari", "Atacama"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye hangi kıtadadır?", secenekler: ["Asya", "Avrupa", "Her ikisi", "Afrika"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "İstanbul hangi boğazın kenarındadır?", secenekler: ["Çanakkale", "İstanbul", "Kereç", "Kırım"], dogru: 1, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Akdeniz hangi kıtalar arasındadır?", secenekler: ["Asya-Avrupa", "Avrupa-Afrika", "Asya-Afrika", "Hepsi"], dogru: 3, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük şelalesi hangisidir?", secenekler: ["Niagara", "Victoria", "Angel", "Iguazu"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en uzun nehri hangisidir?", secenekler: ["Fırat", "Dicle", "Kızılırmak", "Sakarya"], dogru: 2, zorluk: "Kolay", kategori: "Coğrafya" },

        // ============================ COĞRAFYA - ORTA ============================
        { soru: "Dünyanın en küçük ülkesi hangisidir?", secenekler: ["Monako", "Vatikan", "San Marino", "Liechtenstein"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük adası hangisidir?", secenekler: ["Marmara Adası", "Gökçeada", "Bozcaada", "Avşa"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Kapadokya hangi ildedir?", secenekler: ["Kayseri", "Nevşehir", "Aksaray", "Niğde"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Pamukkale hangi ildedir?", secenekler: ["Aydın", "Denizli", "Muğla", "İzmir"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Nemrut Dağı hangi ildedir?", secenekler: ["Adıyaman", "Şanlıurfa", "Mardin", "Diyarbakır"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Amazon Nehri hangi kıtadadır?", secenekler: ["Afrika", "Asya", "Güney Amerika", "Kuzey Amerika"], dogru: 2, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Nil Nehri hangi kıtadadır?", secenekler: ["Asya", "Afrika", "Avrupa", "Güney Amerika"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en yüksek ikinci dağı hangisidir?", secenekler: ["Cilo Dağı", "Süphan Dağı", "Erciyes", "Kaçkar"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük yüzölçümüne sahip ili hangisidir?", secenekler: ["Konya", "Ankara", "Sivas", "Erzurum"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en küçük yüzölçümüne sahip ili hangisidir?", secenekler: ["Yalova", "Kilis", "Bartın", "Bayburt"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük barajı hangisidir?", secenekler: ["Atatürk Barajı", "Keban Barajı", "Ilısu Barajı", "Altınkaya Barajı"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük yapay gölü hangisidir?", secenekler: ["Atatürk Baraj Gölü", "Keban Baraj Gölü", "Ilısu Baraj Gölü", "Hirfanlı Baraj Gölü"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Erciyes Dağı hangi ildedir?", secenekler: ["Kayseri", "Niğde", "Nevşehir", "Aksaray"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Uludağ hangi ildedir?", secenekler: ["Bursa", "Balıkesir", "Kütahya", "İzmir"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en uzun tüneli hangisidir?", secenekler: ["Ovit Tüneli", "Eurasia Tüneli", "Marmaray", "Bolu Tüneli"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "İstanbul Boğazı kaç km uzunluğundadır?", secenekler: ["25", "30", "35", "40"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Çanakkale Boğazı kaç km uzunluğundadır?", secenekler: ["55", "61", "68", "73"], dogru: 1, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en kalabalık ilçesi hangisidir?", secenekler: ["Esenyurt", "Keçiören", "Şahinbey", "Muratpaşa"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en yüksek binası hangisidir?", secenekler: ["Metropol İstanbul", "Skyland İstanbul", "İstanbul Sapphire", "Varyap Meridian"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },
        { soru: "Ağrı Dağı kaç metre yüksekliktedir?", secenekler: ["5137", "4168", "3917", "3756"], dogru: 0, zorluk: "Orta", kategori: "Coğrafya" },

        // ============================ COĞRAFYA - ZOR ============================
        { soru: "Dünyanın en büyük gölü hangisidir?", secenekler: ["Hazar Denizi", "Baykal Gölü", "Superior Gölü", "Victoria Gölü"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en derin gölü hangisidir?", secenekler: ["Hazar", "Baykal", "Tanganika", "Superior"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en uzun sıradağları hangisidir?", secenekler: ["Himalayalar", "And Dağları", "Kayalık Dağları", "Alpler"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en uzun kıyı şeridine sahip ili hangisidir?", secenekler: ["Antalya", "Muğla", "İzmir", "Balıkesir"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en kuzeydeki başkenti hangisidir?", secenekler: ["Oslo", "Helsinki", "Reykjavik", "Nuuk"], dogru: 2, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "En fazla ülkeye sınırı olan ülke hangisidir?", secenekler: ["Rusya", "Çin", "Brezilya", "Hindistan"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük yarımadası hangisidir?", secenekler: ["Gelibolu", "Biga", "Çeşme", "Datça"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en doğu noktası hangi ildedir?", secenekler: ["Iğdır", "Kars", "Ardahan", "Ağrı"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Kızılırmak hangi denize dökülür?", secenekler: ["Karadeniz", "Akdeniz", "Ege", "Marmara"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük doğal gölü hangisidir?", secenekler: ["Van Gölü", "Tuz Gölü", "Beyşehir", "Eğirdir"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük milli parkı hangisidir?", secenekler: ["Kaçkar Dağları", "Munzur Vadisi", "Kazdağı", "Küre Dağları"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'de kaç tane milli park vardır?", secenekler: ["38", "43", "48", "53"], dogru: 2, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Marmara Denizi'nin en derin noktası kaç metredir?", secenekler: ["1080", "1245", "1355", "1470"], dogru: 2, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en kalabalık şehri hangisidir?", secenekler: ["Tokyo", "Delhi", "Şanghay", "Sao Paulo"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en yüksek binası hangisidir?", secenekler: ["Burj Khalifa", "Şanghay Kulesi", "Mekke Kraliyet Saat Kulesi", "Taipei 101"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en uzun köprüsü hangisidir?", secenekler: ["Danyang-Kunshan", "Tianjin", "Cangde", "Beijing"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en yüksek üçüncü dağı hangisidir?", secenekler: ["Süphan", "Erciyes", "Kaçkar", "Cilo"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük deltası hangisidir?", secenekler: ["Çukurova", "Kızılırmak", "Yeşilırmak", "Gediz"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'de en çok yağış alan il hangisidir?", secenekler: ["Rize", "Trabzon", "Artvin", "Muğla"], dogru: 0, zorluk: "Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'de en az yağış alan il hangisidir?", secenekler: ["Konya", "Iğdır", "Şanlıurfa", "Kayseri"], dogru: 1, zorluk: "Zor", kategori: "Coğrafya" },

        // ============================ COĞRAFYA - EKSTRA ZOR ============================
        { soru: "Dünyanın en büyük yanardağı hangisidir?", secenekler: ["Mauna Loa", "Etna", "Fuji", "Vezüv"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyada kaç kıta vardır?", secenekler: ["5", "6", "7", "8"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Ekvatorda kaç ülke bulunur?", secenekler: ["10", "12", "13", "15"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en kuzey noktası hangi ildedir?", secenekler: ["Sinop", "Samsun", "Kastamonu", "Bartın"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en kurak çölü hangisidir?", secenekler: ["Sahara", "Atacama", "Gobi", "Kalahari"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük nehri hangisidir (debisi)?", secenekler: ["Amazon", "Nil", "Yangtze", "Mississippi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en yüksek başkenti hangisidir?", secenekler: ["La Paz", "Kito", "Bogota", "Meksiko"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en alçak noktası hangisidir?", secenekler: ["Ölü Deniz", "Lut Gölü", "Mariana Çukuru", "Kaspian"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük körfezi hangisidir?", secenekler: ["Meksika Körfezi", "Basra Körfezi", "Bengal Körfezi", "Biskay Körfezi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en uzun boğazı hangisidir?", secenekler: ["Malakka", "Cebelitarık", "Bering", "Macellan"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Türkiye'nin en büyük gölü hangisidir (yüzölçümü)?", secenekler: ["Van Gölü", "Tuz Gölü", "Beyşehir", "Eğirdir"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük tatlı su gölü hangisidir?", secenekler: ["Superior", "Baykal", "Victoria", "Michigan"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en tuzlu gölü hangisidir?", secenekler: ["Ölü Deniz", "Tuz Gölü", "Van Gölü", "Büyük Tuz Gölü"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük akarsuyu hangisidir?", secenekler: ["Amazon", "Nil", "Yangtze", "Mississippi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük adası hangisidir?", secenekler: ["Grönland", "Yeni Gine", "Borneo", "Madagaskar"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en yüksek şelalesi hangisidir?", secenekler: ["Angel", "Niagara", "Victoria", "Iguazu"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük şelalesi hangisidir (genişlik)?", secenekler: ["Khone", "Niagara", "Victoria", "Iguazu"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en uzun kanyonu hangisidir?", secenekler: ["Grand Canyon", "Fish River", "Copper Canyon", "Kali Gandaki"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük çölü hangisidir?", secenekler: ["Antarktika", "Sahara", "Gobi", "Kalahari"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en yüksek platosu hangisidir?", secenekler: ["Tibet", "And", "Colorado", "Bolivya"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en büyük kıtası hangisidir?", secenekler: ["Asya", "Afrika", "Amerika", "Avrupa"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },
        { soru: "Dünyanın en küçük ülkesi hangisidir?", secenekler: ["Vatikan", "Monako", "San Marino", "Liechtenstein"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Coğrafya" },

        // ============================ BİLİM - KOLAY ============================
        { soru: "Suyun kimyasal formülü nedir?", secenekler: ["H2O", "CO2", "O2", "NaCl"], dogru: 0, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "En büyük gezegen hangisidir?", secenekler: ["Mars", "Jüpiter", "Satürn", "Venüs"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Güneş'e en yakın gezegen hangisidir?", secenekler: ["Venüs", "Merkür", "Dünya", "Mars"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "İnsan vücudundaki en büyük organ hangisidir?", secenekler: ["Karaciğer", "Deri", "Akciğer", "Beyin"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Altının kimyasal sembolü nedir?", secenekler: ["Ag", "Au", "Al", "Ar"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "İnsanda kaç kromozom vardır?", secenekler: ["23", "44", "46", "48"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Kalp kaç odacıklıdır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Yerçekimi yasasını kim bulmuştur?", secenekler: ["Einstein", "Newton", "Galileo", "Kepler"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Işık hızı yaklaşık kaç km/s'dir?", secenekler: ["150.000", "200.000", "300.000", "400.000"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Atmosferde en bol bulunan gaz hangisidir?", secenekler: ["Oksijen", "Azot", "Karbondioksit", "Hidrojen"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Dünya'nın uydusu nedir?", secenekler: ["Güneş", "Ay", "Mars", "Venüs"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Suyun kaynama noktası kaç derecedir?", secenekler: ["0", "50", "100", "200"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Buzun erime noktası kaç derecedir?", secenekler: ["0", "10", "20", "-10"], dogru: 0, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Güneş sisteminde kaç gezegen vardır?", secenekler: ["7", "8", "9", "10"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Dünya'nın şekli nedir?", secenekler: ["Düz", "Küre", "Kare", "Silindir"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "En küçük gezegen hangisidir?", secenekler: ["Merkür", "Mars", "Venüs", "Plüton"], dogru: 0, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "İnsan vücudunun en sert dokusu nedir?", secenekler: ["Kemik", "Diş Minesi", "Kıkırdak", "Tırnak"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Kaç çeşit kan grubu vardır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "İnsan vücudunda kaç diş vardır (yetişkin)?", secenekler: ["28", "30", "32", "34"], dogru: 2, zorluk: "Kolay", kategori: "Bilim" },
        { soru: "Hangi organ kanı pompalar?", secenekler: ["Karaciğer", "Kalp", "Akciğer", "Böbrek"], dogru: 1, zorluk: "Kolay", kategori: "Bilim" },

        // ============================ BİLİM - ORTA ============================
        { soru: "Periyodik tabloda kaç element vardır?", secenekler: ["108", "112", "118", "120"], dogru: 2, zorluk: "Orta", kategori: "Bilim" },
        { soru: "İnsan vücudundaki en uzun kemik hangisidir?", secenekler: ["Tibia", "Femur", "Humerus", "Fibula"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },
        { soru: "DNA'nın çift sarmal yapısını kim keşfetmiştir?", secenekler: ["Mendel", "Watson ve Crick", "Darwin", "Pasteur"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },
        { soru: "İzafiyet teorisini kim ortaya atmıştır?", secenekler: ["Newton", "Einstein", "Bohr", "Planck"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Penisilini kim keşfetmiştir?", secenekler: ["Alexander Fleming", "Louis Pasteur", "Robert Koch", "Edward Jenner"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Kanın kırmızı rengini veren madde nedir?", secenekler: ["Hemoglobin", "Klorofil", "Melanin", "Keratin"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Demirin kimyasal sembolü nedir?", secenekler: ["Fe", "Fr", "F", "Ir"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Su deniz seviyesinde kaç derecede kaynar?", secenekler: ["90", "95", "100", "110"], dogru: 2, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Dünya'nın tek doğal uydusu nedir?", secenekler: ["Ay", "Mars", "Venüs", "Titan"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "İnsan vücudunun yaklaşık % kaçı sudur?", secenekler: ["40", "50", "60", "70"], dogru: 2, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Karbonun kimyasal sembolü nedir?", secenekler: ["C", "Ca", "Co", "Cr"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Oksijenin kimyasal sembolü nedir?", secenekler: ["O", "Ox", "Ok", "On"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Azotun kimyasal sembolü nedir?", secenekler: ["A", "N", "Az", "Ni"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Gümüşün kimyasal sembolü nedir?", secenekler: ["Ag", "Gu", "Si", "Au"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Bakırın kimyasal sembolü nedir?", secenekler: ["B", "Cu", "Co", "Ca"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Çinkonun kimyasal sembolü nedir?", secenekler: ["Zn", "Zi", "Çk", "Z"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Kurşunun kimyasal sembolü nedir?", secenekler: ["Pb", "Ku", "K", "P"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Kalayın kimyasal sembolü nedir?", secenekler: ["Sn", "Ka", "K", "S"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Cıvanın kimyasal sembolü nedir?", secenekler: ["Hg", "Ci", "C", "H"], dogru: 0, zorluk: "Orta", kategori: "Bilim" },
        { soru: "Işık yılı nedir?", secenekler: ["Zaman birimi", "Uzunluk birimi", "Hız birimi", "Kütle birimi"], dogru: 1, zorluk: "Orta", kategori: "Bilim" },

        // ============================ BİLİM - ZOR ============================
        { soru: "Elektronu kim keşfetmiştir?", secenekler: ["Rutherford", "J.J. Thomson", "Bohr", "Chadwick"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Atom çekirdeğini kim keşfetmiştir?", secenekler: ["Thomson", "Rutherford", "Bohr", "Dalton"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "İlk aşıyı kim bulmuştur?", secenekler: ["Pasteur", "Edward Jenner", "Koch", "Fleming"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Polonyum ve radyumu kim keşfetmiştir?", secenekler: ["Marie Curie", "Becquerel", "Einstein", "Fermi"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Ses hızı havada yaklaşık kaç m/s'dir?", secenekler: ["234", "343", "443", "543"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "İnsan vücudundaki en küçük kemik hangisidir?", secenekler: ["Örs", "Üzengi", "Çekiç", "Örs kemiği"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Güneş sistemindeki en büyük yanardağ hangi gezegendedir?", secenekler: ["Dünya", "Mars", "Venüs", "Merkür"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Radyoaktiviteyi ilk keşfeden kimdir?", secenekler: ["Marie Curie", "Henri Becquerel", "Rutherford", "Einstein"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "İnsan beyni yaklaşık kaç nörondan oluşur?", secenekler: ["10 milyar", "50 milyar", "86 milyar", "150 milyar"], dogru: 2, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Suyun yoğunluğu kaç °C'de en yüksektir?", secenekler: ["0", "4", "10", "20"], dogru: 1, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Nötronu kim keşfetmiştir?", secenekler: ["Chadwick", "Rutherford", "Bohr", "Thomson"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Protonu kim keşfetmiştir?", secenekler: ["Rutherford", "Chadwick", "Bohr", "Thomson"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Yerçekimi sabiti yaklaşık kaçtır?", secenekler: ["6.67x10^-11", "9.81", "3.14", "1.6x10^-19"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Avogadro sayısı yaklaşık kaçtır?", secenekler: ["6.02x10^23", "3.14x10^23", "9.81x10^23", "1.6x10^23"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Planck sabiti nedir?", secenekler: ["Enerji/zaman", "Kütle/hacim", "Uzunluk/zaman", "Kuvvet/alan"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Einstein'ın ünlü denklemi nedir?", secenekler: ["E=mc²", "F=ma", "E=hf", "PV=nRT"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Newton'un ikinci yasası nedir?", secenekler: ["F=ma", "E=mc²", "E=hf", "PV=nRT"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "İdeal gaz denklemi nedir?", secenekler: ["PV=nRT", "F=ma", "E=mc²", "E=hf"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Hücreyi kim keşfetmiştir?", secenekler: ["Robert Hooke", "Leeuwenhoek", "Pasteur", "Koch"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Evrim teorisini kim ortaya atmıştır?", secenekler: ["Darwin", "Mendel", "Lamarck", "Wallace"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },
        { soru: "Kalıtım yasalarını kim bulmuştur?", secenekler: ["Mendel", "Darwin", "Pasteur", "Koch"], dogru: 0, zorluk: "Zor", kategori: "Bilim" },

        // ============================ BİLİM - EKSTRA ZOR ============================
        { soru: "Higgs bozonu hangi yıl keşfedilmiştir?", secenekler: ["2008", "2010", "2012", "2015"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Nobel Ödülü kaç dalda verilir?", secenekler: ["4", "5", "6", "7"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Nobel Ödülü ilk kez hangi yıl verilmiştir?", secenekler: ["1895", "1901", "1910", "1920"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Nobel Ödülü'nü kazanan ilk kadın kimdir?", secenekler: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Dorothy Hodgkin"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Nobel Ödülü'nü iki farklı dalda kazanan tek kişi kimdir?", secenekler: ["Einstein", "Marie Curie", "Linus Pauling", "Bohr"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "İnsan DNA'sında yaklaşık kaç gen vardır?", secenekler: ["10.000", "20.000", "50.000", "100.000"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Işık bir yılda yaklaşık kaç km yol alır?", secenekler: ["9.46 trilyon", "1 milyar", "150 milyon", "300 bin"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Evrenin yaşı yaklaşık kaç milyar yıldır?", secenekler: ["4.5", "9", "13.8", "20"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Evrenin genişleme hızına ne ad verilir?", secenekler: ["Hubble sabiti", "Planck sabiti", "Boltzmann sabiti", "Avogadro"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Kara deliklerin varlığını kim öngörmüştür?", secenekler: ["Einstein", "Hawking", "Newton", "Galileo"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Hawking radyasyonu nedir?", secenekler: ["Kara delik ışıması", "Yıldız ışıması", "Güneş ışıması", "Ay ışıması"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Kuantum dolanıklık nedir?", secenekler: ["Parçacıklar arası bağ", "Atom çekirdeği", "Işık hızı", "Yerçekimi"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Sicim teorisi neyi açıklar?", secenekler: ["Evreni", "Atomu", "Hücreyi", "Gezegeni"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "Büyük Patlama teorisi hangi yıl ortaya atılmıştır?", secenekler: ["1927", "1935", "1945", "1955"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },
        { soru: "CERN'deki büyük hadron çarpıştırıcısı hangi ülkededir?", secenekler: ["İsviçre", "Almanya", "Fransa", "İtalya"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Bilim" },

        // ============================ GENEL KÜLTÜR - KOLAY ============================
        { soru: "Bir yılda kaç gün vardır?", secenekler: ["364", "365", "366", "367"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir yılda kaç ay vardır?", secenekler: ["10", "11", "12", "13"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Gökkuşağı kaç renkten oluşur?", secenekler: ["5", "6", "7", "8"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Türkiye'nin para birimi nedir?", secenekler: ["Dolar", "Euro", "Türk Lirası", "Sterlin"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Türkiye'nin telefon kodu nedir?", secenekler: ["+1", "+44", "+90", "+91"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Satranç tahtası kaç karedir?", secenekler: ["36", "49", "64", "81"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Dünyanın en büyük hayvanı hangisidir?", secenekler: ["Fil", "Mavi balina", "Zürafa", "Su aygırı"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Dünyanın en hızlı kara hayvanı hangisidir?", secenekler: ["Aslan", "Çita", "At", "Antilop"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Trafik ışığında kaç renk vardır?", secenekler: ["2", "3", "4", "5"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Balıklar su altında nasıl nefes alır?", secenekler: ["Akciğer", "Solungaç", "Deri", "Burun"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir asır kaç yıldır?", secenekler: ["10", "50", "100", "1000"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Türkiye Cumhuriyeti'nin kurucusu kimdir?", secenekler: ["İsmet İnönü", "Mustafa Kemal Atatürk", "Fevzi Çakmak", "Celal Bayar"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir düzine kaç tanedir?", secenekler: ["6", "10", "12", "20"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir deste kaç tanedir?", secenekler: ["5", "10", "12", "20"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir saat kaç dakikadır?", secenekler: ["30", "45", "60", "90"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir gün kaç saattir?", secenekler: ["12", "18", "24", "36"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir hafta kaç gündür?", secenekler: ["5", "6", "7", "8"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Parmakta kaç tırnak vardır (tek el)?", secenekler: ["4", "5", "6", "10"], dogru: 1, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "İnsanın kaç dişi vardır (yetişkin)?", secenekler: ["28", "30", "32", "34"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },
        { soru: "Bir olimpiyat kaç yılda bir yapılır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Kolay", kategori: "Genel Kültür" },

        // ============================ GENEL KÜLTÜR - ORTA ============================
        { soru: "Dünyanın en kalabalık dini hangisidir?", secenekler: ["İslam", "Hristiyanlık", "Hinduizm", "Budizm"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Penguenler hangi kutupta yaşar?", secenekler: ["Kuzey", "Güney", "Her ikisi", "Hiçbiri"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Kutup ayıları hangi kutupta yaşar?", secenekler: ["Kuzey", "Güney", "Her ikisi", "Hiçbiri"], dogru: 0, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Zürafanın kaç boynu vardır?", secenekler: ["1", "2", "3", "7"], dogru: 0, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Bir milenyum kaç yıldır?", secenekler: ["100", "500", "1000", "10000"], dogru: 2, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Türkiye'nin resmi dini var mıdır?", secenekler: ["Evet, İslam", "Hayır, laiktir", "Evet, Hristiyanlık", "Belirsiz"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Bir uçak hangi yakıtla çalışır?", secenekler: ["Benzin", "Gazyağı (Jet yakıtı)", "Motorin", "LPG"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Dünyanın en büyük kıtası hangisidir?", secenekler: ["Afrika", "Asya", "Avrupa", "Amerika"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "İnsanın kaç kromozomu vardır?", secenekler: ["23", "44", "46", "48"], dogru: 2, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Bumerang hangi ülkeye özgüdür?", secenekler: ["Avustralya", "Yeni Zelanda", "Endonezya", "Brezilya"], dogru: 0, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Origami hangi ülkeye özgüdür?", secenekler: ["Çin", "Japonya", "Kore", "Tayland"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Pizza hangi ülkeye özgüdür?", secenekler: ["Fransa", "İtalya", "Yunanistan", "İspanya"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Sushi hangi ülkeye özgüdür?", secenekler: ["Çin", "Japonya", "Kore", "Tayland"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Tango hangi ülkeye özgüdür?", secenekler: ["Brezilya", "Arjantin", "İspanya", "Meksika"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Flamenko hangi ülkeye özgüdür?", secenekler: ["Portekiz", "İspanya", "İtalya", "Fransa"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Satranç hangi ülkeye özgüdür?", secenekler: ["Çin", "Hindistan", "İran", "Yunanistan"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Dünyanın en çok konuşulan dili hangisidir (ana dil)?", secenekler: ["İngilizce", "Çince", "İspanyolca", "Hintçe"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "Dünyanın en çok ülkesinde resmi dil hangisidir?", secenekler: ["İngilizce", "Fransızca", "İspanyolca", "Arapça"], dogru: 0, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "BM'nin merkezi hangi şehirdedir?", secenekler: ["Cenevre", "New York", "Paris", "Londra"], dogru: 1, zorluk: "Orta", kategori: "Genel Kültür" },
        { soru: "NATO'nun merkezi hangi şehirdedir?", secenekler: ["Brüksel", "Paris", "Londra", "Roma"], dogru: 0, zorluk: "Orta", kategori: "Genel Kültür" },

        // ============================ GENEL KÜLTÜR - ZOR ============================
        { soru: "Dünyanın en küçük kuşu hangisidir?", secenekler: ["Serçe", "Sinek kuşu", "Kanarya", "Muhabbet kuşu"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Türkiye'de en çok tüketilen içecek nedir?", secenekler: ["Su", "Çay", "Kahve", "Ayran"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyada en çok konuşulan ana dil hangisidir?", secenekler: ["İngilizce", "Çince (Mandarin)", "İspanyolca", "Hintçe"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyada en çok ülke tarafından resmi dil olarak kabul edilen dil hangisidir?", secenekler: ["İngilizce", "Fransızca", "İspanyolca", "Arapça"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir aslanın ortalama ömrü kaç yıldır?", secenekler: ["5-10", "10-14", "15-20", "20-25"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir filin ortalama ömrü kaç yıldır?", secenekler: ["30-40", "50-70", "70-90", "90-100"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir kaplumbağanın ortalama ömrü kaç yıldır?", secenekler: ["20-30", "50-80", "100-150", "200-300"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en zehirli hayvanı hangisidir?", secenekler: ["Kutu denizanası", "Kobra", "Akrep", "Örümcek"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en büyük örümceği hangisidir?", secenekler: ["Goliath", "Tarantula", "Kara Dul", "Avustralya"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en uzun yaşayan hayvanı hangisidir?", secenekler: ["Grönland köpekbalığı", "Fil", "Kaplumbağa", "Balina"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir balinanın kalbi kaç odacıklıdır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir ahtapotun kaç kalbi vardır?", secenekler: ["1", "2", "3", "4"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir ahtapotun kaç kolu vardır?", secenekler: ["6", "7", "8", "9"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir örümceğin kaç bacağı vardır?", secenekler: ["6", "7", "8", "10"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir böceğin kaç bacağı vardır?", secenekler: ["4", "6", "8", "10"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir akrebin kaç bacağı vardır?", secenekler: ["6", "8", "10", "12"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir yılanın kaç kalbi vardır?", secenekler: ["1", "2", "3", "4"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Bir solucanın kaç kalbi vardır?", secenekler: ["1", "3", "5", "10"], dogru: 2, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en büyük kemikli balığı hangisidir?", secenekler: ["Okyanus güneş balığı", "Kılıç balığı", "Ton balığı", "Somon"], dogru: 0, zorluk: "Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en büyük tatlı su balığı hangisidir?", secenekler: ["Arapaima", "Beluga mersin balığı", "Timsah balığı", "Yayın"], dogru: 1, zorluk: "Zor", kategori: "Genel Kültür" },

        // ============================ GENEL KÜLTÜR - EKSTRA ZOR ============================
        { soru: "Türk kahvesi hangi tarihte UNESCO listesine girmiştir?", secenekler: ["2010", "2013", "2015", "2018"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Türkiye UNESCO Dünya Mirası Listesi'nde kaç esere sahiptir?", secenekler: ["15", "17", "19", "21"], dogru: 2, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı baharatı hangisidir?", secenekler: ["Vanilya", "Safran", "Karabiber", "Tarçın"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı mantarı hangisidir?", secenekler: ["Trüf", "Şitaki", "Portobello", "Porçini"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı kahvesi hangisidir?", secenekler: ["Kopi Luwak", "Black Ivory", "Blue Mountain", "Geisha"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı eti hangisidir?", secenekler: ["Wagyu", "Kobe", "Angus", "Hereford"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı meyvesi hangisidir?", secenekler: ["Yubari kavun", "Durian", "Mangosteen", "Rambutan"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı balığı hangisidir?", secenekler: ["Mavi yüzgeçli orkinos", "Somon", "Kılıç", "Levrek"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı mantar türü hangisidir?", secenekler: ["Alba trüfü", "Siyah trüf", "Şitaki", "Porçini"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en pahalı çayı hangisidir?", secenekler: ["Da Hong Pao", "Earl Grey", "Yeşil Çay", "Beyaz Çay"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en eski üniversitesi hangisidir?", secenekler: ["Bologna", "Oxford", "Sorbonne", "Harvard"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en eski şehri hangisidir?", secenekler: ["Şam", "Eriha", "Ur", "Byblos"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en eski piramidi hangisidir?", secenekler: ["Giza", "Sakkara", "Keops", "Kefren"], dogru: 1, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en eski tapınağı hangisidir?", secenekler: ["Göbeklitepe", "Stonehenge", "Karnak", "Parthenon"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Göbeklitepe hangi ildedir?", secenekler: ["Şanlıurfa", "Mardin", "Diyarbakır", "Adıyaman"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın en eski yerleşim yeri hangisidir?", secenekler: ["Çatalhöyük", "Göbeklitepe", "Eriha", "Şam"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Çatalhöyük hangi ildedir?", secenekler: ["Konya", "Ankara", "Aksaray", "Niğde"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Truva antik kenti hangi ildedir?", secenekler: ["Çanakkale", "İzmir", "Balıkesir", "Aydın"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Efes antik kenti hangi ildedir?", secenekler: ["İzmir", "Aydın", "Muğla", "Denizli"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },
        { soru: "Dünyanın 7 harikasından biri olan Artemis Tapınağı nerededir?", secenekler: ["Efes", "Roma", "Atina", "Mısır"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Genel Kültür" },

        // ============================ MATEMATİK ============================
        { soru: "Pi sayısı yaklaşık kaçtır?", secenekler: ["2.14", "3.14", "4.14", "3.41"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Üçgenin iç açıları toplamı kaç derecedir?", secenekler: ["90", "180", "270", "360"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Dörtgenin iç açıları toplamı kaç derecedir?", secenekler: ["180", "270", "360", "540"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "En küçük asal sayı kaçtır?", secenekler: ["0", "1", "2", "3"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "0 asal sayı mıdır?", secenekler: ["Evet", "Hayır", "Bazen", "Bilinmiyor"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Bir düzine kaç tanedir?", secenekler: ["6", "10", "12", "20"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Bir deste kaç tanedir?", secenekler: ["5", "10", "12", "20"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "10'un karesi kaçtır?", secenekler: ["20", "50", "100", "1000"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Bir saat kaç saniyedir?", secenekler: ["60", "600", "3600", "36000"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Bir gün kaç saattir?", secenekler: ["12", "18", "24", "36"], dogru: 2, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Beşgenin iç açıları toplamı kaç derecedir?", secenekler: ["360", "450", "540", "720"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Altıgenin iç açıları toplamı kaç derecedir?", secenekler: ["540", "620", "720", "820"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Bir küpün kaç yüzü vardır?", secenekler: ["4", "6", "8", "12"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "Bir küpün kaç kenarı vardır?", secenekler: ["6", "8", "12", "16"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Bir küpün kaç köşesi vardır?", secenekler: ["4", "6", "8", "12"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "100'ün karekökü kaçtır?", secenekler: ["5", "10", "20", "50"], dogru: 1, zorluk: "Kolay", kategori: "Matematik" },
        { soru: "144'ün karekökü kaçtır?", secenekler: ["10", "11", "12", "13"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "169'un karekökü kaçtır?", secenekler: ["11", "12", "13", "14"], dogru: 2, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Bir üçgenin alanı nasıl bulunur?", secenekler: ["(taban x yükseklik)/2", "taban x yükseklik", "(taban + yükseklik)/2", "taban + yükseklik"], dogru: 0, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Bir dairenin alanı nasıl bulunur?", secenekler: ["πr²", "2πr", "πd", "r²"], dogru: 0, zorluk: "Orta", kategori: "Matematik" },
        { soru: "Bir dairenin çevresi nasıl bulunur?", secenekler: ["πr²", "2πr", "πd", "r²"], dogru: 1, zorluk: "Orta", kategori: "Matematik" },

        // ============================ SANAT ============================
        { soru: "Mona Lisa tablosunu kim yapmıştır?", secenekler: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Van Gogh"], dogru: 1, zorluk: "Kolay", kategori: "Sanat" },
        { soru: "Sistine Şapeli'nin tavanını kim boyamıştır?", secenekler: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Guernica tablosunun ressamı kimdir?", secenekler: ["Picasso", "Dali", "Miro", "Matisse"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Yıldızlı Gece'nin ressamı kimdir?", secenekler: ["Monet", "Van Gogh", "Cezanne", "Gauguin"], dogru: 1, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Çığlık tablosunun ressamı kimdir?", secenekler: ["Edvard Munch", "Gustav Klimt", "Kandinsky", "Picasso"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Kaplumbağa Terbiyecisi'nin ressamı kimdir?", secenekler: ["Osman Hamdi Bey", "İbrahim Çallı", "Fikret Mualla", "Şeker Ahmet Paşa"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "İnci Küpeli Kız'ın ressamı kimdir?", secenekler: ["Rembrandt", "Vermeer", "Rubens", "Van Dyck"], dogru: 1, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Sürrealizmin öncüsü kimdir?", secenekler: ["Salvador Dali", "Picasso", "Kandinsky", "Mondrian"], dogru: 0, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Düşünen Adam heykelinin sanatçısı kimdir?", secenekler: ["Michelangelo", "Rodin", "Donatello", "Bernini"], dogru: 1, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Son Akşam Yemeği freskinin ressamı kimdir?", secenekler: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Botticelli"], dogru: 1, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Empresyonizm akımının öncüsü kimdir?", secenekler: ["Monet", "Picasso", "Dali", "Van Gogh"], dogru: 0, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Kübizm akımının öncüsü kimdir?", secenekler: ["Picasso", "Dali", "Monet", "Kandinsky"], dogru: 0, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Van Gogh hayattayken kaç tablo satmıştır?", secenekler: ["1", "5", "10", "50"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sanat" },
        { soru: "Rönesans hangi ülkede başlamıştır?", secenekler: ["Fransa", "İtalya", "Almanya", "İngiltere"], dogru: 1, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Michelangelo'nun ünlü heykeli hangisidir?", secenekler: ["Davut", "Düşünen Adam", "Venüs", "Apollo"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Venüs de Milo heykeli hangi müzededir?", secenekler: ["Louvre", "British Museum", "Vatikan", "Uffizi"], dogru: 0, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Mona Lisa hangi müzededir?", secenekler: ["Louvre", "British Museum", "Vatikan", "Uffizi"], dogru: 0, zorluk: "Orta", kategori: "Sanat" },
        { soru: "Guernica hangi müzededir?", secenekler: ["Prado", "Reina Sofia", "Louvre", "MoMA"], dogru: 1, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Yıldızlı Gece hangi müzededir?", secenekler: ["MoMA", "Louvre", "Prado", "Uffizi"], dogru: 0, zorluk: "Zor", kategori: "Sanat" },
        { soru: "Osman Hamdi Bey hangi müzenin kurucusudur?", secenekler: ["İstanbul Arkeoloji Müzesi", "Topkapı", "Ayasofya", "Anadolu Medeniyetleri"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sanat" },

        // ============================ MÜZİK ============================
        { soru: "9. Senfoni'yi kim bestelemiştir?", secenekler: ["Mozart", "Beethoven", "Bach", "Chopin"], dogru: 1, zorluk: "Kolay", kategori: "Müzik" },
        { soru: "Türk Sanat Müziği'nin unutulmaz ismi kimdir?", secenekler: ["Zeki Müren", "Barış Manço", "Tarkan", "Sezen Aksu"], dogru: 0, zorluk: "Kolay", kategori: "Müzik" },
        { soru: "Barış Manço hangi müzik türünün öncüsüdür?", secenekler: ["Anadolu Rock", "Pop", "Arabesk", "Türk Halk Müziği"], dogru: 0, zorluk: "Kolay", kategori: "Müzik" },
        { soru: "Neşet Ertaş hangi müzik türünün temsilcisidir?", secenekler: ["Türk Halk Müziği", "Türk Sanat Müziği", "Arabesk", "Pop"], dogru: 0, zorluk: "Kolay", kategori: "Müzik" },
        { soru: "Mozart hangi ülkelidir?", secenekler: ["Almanya", "Avusturya", "İtalya", "Fransa"], dogru: 1, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Bach hangi ülkelidir?", secenekler: ["Avusturya", "Almanya", "İtalya", "İngiltere"], dogru: 1, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Şımarık şarkısıyla dünyaca ünlü olan sanatçı kimdir?", secenekler: ["Tarkan", "Sezen Aksu", "Barış Manço", "Kenan Doğulu"], dogru: 0, zorluk: "Kolay", kategori: "Müzik" },
        { soru: "Sezen Aksu'nun lakabı nedir?", secenekler: ["Minik Serçe", "Türkü Baba", "Sanat Güneşi", "Barış Adamı"], dogru: 0, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Chopin hangi enstrümanın bestecisidir?", secenekler: ["Keman", "Piyano", "Çello", "Flüt"], dogru: 1, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Aşık Veysel kaç yaşında kör olmuştur?", secenekler: ["5", "7", "10", "12"], dogru: 1, zorluk: "Zor", kategori: "Müzik" },
        { soru: "Zeki Müren'in lakabı nedir?", secenekler: ["Sanat Güneşi", "Minik Serçe", "Türkü Baba", "Ses Sanatçısı"], dogru: 0, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Dünyanın en ünlü İtalyan tenorlarından biri kimdir?", secenekler: ["Pavarotti", "Domingo", "Carreras", "Bocelli"], dogru: 0, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Türkiye'nin ilk kadın opera sanatçısı kimdir?", secenekler: ["Semiha Berksoy", "Leyla Gencer", "Güher Pekinel", "İdil Biret"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Müzik" },
        { soru: "Dünyaca ünlü Türk piyanist kimdir?", secenekler: ["İdil Biret", "Leyla Gencer", "Semiha Berksoy", "Sunay Akın"], dogru: 0, zorluk: "Zor", kategori: "Müzik" },
        { soru: "Yunus Emre'nin şiirleri hangi müzik türüyle anılır?", secenekler: ["İlahi", "Türkü", "Şarkı", "Gazel"], dogru: 0, zorluk: "Orta", kategori: "Müzik" },
        { soru: "Beethoven kaç yaşında sağır olmuştur?", secenekler: ["20", "30", "40", "50"], dogru: 1, zorluk: "Zor", kategori: "Müzik" },
        { soru: "Mozart kaç yaşında ölmüştür?", secenekler: ["25", "35", "45", "55"], dogru: 1, zorluk: "Zor", kategori: "Müzik" },
        { soru: "Beethoven kaç senfoni bestelemiştir?", secenekler: ["5", "7", "9", "11"], dogru: 2, zorluk: "Zor", kategori: "Müzik" },
        { soru: "Türk Sanat Müziği'nin en önemli bestecisi kimdir?", secenekler: ["Itri", "Dede Efendi", "Hacı Arif Bey", "Hepsi"], dogru: 3, zorluk: "Ekstra Zor", kategori: "Müzik" },
        { soru: "Türk Halk Müziği'nin en önemli ozanı kimdir?", secenekler: ["Aşık Veysel", "Neşet Ertaş", "Karacaoğlan", "Hepsi"], dogru: 3, zorluk: "Zor", kategori: "Müzik" },

        // ============================ SİNEMA ============================
        { soru: "İlk Türk filmi hangisidir?", secenekler: ["Ayastefanos'taki Rus Abidesinin Yıkılışı", "Pençe", "Casus", "Himmet Ağa'nın İzdivacı"], dogru: 0, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Altın Palmiye kazanan ilk Türk filmi hangisidir?", secenekler: ["Yol", "Kış Uykusu", "Ahlat Ağacı", "Bir Zamanlar Anadolu'da"], dogru: 0, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Yol filminin yönetmeni kimdir?", secenekler: ["Yılmaz Güney", "Nuri Bilge Ceylan", "Zeki Ökten", "Metin Erksan"], dogru: 0, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Kış Uykusu filminin yönetmeni kimdir?", secenekler: ["Nuri Bilge Ceylan", "Yılmaz Güney", "Ferzan Özpetek", "Cem Yılmaz"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Titanic filminin yönetmeni kimdir?", secenekler: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Ridley Scott"], dogru: 1, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Oscar ödüllerini kim dağıtır?", secenekler: ["Sinema Sanatları ve Bilimleri Akademisi", "Altın Küre", "BAFTA", "Cannes"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Hababam Sınıfı filminin yönetmeni kimdir?", secenekler: ["Ertem Eğilmez", "Yılmaz Güney", "Metin Erksan", "Atıf Yılmaz"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "En çok Oscar kazanan film hangisidir?", secenekler: ["Titanic", "Ben-Hur", "Yüzüklerin Efendisi: Kralın Dönüşü", "Hepsi (11)"], dogru: 3, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Susuz Yaz filmi hangi ödülü kazanmıştır?", secenekler: ["Altın Ayı", "Altın Palmiye", "Oscar", "Altın Aslan"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sinema" },
        { soru: "Susuz Yaz filminin yönetmeni kimdir?", secenekler: ["Metin Erksan", "Yılmaz Güney", "Atıf Yılmaz", "Halit Refiğ"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sinema" },
        { soru: "Türkiye'nin ilk renkli filmi hangisidir?", secenekler: ["Halıcı Kız", "Susuz Yaz", "Yol", "Selvi Boylum Al Yazmalım"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sinema" },
        { soru: "Yeşilçam hangi dönemi ifade eder?", secenekler: ["1940-1950", "1950-1970", "1980-1990", "2000'ler"], dogru: 1, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Inception filminin yönetmeni kimdir?", secenekler: ["Christopher Nolan", "Spielberg", "Cameron", "Scorsese"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Baba (The Godfather) filminin yönetmeni kimdir?", secenekler: ["Francis Ford Coppola", "Scorsese", "Spielberg", "Kubrick"], dogru: 0, zorluk: "Zor", kategori: "Sinema" },
        { soru: "Gülün Adı filminin başrol oyuncusu kimdir?", secenekler: ["Sean Connery", "Robert De Niro", "Al Pacino", "Anthony Hopkins"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sinema" },
        { soru: "Titanic filminin başrol oyuncusu kimdir?", secenekler: ["Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Johnny Depp"], dogru: 0, zorluk: "Kolay", kategori: "Sinema" },
        { soru: "Matrix filminin başrol oyuncusu kimdir?", secenekler: ["Keanu Reeves", "Tom Cruise", "Brad Pitt", "Will Smith"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Forrest Gump filminin başrol oyuncusu kimdir?", secenekler: ["Tom Hanks", "Tom Cruise", "Brad Pitt", "Kevin Costner"], dogru: 0, zorluk: "Orta", kategori: "Sinema" },
        { soru: "Türkiye'nin ilk animasyon filmi hangisidir?", secenekler: ["Evliya Çelebi", "İstanbul", "Keloğlan", "Pepee"], dogru: 0, zorluk: "Ekstra Zor", kategori: "Sinema" },
        { soru: "Ayla: Savaşın Kızı filminin yönetmeni kimdir?", secenekler: ["Can Ulkay", "Nuri Bilge Ceylan", "Cem Yılmaz", "Ferzan Özpetek"], dogru: 0, zorluk: "Zor", kategori: "Sinema" },

        // ============================ SPOR ============================
        { soru: "Galatasaray UEFA Kupası'nı hangi yıl kazanmıştır?", secenekler: ["1998", "1999", "2000", "2001"], dogru: 2, zorluk: "Orta", kategori: "Spor" },
        { soru: "Türkiye 2002 Dünya Kupası'nda kaçıncı olmuştur?", secenekler: ["1.", "2.", "3.", "4."], dogru: 2, zorluk: "Orta", kategori: "Spor" },
        { soru: "Olimpiyat oyunları kaç yılda bir yapılır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Kolay", kategori: "Spor" },
        { soru: "FIFA Dünya Kupası kaç yılda bir yapılır?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Kolay", kategori: "Spor" },
        { soru: "FIFA Dünya Kupası'nı en çok kazanan ülke hangisidir?", secenekler: ["Almanya", "İtalya", "Brezilya", "Arjantin"], dogru: 2, zorluk: "Orta", kategori: "Spor" },
        { soru: "Basketbolda bir takım sahada kaç oyuncuyla oynar?", secenekler: ["4", "5", "6", "7"], dogru: 1, zorluk: "Kolay", kategori: "Spor" },
        { soru: "Voleybolda bir takım sahada kaç oyuncuyla oynar?", secenekler: ["5", "6", "7", "8"], dogru: 1, zorluk: "Kolay", kategori: "Spor" },
        { soru: "Formula 1'de en çok şampiyon olan pilot kimdir?", secenekler: ["Schumacher", "Hamilton", "Senna", "Fangio"], dogru: 0, zorluk: "Zor", kategori: "Spor" },
        { soru: "Teniste Grand Slam turnuvaları kaç tanedir?", secenekler: ["2", "3", "4", "5"], dogru: 2, zorluk: "Orta", kategori: "Spor" },
        { soru: "Türkiye'nin ilk olimpiyat altın madalyası hangi branşta kazanılmıştır?", secenekler: ["Güreş", "Halter", "Atletizm", "Boks"], dogru: 0, zorluk: "Zor", kategori: "Spor" },
        { soru: "Bir futbol maçı kaç dakikadır?", secenekler: ["60", "80", "90", "100"], dogru: 2, zorluk: "Kolay", kategori: "Spor" },
        { soru: "Futbolda penaltı noktası kaç metre uzaklıktadır?", secenekler: ["9", "10", "11", "12"], dogru: 2, zorluk: "Orta", kategori: "Spor" },
        { soru: "Basketbolda bir pota kaç metre yüksekliktedir?", secenekler: ["2.5", "3.05", "3.5", "4"], dogru: 1, zorluk: "Zor", kategori: "Spor" },
        { soru: "Satrançta kaç taş vardır?", secenekler: ["16", "24", "32", "64"], dogru: 2, zorluk: "Kolay", kategori: "Spor" },
        { soru: "Olimpiyat bayrağında kaç halka vardır?", secenekler: ["4", "5", "6", "7"], dogru: 1, zorluk: "Orta", kategori: "Spor" },
        { soru: "Dünya Kupası'nı kazanan ilk ülke hangisidir?", secenekler: ["Brezilya", "Uruguay", "İtalya", "Almanya"], dogru: 1, zorluk: "Zor", kategori: "Spor" },
        { soru: "UEFA Şampiyonlar Ligi'ni en çok kazanan takım hangisidir?", secenekler: ["Real Madrid", "Barcelona", "Milan", "Bayern"], dogru: 0, zorluk: "Orta", kategori: "Spor" },
        { soru: "Türkiye Süper Lig'ini en çok kazanan takım hangisidir?", secenekler: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor"], dogru: 0, zorluk: "Orta", kategori: "Spor" },
        { soru: "Türkiye'nin en çok olimpiyat madalyası kazanan sporcusu kimdir?", secenekler: ["Hamza Yerlikaya", "Naim Süleymanoğlu", "Halil Mutlu", "Süreyya Ayhan"], dogru: 1, zorluk: "Zor", kategori: "Spor" },
        { soru: "Naim Süleymanoğlu hangi branşta ünlüdür?", secenekler: ["Güreş", "Halter", "Atletizm", "Boks"], dogru: 1, zorluk: "Orta", kategori: "Spor" }
    ];

    // =========================== KELİME OYUNU ===========================
    const KELIME_LISTESI = [
        'elma', 'armut', 'kedi', 'köpek', 'kuş', 'balık', 'aslan', 'kaplan', 'fil', 'zürafa',
        'masa', 'sandalye', 'kapı', 'pencere', 'kitap', 'defter', 'kalem', 'silgi', 'bilgisayar', 'telefon',
        'araba', 'uçak', 'gemi', 'tren', 'bisiklet', 'motosiklet', 'otobüs', 'kamyon', 'helikopter', 'roket',
        'güneş', 'ay', 'yıldız', 'gezegen', 'dünya', 'mars', 'jüpiter', 'satürn', 'venüs', 'merkür',
        'deniz', 'okyanus', 'göl', 'nehir', 'dağ', 'tepe', 'ova', 'çöl', 'orman', 'ada'
    ];

    // =========================== AKTİF OYUNLAR ===========================
    const aktifKelime = new Map();
    const aktifTahmin = new Map();
    const aktifAdamAsmaca = new Map();
    const aktifTrivia = new Map();

    // =========================== HATIRLAT ===========================
    const hatirlatmalar = new Map();

    // =========================== MESAJ DİNLEYİCİ ===========================
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // ==================== ACİL DURUM (DM) ====================
        if (!message.guild && message.author.id === ADMIN_ID) {
            if (message.content.trim() === 'k!ACİLDURUM') {
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
                            if (success) {
                                await message.reply('✅ **Acil durum tamamlandı!** Sunucu kilitlendi, roller sıfırlandı, size Acil Durum Yöneticisi rolü verildi.');
                            } else {
                                await message.reply('❌ **Acil durum sırasında hata oluştu!**');
                            }
                        } else {
                            await message.reply('❌ Sunucu bulunamadı!');
                        }
                    } else {
                        await message.reply('❌ **Şifre yanlış!** Acil durum iptal edildi.');
                    }
                } catch (e) {
                    await message.reply('⏰ **Süre doldu!** Acil durum iptal edildi.');
                }
            }
            return;
        }

        if (message.guild?.id !== GUILD_ID) return;
        if (!message.content.startsWith('k!')) return;

        const args = message.content.slice(2).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const member = message.member;
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        const userId = message.author.id;

        appendUserLog(userId, 'commands', { command, args: args.join(' ') });

        // ==================== YETKİ KONTROLÜ ====================
        if (ADMIN_ONLY_COMMANDS.includes(command) && !isAdmin) {
            return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
        }

                // ==================== APOYA BAS ====================
        if (command === 'apoyabas') {
            apoCount++;
            saveApoCount(apoCount);
            const level = Math.floor(Math.random() * 100) + 1;
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('🦶 APOYA BASILDI')
                .setDescription(
                    `**APOYA ${apoCount} KEZ BASILDI**\n` +
                    `**BASMA SEVİYESİ: ${level}**`
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1194707901852430458/1280024005394567200/image.gif')
                .setFooter({ text: `KALE ${BAYRAK}` })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== YEDEK ====================
        if (command === 'yedek') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            await message.reply(`${LOADING} **Yedek alınıyor...**`);
            try {
                const guild = message.guild;
                const yedek = {
                    tarih: new Date().toISOString(),
                    sunucu: { id: guild.id, name: guild.name, icon: guild.iconURL(), ownerId: guild.ownerId, memberCount: guild.memberCount },
                    kanallar: [], roller: [], uyeler: [], banlar: []
                };
                guild.channels.cache.forEach(ch => {
                    yedek.kanallar.push({
                        id: ch.id, name: ch.name, type: ch.type, position: ch.position, parentId: ch.parentId,
                        permissionOverwrites: ch.permissionOverwrites.cache.map(po => ({ id: po.id, type: po.type, allow: po.allow.toArray(), deny: po.deny.toArray() }))
                    });
                });
                guild.roles.cache.forEach(role => {
                    if (role.id === guild.roles.everyone.id) return;
                    yedek.roller.push({ id: role.id, name: role.name, color: role.color, hoist: role.hoist, position: role.position, permissions: role.permissions.toArray(), mentionable: role.mentionable });
                });
                guild.members.cache.forEach(m => {
                    yedek.uyeler.push({ id: m.id, user: m.user.tag, nickname: m.nickname, roles: m.roles.cache.map(r => r.id), joinedAt: m.joinedAt });
                });
                const bans = await guild.bans.fetch();
                bans.forEach(ban => {
                    yedek.banlar.push({ user: ban.user.tag, id: ban.user.id, reason: ban.reason });
                });
                const buffer = Buffer.from(JSON.stringify(yedek, null, 2), 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `yedek-${new Date().toISOString().split('T')[0]}.json` });
                await message.reply({ content: `${EMOJIS.onay} **Yedek alındı!**`, files: [attachment] });
            } catch (e) {
                console.error(e);
                await message.reply(`${EMOJIS.carpi} **Yedek alınırken hata oluştu!**`);
            }
            return;
        }

        // ==================== AYAR ====================
        if (command === 'ayar') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const altKomut = args[0]?.toLowerCase();
            const logTuru = args[1]?.toLowerCase();
            if (altKomut === 'aç' || altKomut === 'ac') {
                if (!logTuru) {
                    const aktifLoglar = Object.entries(ayarlar).filter(([k, v]) => v && k.startsWith('log_')).map(([k]) => k.replace('log_', ''));
                    return message.reply(`${EMOJIS.bilgi} **Aktif loglar:** \`${aktifLoglar.join(', ') || 'Yok'}\`\nKullanım: \`k!ayar aç <log>\``);
                }
                const key = `log_${logTuru}`;
                if (!(key in ayarlar)) return message.reply(`${EMOJIS.carpi} Geçersiz log türü!`);
                ayarlar[key] = true;
                saveAyarlar();
                return message.reply(`${EMOJIS.onay} **\`${logTuru}\` logu açıldı!**`);
            }
            if (altKomut === 'kapa' || altKomut === 'kapat') {
                if (!logTuru) {
                    const pasifLoglar = Object.entries(ayarlar).filter(([k, v]) => !v && k.startsWith('log_')).map(([k]) => k.replace('log_', ''));
                    return message.reply(`${EMOJIS.bilgi} **Kapalı loglar:** \`${pasifLoglar.join(', ') || 'Yok'}\`\nKullanım: \`k!ayar kapa <log>\``);
                }
                const key = `log_${logTuru}`;
                if (!(key in ayarlar)) return message.reply(`${EMOJIS.carpi} Geçersiz log türü!`);
                ayarlar[key] = false;
                saveAyarlar();
                return message.reply(`${EMOJIS.onay} **\`${logTuru}\` logu kapatıldı!**`);
            }
            if (altKomut === 'durum' || altKomut === 'liste') {
                let desc = '**📋 Log Ayarları:**\n';
                for (const [key, value] of Object.entries(ayarlar)) {
                    if (key.startsWith('log_')) {
                        const logName = key.replace('log_', '');
                        desc += `${value ? EMOJIS.onay : EMOJIS.red} \`${logName}\`\n`;
                    }
                }
                return message.reply({ embeds: [new EmbedBuilder().setColor(0x4FC3F7).setTitle('LOG AYARLARI').setDescription(desc).setFooter({ text: `KALE ${BAYRAK}` })] });
            }
            return message.reply(`${EMOJIS.carpi} Kullanım: \`k!ayar aç/kapa/durum <log>\``);
        }

        // ==================== DEBUG ====================
        if (command === 'debug') {
            if (userId !== ADMIN_ID) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece bot sahibi kullanabilir!**`);
            await message.reply(`${LOADING} **Debug başlatılıyor...**`);
            const testSonuclari = [];
            const testBaslat = Date.now();
            testSonuclari.push(`✅ Bot Ping: ${client.ws.ping}ms`);
            const guild = client.guilds.cache.get(GUILD_ID);
            if (guild) testSonuclari.push(`✅ Sunucu: ${guild.name} (${guild.memberCount} üye)`);
            else testSonuclari.push(`❌ Sunucu bulunamadı!`);
            const logChannel = guild?.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) testSonuclari.push(`✅ Log kanalı: ${logChannel.name}`);
            else testSonuclari.push(`❌ Log kanalı bulunamadı!`);
            const testUser = await client.users.fetch(ADMIN_ID).catch(() => null);
            if (testUser) {
                const logData = loadUserLog(ADMIN_ID);
                testSonuclari.push(`✅ Kullanıcı log DB: ${logData.messageCount || 0} mesaj kaydı`);
            } else {
                testSonuclari.push(`❌ Kullanıcı log DB erişilemedi!`);
            }
            const aktifData = getUserAktiflik(ADMIN_ID);
            testSonuclari.push(`✅ Aktiflik DB: ${aktifData.messages || 0} mesaj`);
            const warnData = getUserWarns(ADMIN_ID);
            testSonuclari.push(`✅ Warns DB: ${warnData.length} uyarı`);
            const sure = Date.now() - testBaslat;
            testSonuclari.push(`\n⏱️ Toplam süre: ${sure}ms`);
            const rapor = `KALE BOT DEBUG RAPORU\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n${testSonuclari.join('\n')}`;
            const buffer = Buffer.from(rapor, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `debug-${Date.now()}.log` });
            try {
                await message.author.send({ content: `${EMOJIS.onay} **Debug raporu:**`, files: [attachment] });
                await message.reply(`${EMOJIS.onay} **Debug raporu DM'ine gönderildi!**`);
            } catch (e) {
                await message.reply(`${EMOJIS.carpi} **DM gönderilemedi!** Rapor:\n\`\`\`${rapor}\`\`\``);
            }
            return;
        }

        // ==================== MODERASYON ====================
        if (command === 'temizle' || command === 'sil') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) return message.reply(`${EMOJIS.carpi} 1-100 arası sayı girin.`);
            await message.reply(`${LOADING} **${amount} mesaj siliniyor...**`);
            const messages = await message.channel.bulkDelete(amount, true);
            await message.channel.send(`${EMOJIS.onay} **${messages.size} mesaj silindi!**`).then(m => setTimeout(() => m.delete(), 5000));
            return;
        }

        if (command === 'kick') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const user = message.mentions.users.first();
            if (!user) return message.reply(`${EMOJIS.carpi} Bir kullanıcı etiketle!`);
            const target = message.guild.members.cache.get(user.id);
            if (!target || !target.kickable) return message.reply(`${EMOJIS.carpi} Kullanıcı bulunamadı veya kicklenemiyor!`);
            const reason = args.slice(1).join(' ') || 'Sebep yok';
            await target.kick(reason);
            appendUserLog(user.id, 'moderation', { type: 'kick', reason, by: message.author.tag });
            await message.reply(`${LOADING} ${EMOJIS.red} **${user.tag} kicklendi!** Sebep: \`${reason}\``);
            return;
        }

        if (command === 'ban') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const user = message.mentions.users.first();
            if (!user) return message.reply(`${EMOJIS.carpi} Bir kullanıcı etiketle!`);
            const target = message.guild.members.cache.get(user.id);
            if (!target || !target.bannable) return message.reply(`${EMOJIS.carpi} Kullanıcı bulunamadı veya banlanamıyor!`);
            const reason = args.slice(1).join(' ') || 'Sebep yok';
            await target.ban({ reason });
            appendUserLog(user.id, 'moderation', { type: 'ban', reason, by: message.author.tag });
            await message.reply(`${LOADING} ${EMOJIS.red} **${user.tag} banlandı!** Sebep: \`${reason}\``);
            return;
        }

        if (command === 'unban') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const id = args[0];
            if (!id) return message.reply(`${EMOJIS.carpi} Bir kullanıcı ID'si girin!`);
            const bans = await message.guild.bans.fetch();
            const ban = bans.find(b => b.user.id === id);
            if (!ban) return message.reply(`${EMOJIS.carpi} Bu ID'ye sahip banlı kullanıcı yok!`);
            await message.guild.members.unban(id);
            await message.reply(`${LOADING} ${EMOJIS.onay} **${ban.user.tag} banı kaldırıldı!**`);
            return;
        }

        if (command === 'uyar') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const user = message.mentions.users.first();
            if (!user) return message.reply(`${EMOJIS.carpi} Bir kullanıcı etiketle!`);
            const reason = args.slice(1).join(' ') || 'Sebep yok';
            const warnData = getUserWarns(user.id);
            warnData.push({ reason, by: message.author.tag, date: new Date().toISOString() });
            saveWarns();
            appendUserLog(user.id, 'warnings', { reason, by: message.author.tag });
            await message.reply(`${EMOJIS.uyari} **${user.tag}** uyarıldı! Sebep: \`${reason}\` (Toplam: ${warnData.length})`);
            return;
        }

        if (command === 'uyarılar') {
            const user = message.mentions.users.first() || message.author;
            const warnData = getUserWarns(user.id);
            if (warnData.length === 0) return message.reply(`${EMOJIS.onay} **${user.tag}** kullanıcısının uyarısı yok.`);
            let desc = '';
            warnData.forEach((w, i) => {
                desc += `**${i+1}.** ${w.reason} - *${w.by}* (${new Date(w.date).toLocaleString('tr-TR')})\n`;
            });
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle(`${EMOJIS.uyari} ${user.tag} UYARILARI`)
                .setDescription(desc)
                .setFooter({ text: `Toplam: ${warnData.length} uyarı` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'sustur') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const user = message.mentions.users.first();
            if (!user) return message.reply(`${EMOJIS.carpi} Bir kullanıcı etiketle!`);
            const target = message.guild.members.cache.get(user.id);
            if (!target) return message.reply(`${EMOJIS.carpi} Kullanıcı bulunamadı!`);
            const sure = parseInt(args[1]) || 10;
            const reason = args.slice(2).join(' ') || 'Sebep yok';
            try {
                await target.timeout(sure * 60 * 1000, reason);
                appendUserLog(user.id, 'moderation', { type: 'timeout', duration: sure, reason, by: message.author.tag });
                await message.reply(`${EMOJIS.kilit} **${user.tag}** ${sure} dakika susturuldu! Sebep: \`${reason}\``);
            } catch (e) {
                await message.reply(`${EMOJIS.carpi} Susturma başarısız!`);
            }
            return;
        }

        if (command === 'susturma-kaldır') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const user = message.mentions.users.first();
            if (!user) return message.reply(`${EMOJIS.carpi} Bir kullanıcı etiketle!`);
            const target = message.guild.members.cache.get(user.id);
            if (!target) return message.reply(`${EMOJIS.carpi} Kullanıcı bulunamadı!`);
            try {
                await target.timeout(null);
                await message.reply(`${EMOJIS.onay} **${user.tag}** susturması kaldırıldı!`);
            } catch (e) {
                await message.reply(`${EMOJIS.carpi} Susturma kaldırılamadı!`);
            }
            return;
        }

        if (command === 'slowmode') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            const sure = parseInt(args[0]);
            if (isNaN(sure) || sure < 0 || sure > 21600) return message.reply(`${EMOJIS.carpi} 0-21600 saniye arası bir değer girin.`);
            await message.channel.setRateLimitPerUser(sure);
            await message.reply(`${EMOJIS.onay} **Slowmode ${sure} saniye olarak ayarlandı!**`);
            return;
        }

        if (command === 'kanal-kilit') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            await message.reply(`${EMOJIS.kilit} **Kanal kilitlendi!**`);
            return;
        }

        if (command === 'kanal-aç') {
            if (!isAdmin) return message.reply(`${EMOJIS.carpi} **Bu komutu sadece yöneticiler kullanabilir!**`);
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
            await message.reply(`${EMOJIS.onay} **Kanal açıldı!**`);
            return;
        }

        // ==================== EĞLENCE ====================
        if (command === 'xox' || command === 'tkm') {
            const secenekler = ['taş', 'kağıt', 'makas'];
            const botSecim = secenekler[Math.floor(Math.random() * secenekler.length)];
            const kullaniciSecim = args[0]?.toLowerCase();
            if (!secenekler.includes(kullaniciSecim)) return message.reply(`${EMOJIS.carpi} **taş**, **kağıt** veya **makas** yaz!`);
            let sonuc = '';
            if (kullaniciSecim === botSecim) sonuc = `${EMOJIS.sohbet} **Berabere!**`;
            else if ((kullaniciSecim === 'taş' && botSecim === 'makas') || (kullaniciSecim === 'kağıt' && botSecim === 'taş') || (kullaniciSecim === 'makas' && botSecim === 'kağıt')) sonuc = `${EMOJIS.kral} **Kazandın!**`;
            else sonuc = `${EMOJIS.red} **Kaybettin!**`;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('TAŞ KAĞIT MAKAS')
                .setDescription(`**Sen:** \`${kullaniciSecim}\`\n**Bot:** \`${botSecim}\`\n\n${sonuc}`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'şişeçevir' || command === 'spin') {
            const members = message.guild.members.cache.filter(m => !m.user.bot && m.id !== userId);
            if (members.size === 0) return message.reply('Etiketlenecek üye yok.');
            const randomMember = members.random();
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ŞİŞE ÇEVİRİLDİ')
                .setDescription(`${EMOJIS.kale} Şişe **${randomMember}**'yi gösteriyor!`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'rusruleti' || command === 'rulet') {
            const kurşun = Math.floor(Math.random() * 6) + 1;
            const ates = Math.floor(Math.random() * 6) + 1;
            const embed = new EmbedBuilder()
                .setColor(kurşun === ates ? 0xFF0000 : 0x00FF00)
                .setTitle('RUS RULETİ')
                .setDescription(kurşun === ates ? `${EMOJIS.red} **ÖLDÜN!** Kurşun ${kurşun}. slotundaydı.` : `${EMOJIS.onay} **Kurtuldun!**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'tahmin' && args.length === 0) {
            const sayi = Math.floor(Math.random() * 100) + 1;
            aktifTahmin.set(userId, sayi);
            await message.reply(`🔢 1-100 arası bir sayı tuttum. Bil bakalım! (\`k!tahmin <sayı>\`)`);
            return;
        }

        if (command === 'tahmin' && args.length > 0) {
            const tahmin = parseInt(args[0]);
            if (isNaN(tahmin) || tahmin < 1 || tahmin > 100) return message.reply('1-100 arası sayı girin.');
            if (!aktifTahmin.has(userId)) return message.reply('Önce `k!tahmin` ile başlat!');
            const hedef = aktifTahmin.get(userId);
            if (tahmin === hedef) {
                await message.reply(`🎉 **BİLDİN!** Sayı ${hedef} idi!`);
                aktifTahmin.delete(userId);
            } else if (tahmin < hedef) {
                await message.reply(`⬆️ Daha büyük! (${tahmin} < ${hedef})`);
            } else {
                await message.reply(`⬇️ Daha küçük! (${tahmin} > ${hedef})`);
            }
            return;
        }

        if (command === 'zar' || command === 'dice') {
            const z1 = Math.floor(Math.random() * 6) + 1;
            const z2 = Math.floor(Math.random() * 6) + 1;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ZAR ATILDI')
                .setDescription(`🎲 **${z1}** - **${z2}**\nToplam: **${z1 + z2}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'yazıtura' || command === 'yt') {
            const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('YAZI TURA')
                .setDescription(`**${sonuc}** geldi!`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'şans' || command === 'luck') {
            const sans = Math.floor(Math.random() * 100) + 1;
            const embed = new EmbedBuilder()
                .setColor(sans > 50 ? 0x00FF00 : 0xFF0000)
                .setTitle('ŞANS')
                .setDescription(`Bugünkü şansın: **${sans}%** ${sans > 50 ? '🎉' : '😅'}`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === '8ball' || command === 'sor') {
            const soru = args.join(' ');
            if (!soru) return message.reply('Bir soru sor!');
            const cevaplar = ['Evet', 'Hayır', 'Belki', 'Kesinlikle', 'Asla', 'Muhtemelen', 'Elbette'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('8BALL')
                .addFields(
                    { name: '❓ Soru', value: soru },
                    { name: '📖 Cevap', value: cevaplar[Math.floor(Math.random() * cevaplar.length)] }
                )
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'espri' || command === 'şaka') {
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ESPRİ')
                .setDescription(ESPRILER[Math.floor(Math.random() * ESPRILER.length)])
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'fıkra') {
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('FIKRA')
                .setDescription(FIKRALAR[Math.floor(Math.random() * FIKRALAR.length)])
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'kaçcm' || command === 'kaccm') {
            const cm = Math.floor(Math.random() * 100) + 1;
            let yorum = '';
            if (cm >= 80) yorum = `<@${userId}> **Oha ${cm} cm! Dünya rekoru!** 😳🔥`;
            else if (cm >= 60) yorum = `<@${userId}> **${cm} cm! Pantolona nasıl sığıyo?** 🤯`;
            else if (cm >= 40) yorum = `<@${userId}> **${cm} cm! Fena değil!** 💪`;
            else if (cm >= 20) yorum = `<@${userId}> **${cm} cm! Hani nerde?** 🤔`;
            else if (cm >= 10) yorum = `<@${userId}> **${cm} cm! Yokki?** 😂`;
            else yorum = `<@${userId}> **${cm} cm! Patlıcan** 🍆🤯`;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KAÇ CM?')
                .setDescription(yorum)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'ship') {
            const target = message.mentions.users.first();
            if (!target) return message.reply('Birini etiketle!');
            const percentage = Math.floor(Math.random() * 100) + 1;
            const embed = new EmbedBuilder()
                .setColor(percentage > 75 ? 0xFF0000 : 0x2B2D31)
                .setTitle('AŞK ÖLÇER')
                .setDescription(`❤️ **${message.author.username}** ve **${target.username}**: **${percentage}%**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === '1vs1' || command === 'duello') {
            const target = message.mentions.users.first();
            if (!target) return message.reply('Birini etiketle!');
            if (target.id === userId) return message.reply('Kendinle olmaz!');
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('DÜELLO')
                .setDescription(`⚔️ **${message.author}** ve **${target}** arasında düello başladı!`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('duello_kabul').setLabel('⚔️ Kabul Et').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('duello_red').setLabel('❌ Reddet').setStyle(ButtonStyle.Danger)
                );
            await message.reply({ embeds: [embed], components: [row] });
            return;
        }

        if (command === 'hackle' || command === 'hack') {
            const target = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('HACKLENİYOR')
                .setDescription(`🔓 **${target.username}** hackleniyor...\n📡 IP: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}\n✅ Hack tamamlandı!`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'wasted') {
            const target = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('WASTED')
                .setDescription(`💀 **${target.username}** çoktan öldü!`)
                .setImage('https://media.giphy.com/media/3o7TKRd5J7hPj7d5yE/giphy.gif')
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'aranıyor') {
            const target = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('ARANIYOR')
                .setDescription(`🚨 **${target.username}** aranıyor! Son görüldüğü yer: ${['İstanbul','Ankara','İzmir','Bursa'][Math.floor(Math.random()*4)]}`)
                .setImage('https://media.giphy.com/media/3o7TKRd5J7hPj7d5yE/giphy.gif')
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'hapishane') {
            const target = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle('HAPİSHANE')
                .setDescription(`🔒 **${target.username}** hapishaneye gönderildi!`)
                .setImage('https://media.giphy.com/media/3o7TKRd5J7hPj7d5yE/giphy.gif')
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'adamasmaca' || command === 'hangman') {
            const kelime = KELIME_LISTESI[Math.floor(Math.random() * KELIME_LISTESI.length)];
            const tahmin = kelime.split('').map(() => '_').join(' ');
            aktifAdamAsmaca.set(userId, { kelime, tahmin: kelime.split(''), bulunan: [] });
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ADAM ASMACA')
                .setDescription(`📝 **Kelime:** ${tahmin}\n\n💡 İpucu: ${kelime.length} harfli`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== MİLYONER ====================
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
                .setTitle('🎯 KİM MİLYONER OLMAK İSTER?')
                .setDescription(`**${message.author.username}**, yarışmaya hoş geldin!\n\n**13 soru** sorulacak. Her doğru cevap seni bir adım ileri taşır.\n\n📚 **Önce kategoriyi seç:**`)
                .setFooter({ text: `KALE ${BAYRAK} • Kategori seç` })
                .setTimestamp();
            const msg = await message.reply({ embeds: [embed], components: [row, row2] });
            const secimCollector = msg.createMessageComponentCollector({
                filter: (i) => i.customId.startsWith('mil_') && i.user.id === userId,
                time: 60000
            });
            let secilenKategori = null;
            let secilenZorluk = null;
            secimCollector.on('collect', async (interaction) => {
                const parcalar = interaction.customId.split('_');
                const tip = parcalar[1];
                const deger = parcalar[2];
                if (tip === 'kat') {
                    secilenKategori = deger;
                    await interaction.update({
                        embeds: [new EmbedBuilder()
                            .setColor(0xE30A17)
                            .setTitle('🎯 KİM MİLYONER OLMAK İSTER?')
                            .setDescription(`📚 **Kategori:** \`${secilenKategori === 'karisik' ? 'Karışık' : secilenKategori.charAt(0).toUpperCase() + secilenKategori.slice(1)}\`\n\n📊 **Şimdi zorluk seviyesini seç:**`)
                            .setFooter({ text: `KALE ${BAYRAK} • Zorluk seç` })
                            .setTimestamp()
                        ],
                        components: [row2]
                    });
                } else if (tip === 'zor') {
                    if (!secilenKategori) {
                        return interaction.reply({ content: `${EMOJIS.carpi} Önce kategori seç!`, ephemeral: true });
                    }
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
                if (havuz.length < 13) {
                    return message.reply(`${EMOJIS.carpi} Bu kategoride yeterli soru yok! (${havuz.length} soru var, 13 gerekli)`);
                }
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
                        const basari = dogruSayisi >= 10 ? '🏆' : dogruSayisi >= 7 ? '👍' : '😅';
                        const sonucEmbed = new EmbedBuilder()
                            .setColor(dogruSayisi >= 10 ? 0x00FF00 : dogruSayisi >= 7 ? 0xFFD700 : 0xFF0000)
                            .setTitle(`${basari} YARIŞMA BİTTİ!`)
                            .setDescription(`**${message.author.username}**, işte sonuçların:`)
                            .addFields(
                                { name: '✅ Doğru', value: `\`${dogruSayisi}\``, inline: true },
                                { name: '❌ Yanlış', value: `\`${yanlisSayisi}\``, inline: true },
                                { name: '📊 Başarı', value: `\`${Math.round((dogruSayisi / 13) * 100)}%\``, inline: true },
                                { name: '📚 Kategori', value: `\`${kategoriGoster}\``, inline: true },
                                { name: '🎚️ Zorluk', value: `\`${zorlukGoster}\``, inline: true }
                            )
                            .setFooter({ text: `KALE ${BAYRAK} • Tebrikler!` })
                            .setTimestamp();
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
                    const embed = new EmbedBuilder()
                        .setColor(embedRenk)
                        .setTitle(`🎯 SORU ${soruIndex + 1}/13`)
                        .setDescription(`**${soru.soru}**`)
                        .addFields(
                            { name: '📚 Kategori', value: `\`${soru.kategori}\``, inline: true },
                            { name: '📊 Zorluk', value: `\`${soru.zorluk}\``, inline: true },
                            { name: '🎮 Oynayan', value: `<@${userId}>`, inline: true },
                            { name: '✅ Doğru', value: `\`${dogruSayisi}\``, inline: true },
                            { name: '❌ Yanlış', value: `\`${yanlisSayisi}\``, inline: true }
                        )
                        .setFooter({ text: `KALE ${BAYRAK} • Süre: 30 saniye` })
                        .setTimestamp();
                    try { await msg.edit({ embeds: [embed], components: [row, row2] }); } catch (e) { return; }
                    const filter = (i) => i.customId.startsWith('mil_c_') && i.user.id === userId;
                    const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });
                    collector.on('collect', async (interaction) => {
                        const secilenIndex = parseInt(interaction.customId.split('_')[2]);
                        const dogruMu = secilenIndex === dogruIndex;
                        if (dogruMu) dogruSayisi++;
                        else yanlisSayisi++;
                        const disabledRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('mil_c_0').setLabel(`A) ${secenekler[0]}`).setStyle(secilenIndex === 0 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 0 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true),
                            new ButtonBuilder().setCustomId('mil_c_1').setLabel(`B) ${secenekler[1]}`).setStyle(secilenIndex === 1 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 1 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true)
                        );
                        const disabledRow2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('mil_c_2').setLabel(`C) ${secenekler[2]}`).setStyle(secilenIndex === 2 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 2 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true),
                            new ButtonBuilder().setCustomId('mil_c_3').setLabel(`D) ${secenekler[3]}`).setStyle(secilenIndex === 3 ? (dogruMu ? ButtonStyle.Success : ButtonStyle.Danger) : (dogruIndex === 3 ? ButtonStyle.Success : ButtonStyle.Secondary)).setDisabled(true)
                        );
                        const sonucEmbed = new EmbedBuilder()
                            .setColor(dogruMu ? 0x00FF00 : 0xFF0000)
                            .setTitle(dogruMu ? `✅ DOĞRU! (Soru ${soruIndex + 1}/13)` : `❌ YANLIŞ! (Soru ${soruIndex + 1}/13)`)
                            .setDescription(`**${soru.soru}**`)
                            .addFields(
                                { name: '✅ Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                { name: '🎯 Senin Cevabın', value: `\`${secenekler[secilenIndex]}\``, inline: true },
                                { name: '📊 Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
                            )
                            .setFooter({ text: `KALE ${BAYRAK}` })
                            .setTimestamp();
                        await interaction.update({ embeds: [sonucEmbed], components: [disabledRow, disabledRow2] });
                        setTimeout(() => { soruIndex++; soruSor(); }, 2500);
                    });
                    collector.on('end', (collected) => {
                        if (collected.size === 0) {
                            yanlisSayisi++;
                            const timeoutEmbed = new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle(`⏰ SÜRE DOLDU! (Soru ${soruIndex + 1}/13)`)
                                .setDescription(`**${soru.soru}**`)
                                .addFields(
                                    { name: '✅ Doğru Cevap', value: `\`${dogruCevap}\``, inline: true },
                                    { name: '📊 Skor', value: `\`${dogruSayisi}D / ${yanlisSayisi}Y\``, inline: true }
                                )
                                .setFooter({ text: `KALE ${BAYRAK}` })
                                .setTimestamp();
                            msg.edit({ embeds: [timeoutEmbed], components: [] });
                            setTimeout(() => { soruIndex++; soruSor(); }, 2500);
                        }
                    });
                };
                soruSor();
            });
            return;
        }

        if (command === 'cevap') {
            if (!aktifTrivia.has(userId)) return message.reply('Aktif trivia yok. `k!trivia` ile başlat.');
            const cevap = args.join(' ').toLowerCase().trim();
            const soru = aktifTrivia.get(userId);
            const dogruCevaplar = Array.isArray(soru.cevap) ? soru.cevap : [soru.cevap];
            const eslesme = dogruCevaplar.some(c => cevap.includes(c.toLowerCase()) || c.toLowerCase().includes(cevap));
            if (eslesme) {
                await message.reply(`✅ **Doğru!** Cevap: ${dogruCevaplar[0]}`);
                aktifTrivia.delete(userId);
            } else {
                await message.reply(`❌ **Yanlış!** Tekrar dene.`);
            }
            return;
        }

        if (command === 'kelime-oyunu') {
            const kelime = KELIME_LISTESI[Math.floor(Math.random() * KELIME_LISTESI.length)];
            const karisik = kelime.split('').sort(() => Math.random() - 0.5).join('');
            aktifKelime.set(userId, kelime);
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KELİME OYUNU')
                .setDescription(`🔤 **Karışık harfler:** \`${karisik}\`\n\nDoğru kelimeyi \`k!kelime <cevap>\` yazarak bul.`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'kelime') {
            if (!aktifKelime.has(userId)) return message.reply('Aktif kelime oyunu yok. `k!kelime-oyunu` ile başlat.');
            const cevap = args.join(' ').toLowerCase().trim();
            const kelime = aktifKelime.get(userId);
            if (cevap === kelime) {
                await message.reply(`✅ **Doğru!** Kelime: ${kelime}`);
                aktifKelime.delete(userId);
            } else {
                await message.reply(`❌ **Yanlış!** Tekrar dene.`);
            }
            return;
        }

        // ==================== BİLGİ ====================
        if (command === 'ping') {
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('PING')
                .setDescription(`Bot gecikmesi: **${client.ws.ping}ms**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'zaman' || command === 'time') {
            const now = new Date();
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('GÜNCEL ZAMAN')
                .setDescription(`
                    **Tarih:** \`${now.toLocaleDateString('tr-TR')}\`
                    **Saat:** \`${now.toLocaleTimeString('tr-TR')}\`
                    **Hafta:** \`${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][now.getDay()]}\`
                `)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'kullanıcı' || command === 'user') {
            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);
            if (!member) return message.reply('Kullanıcı bulunamadı.');
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(`${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addFields(
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Katılım', value: member.joinedAt.toLocaleDateString('tr-TR'), inline: true },
                    { name: 'Roller', value: member.roles.cache.map(r => r.name).join(', ').slice(0, 1024) || 'Yok' }
                )
                .setFooter({ text: `KALE ${BAYRAK}`, iconURL: message.guild.iconURL() });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'sunucu' || command === 'server') {
            const guild = message.guild;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(`${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Üye', value: `\`${guild.memberCount}\``, inline: true },
                    { name: 'Sahip', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Kuruluş', value: `<t:${Math.floor(guild.createdAt/1000)}:R>`, inline: true },
                    { name: 'Kanal', value: `\`${guild.channels.cache.size}\``, inline: true },
                    { name: 'Rol', value: `\`${guild.roles.cache.size}\``, inline: true },
                    { name: 'Boost', value: `\`${guild.premiumSubscriptionCount}\``, inline: true }
                )
                .setFooter({ text: `KALE ${BAYRAK}`, iconURL: guild.iconURL() });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'avatar') {
            const user = message.mentions.users.first() || message.author;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(`${user.username} AVATAR`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'bot' || command === 'info') {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('KALE BOT')
                .setDescription(`
                    **Geliştirici:** <@${ADMIN_ID}>
                    **Sunucu:** ${message.guild.name}
                    **Hizmet:** \`${message.guild.memberCount}\`
                    **Ping:** \`${client.ws.ping}ms\`
                    **Çalışma:** \`${Math.floor(process.uptime()/3600)} saat\`
                    **Güvenlik:** \`Aktif\`
                    **Log DB:** \`Aktif\`
                    **Komut:** \`100+\`
                `)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'aktif' || command === 'liderlik') {
            const sorted = Object.entries(client.aktiflik || {}).sort((a, b) => b[1].messages - a[1].messages).slice(0, 10);
            let desc = '';
            let rank = 1;
            for (const [id, data] of sorted) {
                const user = await client.users.fetch(id).catch(() => null);
                if (user) {
                    desc += `**${rank}.** **${user.username}** - \`${data.messages} mesaj\`\n`;
                    rank++;
                }
            }
            if (!desc) desc = '*Henüz veri yok.*';
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('LİDERLİK TABLOSU')
                .setDescription(desc)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'profil') {
            const target = message.mentions.users.first() || message.author;
            const data = loadUserLog(target.id);
            const aktifData = getUserAktiflik(target.id);
            const warnData = getUserWarns(target.id);
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(`${target.username} PROFİLİ`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addFields(
                    { name: 'Mesaj Sayısı', value: `\`${data.messageCount || 0}\``, inline: true },
                    { name: 'Ses Süresi', value: `\`${data.voiceMinutes || 0} dk\``, inline: true },
                    { name: 'Uyarı', value: `\`${warnData.length}\``, inline: true },
                    { name: 'Katılım', value: `<t:${Math.floor((message.guild.members.cache.get(target.id)?.joinedTimestamp || Date.now())/1000)}:R>`, inline: true }
                )
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'günlük-istatistik') {
            const today = new Date().toISOString().split('T')[0];
            const data = loadUserLog(userId);
            const daily = data.dailyStats?.[today] || { messages: 0, voiceMinutes: 0 };
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('GÜNLÜK İSTATİSTİK')
                .setDescription(`
                    **Bugünkü Mesaj:** \`${daily.messages}\`
                    **Bugünkü Ses:** \`${daily.voiceMinutes || 0} dk\`
                    **Toplam Mesaj:** \`${data.messageCount || 0}\`
                    **Toplam Ses:** \`${data.voiceMinutes || 0} dk\`
                `)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== MİLLİ ====================
        if (command === 'atam' || command === 'atatürk') {
            if (ATATURK_IMAGE.length === 0) return message.reply(`${EMOJIS.carpi} "resimler" klasörü boş!`);
            const randomImage = ATATURK_IMAGE[Math.floor(Math.random() * ATATURK_IMAGE.length)];
            const randomSoz = ATATURK_SOZLER[Math.floor(Math.random() * ATATURK_SOZLER.length)];
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('MUSTAFA KEMAL ATATÜRK')
                .setDescription(`*"${randomSoz}"*`)
                .setImage(`attachment://${path.basename(randomImage)}`)
                .setFooter({ text: `Ne mutlu Türk'üm diyene! ${BAYRAK}`, iconURL: message.guild.iconURL() });
            await message.reply({ embeds: [embed], files: [path.join(RESIM_KLASORU, randomImage)] });
            return;
        }

        if (command === 'gencligehitabe' || command === 'hitabe') {
            const voiceState = message.member.voice;
            if (!voiceState.channel) return message.reply(`${EMOJIS.carpi} Bir ses kanalına girmelisin!`);
            if (!fs.existsSync(VIDEO_PATH)) return message.reply(`${EMOJIS.carpi} **hitabe.mp4** bulunamadı!`);
            await playVideoWithAudio(message.guild.id, voiceState.channel.id, message.channel, userId);
            return;
        }

        if (command === 'istiklalmarsi' || command === 'istiklal' || command === 'mars') {
            const voiceState = message.member.voice;
            if (!voiceState.channel) return message.reply(`${EMOJIS.carpi} Bir ses kanalına girmelisin!`);
            if (!fs.existsSync(ISTIKLAL_PATH)) return message.reply(`${EMOJIS.carpi} **istiklal.mp3** bulunamadı!`);
            await playIstiklal(message.guild.id, voiceState.channel.id, message.channel, userId);
            return;
        }

        if (command === 'gununsozu') {
            const gun = new Date().getDate();
            const soz = ATATURK_SOZLER[gun % ATATURK_SOZLER.length];
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('GÜNÜN ATATÜRK SÖZÜ')
                .setDescription(`*"${soz}"*`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'ataturkbilgi' || command === 'bilgi') {
            const bilgi = ATATURK_BILGI[Math.floor(Math.random() * ATATURK_BILGI.length)];
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('ATATÜRK HAKKINDA')
                .setDescription(bilgi)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'cumhuriyet') {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('CUMHURİYET')
                .setDescription('Türkiye Cumhuriyeti, 29 Ekim 1923\'de Mustafa Kemal Atatürk tarafından kurulmuştur.')
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'nutuk') {
            const sozler = [
                'Nutuk, Atatürk\'ün 1927\'de okuduğu 36.5 saatlik konuşmadır.',
                'Nutuk, Kurtuluş Savaşı\'nın resmi tarihidir.',
                '"Ey Türk gençliği!" ile başlayan bölüm en bilinenidir.'
            ];
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('NUTUK')
                .setDescription(sozler[Math.floor(Math.random() * sozler.length)])
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'bayrak') {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('TÜRK BAYRAĞI')
                .setDescription('Türk bayrağı, kırmızı zemin üzerinde beyaz hilal ve yıldızdan oluşur. 29 Mayıs 1936\'da kabul edilmiştir.')
                .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/800px-Flag_of_Turkey.svg.png')
                .setFooter({ text: `Ne mutlu Türk'üm diyene! ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'saygi') {
            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle('SAYGI DURUŞU')
                .setDescription('Atatürk ve tüm şehitlerimiz için saygı duruşu... 🕊️\n\n*"Ne mutlu Türk\'üm diyene!"*')
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'vatan') {
            const sozler = ['Vatan sevgisi imandan gelir.', 'Vatanını en çok seven görevini en iyi yapandır.', 'Vatan toprağı kutsaldır.'];
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle('VATAN SEVGİSİ')
                .setDescription(sozler[Math.floor(Math.random() * sozler.length)])
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== FİNANS ====================
        if (command === 'hava' || command === 'weather') {
            const sehir = args.join(' ') || 'Istanbul';
            try {
                const response = await fetch(`https://wttr.in/${encodeURIComponent(sehir)}?format=j1`);
                const data = await response.json();
                const current = data.current_condition[0];
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle(`${sehir.toUpperCase()} HAVA DURUMU`)
                    .setDescription(`
                        **Durum:** ${current.weatherDesc[0].value}
                        **Sıcaklık:** ${current.temp_C}°C (Hissedilen: ${current.FeelsLikeC}°C)
                        **Nem:** %${current.humidity}
                        **Rüzgar:** ${current.windspeedKmph} km/s
                    `)
                    .setFooter({ text: `wttr.in ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                message.reply(`${EMOJIS.carpi} Hava durumu alınamadı.`);
            }
            return;
        }

        if (command === 'döviz' || command === 'doviz' || command === 'currency') {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/TRY');
                const data = await response.json();
                const rates = data.rates;
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle('DÖVİZ KURLARI (TRY)')
                    .setDescription(`
                        **USD:** ${rates.USD.toFixed(2)} ₺
                        **EUR:** ${rates.EUR.toFixed(2)} ₺
                        **GBP:** ${rates.GBP.toFixed(2)} ₺
                        **JPY:** ${(rates.JPY * 100).toFixed(2)} ₺ (100 JPY)
                        **CHF:** ${rates.CHF.toFixed(2)} ₺
                        **CAD:** ${rates.CAD.toFixed(2)} ₺
                        **AUD:** ${rates.AUD.toFixed(2)} ₺
                        **CNY:** ${rates.CNY.toFixed(2)} ₺
                    `)
                    .setFooter({ text: `open.er-api.com ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                message.reply(`${EMOJIS.carpi} Döviz kurları alınamadı.`);
            }
            return;
        }

        if (command === 'altın' || command === 'gold') {
            try {
                const response = await fetch('https://api.metals.live/v1/spot/gold');
                const data = await response.json();
                const embed = new EmbedBuilder()
                    .setColor(0xFFD700)
                    .setTitle('ALTIN FİYATI')
                    .setDescription(`
                        **Güncel:** $${data[0]?.price || 'Bilinmiyor'}
                        **Birim:** ons
                    `)
                    .setFooter({ text: `metals.live ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                message.reply(`${EMOJIS.carpi} Altın fiyatı alınamadı.`);
            }
            return;
        }

        if (command === 'kripto' || command === 'crypto') {
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KRİPTO PARA')
                .setDescription('*CoinGecko üzerinden gerçek zamanlı veriler*');
            const cryptos = [
                { id: 'bitcoin', name: '₿ Bitcoin' },
                { id: 'ethereum', name: '⟠ Ethereum' },
                { id: 'solana', name: '◎ Solana' },
                { id: 'ripple', name: '✕ XRP' },
                { id: 'dogecoin', name: 'Ð Dogecoin' }
            ];
            try {
                const ids = cryptos.map(c => c.id).join(',');
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur`);
                const data = await response.json();
                let desc = '';
                for (const crypto of cryptos) {
                    const price = data[crypto.id];
                    desc += `**${crypto.name}:** ${price ? `$${price.usd} (€${price.eur})` : '❌'}\n`;
                }
                embed.setDescription(desc);
            } catch (e) {
                embed.setDescription('❌ Kripto verileri alınamadı.');
            }
            embed.setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'haber') {
            try {
                const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/sondakika_articles.rss');
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    let desc = '';
                    data.items.slice(0, 5).forEach((a, i) => {
                        desc += `${i+1}. **[${a.title}](${a.link})**\n`;
                    });
                    const embed = new EmbedBuilder()
                        .setColor(0xE30A17)
                        .setTitle('SON DAKİKA HABERLERİ')
                        .setDescription(desc)
                        .setFooter({ text: `TRT Haber ${BAYRAK}` });
                    await message.reply({ embeds: [embed] });
                } else {
                    message.reply('❌ Haber bulunamadı.');
                }
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        if (command === 'spor') {
            const apiKey = process.env.FOOTBALL_API_KEY;
            if (!apiKey) return message.reply(`${EMOJIS.carpi} FOOTBALL_API_KEY eksik!`);
            try {
                const response = await fetch('https://api.football-data.org/v4/competitions/TR1/standings', {
                    headers: { 'X-Auth-Token': apiKey }
                });
                const data = await response.json();
                if (data.standings && data.standings[0]?.table) {
                    let desc = '```\n';
                    desc += '  Sıra Takım                    P\n';
                    desc += '  ---- ------------------------ --\n';
                    data.standings[0].table.slice(0, 10).forEach((team, i) => {
                        const name = team.team.name.padEnd(24);
                        desc += `${(i+1).toString().padStart(2)}. ${name} ${team.points.toString().padStart(2)}\n`;
                    });
                    desc += '```';
                    const embed = new EmbedBuilder()
                        .setColor(0x4FC3F7)
                        .setTitle('SÜPER LİG PUAN DURUMU')
                        .setDescription(desc)
                        .setFooter({ text: `KALE ${BAYRAK}` });
                    await message.reply({ embeds: [embed] });
                } else {
                    message.reply('❌ Puan durumu alınamadı.');
                }
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        if (command === 'namaz') {
            const sehir = args.join(' ') || 'Istanbul';
            try {
                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(sehir)}&country=Turkey&method=13`);
                const data = await response.json();
                if (data.data && data.data.timings) {
                    const t = data.data.timings;
                    const embed = new EmbedBuilder()
                        .setColor(0xE30A17)
                        .setTitle(`NAMAZ VAKİTLERİ - ${sehir.toUpperCase()}`)
                        .setDescription(`
                            🌅 **İmsak:** \`${t.Fajr}\`
                            🌄 **Güneş:** \`${t.Sunrise}\`
                            🌞 **Öğle:** \`${t.Dhuhr}\`
                            🌇 **İkindi:** \`${t.Asr}\`
                            🌆 **Akşam:** \`${t.Maghrib}\`
                            🌃 **Yatsı:** \`${t.Isha}\`
                        `)
                        .setFooter({ text: `aladhan.com ${BAYRAK}` });
                    await message.reply({ embeds: [embed] });
                } else {
                    message.reply('❌ Namaz vakitleri alınamadı.');
                }
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        if (command === 'wiki') {
            const query = args.join(' ');
            if (!query) return message.reply(`${EMOJIS.carpi} Bir konu belirt! Örnek: \`k!wiki Atatürk\``);
            try {
                const response = await fetch(`https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.title && data.extract) {
                    const embed = new EmbedBuilder()
                        .setColor(0x4FC3F7)
                        .setTitle(`${data.title}`)
                        .setDescription(data.extract.length > 4000 ? data.extract.slice(0, 4000) + '...' : data.extract)
                        .setFooter({ text: `Wikipedia ${BAYRAK}` });
                    if (data.thumbnail?.source) embed.setThumbnail(data.thumbnail.source);
                    await message.reply({ embeds: [embed] });
                } else {
                    message.reply('❌ Bulunamadı!');
                }
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        // ==================== SORGU ====================
        if (command === 'ip') {
            const ip = args[0];
            if (!ip) return message.reply(`${EMOJIS.carpi} Bir IP adresi belirt!`);
            try {
                const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
                const data = await response.json();
                if (data.status === 'fail') return message.reply(`${EMOJIS.carpi} Geçersiz IP!`);
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle('IP SORGULAMA')
                    .setDescription(`**${data.query}**`)
                    .addFields(
                        { name: 'Ülke', value: `${data.country} (${data.countryCode})`, inline: true },
                        { name: 'Şehir', value: data.city || '?', inline: true },
                        { name: 'ISP', value: data.isp || '?', inline: true }
                    )
                    .setFooter({ text: `KALE ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        if (command === 'dns') {
            const domain = args[0];
            if (!domain) return message.reply(`${EMOJIS.carpi} Bir domain belirt!`);
            try {
                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
                const data = await response.json();
                if (!data.Answer || data.Answer.length === 0) return message.reply(`${EMOJIS.carpi} Kayıt yok!`);
                const ips = data.Answer.filter(r => r.type === 1).map(r => r.data);
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle('DNS SORGULAMA')
                    .setDescription(`**${domain}**\n\n${ips.join('\n') || 'A kaydı yok'}`)
                    .setFooter({ text: `KALE ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) { message.reply('❌ Hata!'); }
            return;
        }

        if (command === 'roblox') {
            const username = args[0];
            if (!username) return message.reply(`${EMOJIS.carpi} Bir kullanıcı adı belirt!`);
            try {
                const idResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
                });
                const idData = await idResponse.json();

                if (!idData.data || idData.data.length === 0) {
                    return message.reply(`${EMOJIS.carpi} Kullanıcı bulunamadı.`);
                }

                const user = idData.data[0];
                const userId = user.id;

                const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
                const userData = await userResponse.json();

                const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
                const avatarData = await avatarResponse.json();
                const avatarUrl = avatarData.data?.[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

                const embed = new EmbedBuilder()
                    .setColor(0x00B2FF)
                    .setTitle(`ROBLOX - ${userData.name}`)
                    .setThumbnail(avatarUrl)
                    .addFields(
                        { name: 'ID', value: `${userId}`, inline: true },
                        { name: 'Kullanıcı', value: userData.name, inline: true },
                        { name: 'Görünen Ad', value: userData.displayName || userData.name, inline: true },
                        { name: 'Profil', value: `[Tıkla](https://www.roblox.com/users/${userId}/profile)`, inline: true },
                        { name: 'Hesap Oluşturma', value: userData.created ? new Date(userData.created).toLocaleDateString('tr-TR') : 'Bilinmiyor', inline: true }
                    )
                    .setFooter({ text: `KALE ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                console.error('Roblox hatası:', e);
                message.reply('❌ Roblox API hatası!');
            }
            return;
        }

        if (command === 'minecraft' || command === 'mc') {
            const player = args[0];
            if (!player) return message.reply(`${EMOJIS.carpi} Bir oyuncu adı belirt!`);
            try {
                const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player)}`);
                const data = await response.json();
                if (!data || !data.id) return message.reply(`${EMOJIS.carpi} Oyuncu bulunamadı.`);

                const uuid = data.id;

                const embed = new EmbedBuilder()
                    .setColor(0x00B2FF)
                    .setTitle(`MINECRAFT - ${data.name}`)
                    .setDescription(`**Oyuncu:** ${data.name}\n**UUID:** ${uuid}`)
                    .setThumbnail(`https://api.fadehost.com/api/minecraft/skin/body/256/${uuid}.png`)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                    .setFooter({ text: `KALE ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                console.error('Minecraft hatası:', e);
                message.reply('❌ Minecraft API hatası!');
            }
            return;
        }

        // ==================== ETKİLEŞİM ====================
        const etkilesimKomutlari = {
            'tokat': { emoji: '👋', mesaj: 'tokat attı' },
            'sarıl': { emoji: '🤗', mesaj: 'sarıldı' },
            'yumruk': { emoji: '👊', mesaj: 'yumruk attı' },
            'tekme': { emoji: '🦶', mesaj: 'tekme attı' },
            'öp': { emoji: '💋', mesaj: 'öpücük gönderdi' },
            'çiçek': { emoji: '🌹', mesaj: 'çiçek verdi' },
            'kahve': { emoji: '☕', mesaj: 'kahve ısmarladı' },
            'kek': { emoji: '🎂', mesaj: 'kek ısmarladı' },
            'gül': { emoji: '😊', mesaj: 'gülümsedi' },
            'ağla': { emoji: '😢', mesaj: 'ağladı' },
            'gıdıkla': { emoji: '🪶', mesaj: 'gıdıkladı' },
            'kafa': { emoji: '💥', mesaj: 'kafa attı' },
            'çay': { emoji: '🍵', mesaj: 'çay ısmarladı' },
            'dondurma': { emoji: '🍦', mesaj: 'dondurma ısmarladı' },
            'pizza': { emoji: '🍕', mesaj: 'pizza ısmarladı' },
            'yemek': { emoji: '🍽️', mesaj: 'yemek ısmarladı' },
            'su': { emoji: '💧', mesaj: 'su ikram etti' }
        };

        if (etkilesimKomutlari[command]) {
            const members = message.guild.members.cache.filter(m => !m.user.bot && m.id !== userId);
            if (members.size === 0) return message.reply('Kimse yok.');
            const target = members.random();
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(command.toUpperCase())
                .setDescription(`${message.author} **${target}**'a ${etkilesimKomutlari[command].mesaj}! ${etkilesimKomutlari[command].emoji}`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== FAYDALI ====================
        if (command === 'hatırlat') {
            const sure = parseInt(args[0]);
            const mesaj = args.slice(1).join(' ');
            if (isNaN(sure) || sure < 1 || sure > 1440) return message.reply(`${EMOJIS.carpi} 1-1440 dakika arası bir süre belirt!`);
            if (!mesaj) return message.reply(`${EMOJIS.carpi} Bir mesaj belirt!`);
            await message.reply(`${EMOJIS.onay} **${sure} dakika sonra hatırlatılacak:** ${mesaj}`);
            setTimeout(() => {
                message.author.send(`⏰ **Hatırlatma:** ${mesaj}`).catch(() => {});
            }, sure * 60 * 1000);
            return;
        }

        if (command === 'anket') {
            const soru = args.join(' ');
            if (!soru) return message.reply(`${EMOJIS.carpi} Bir soru belirt! Örnek: \`k!anket En sevdiğiniz renk?\``);
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ANKET')
                .setDescription(`**${soru}**\n\n👍 Evet\n👎 Hayır`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            const msg = await message.reply({ embeds: [embed] });
            await msg.react('👍');
            await msg.react('👎');
            return;
        }

        if (command === 'çeviri' || command === 'ceviri') {
            const metin = args.join(' ');
            if (!metin) return message.reply(`${EMOJIS.carpi} Çevrilecek metni yaz!`);
            try {
                const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=t&q=${encodeURIComponent(metin)}`);
                const data = await response.json();
                const ceviri = data[0][0][0];
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle('ÇEVİRİ')
                    .addFields(
                        { name: 'Orijinal', value: metin },
                        { name: 'Çeviri', value: ceviri }
                    )
                    .setFooter({ text: `Google Translate ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                message.reply('❌ Çeviri yapılamadı.');
            }
            return;
        }

        if (command === 'hesap' || command === 'hesapla') {
            const islem = args.join(' ');
            if (!islem) return message.reply(`${EMOJIS.carpi} Bir işlem yaz! Örnek: \`k!hesap 2+2\``);
            try {
                if (!/^[0-9+\-*/().\s]+$/.test(islem)) {
                    return message.reply(`${EMOJIS.carpi} Sadece sayı ve + - * / ( ) kullanabilirsin!`);
                }
                const sonuc = Function(`"use strict"; return (${islem})`)();
                const embed = new EmbedBuilder()
                    .setColor(0x4FC3F7)
                    .setTitle('HESAP MAKİNESİ')
                    .setDescription(`**${islem} = ${sonuc}**`)
                    .setFooter({ text: `KALE ${BAYRAK}` });
                await message.reply({ embeds: [embed] });
            } catch (e) {
                message.reply('❌ Geçersiz işlem!');
            }
            return;
        }

        if (command === 'öneri') {
            const oneri = args.join(' ');
            if (!oneri) return message.reply(`${EMOJIS.carpi} Bir öneri yaz!`);
            try {
                const admin = await client.users.fetch(ADMIN_ID);
                await admin.send(`📝 **YENİ ÖNERİ**\n**Kullanıcı:** ${message.author.tag} (${message.author.id})\n**Öneri:** ${oneri}`);
                await message.reply(`${EMOJIS.onay} **Önerin iletildi!**`);
            } catch (e) {
                await message.reply(`${EMOJIS.carpi} Öneri iletilemedi!`);
            }
            return;
        }

        if (command === 'şikayet') {
            const sikayet = args.join(' ');
            if (!sikayet) return message.reply(`${EMOJIS.carpi} Bir şikayet yaz!`);
            try {
                const admin = await client.users.fetch(ADMIN_ID);
                await admin.send(`⚠️ **YENİ ŞİKAYET**\n**Kullanıcı:** ${message.author.tag} (${message.author.id})\n**Şikayet:** ${sikayet}`);
                await message.reply(`${EMOJIS.onay} **Şikayetin iletildi!**`);
            } catch (e) {
                await message.reply(`${EMOJIS.carpi} Şikayet iletilemedi!`);
            }
            return;
        }

        // ==================== ARGO ====================
        if (command === 'argo' || command === 'slang') {
            const s = ARGO_SOZLUK[Math.floor(Math.random() * ARGO_SOZLUK.length)];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ARGO SÖZLÜK')
                .setDescription(`**${s.k}**\n${s.a}`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== ÖNERİLER ====================
        if (command === 'muzik' || command === 'music') {
            const m = ['Barış Manço - Dönence', 'Cem Karaca - Resimdeki Gözyaşları', 'Erkin Koray - Cemalim'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('MÜZİK ÖNERİSİ')
                .setDescription(`🎵 **${m[Math.floor(Math.random() * m.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'film' || command === 'movie') {
            const f = ['Kış Uykusu', 'Bir Zamanlar Anadolu\'da', 'Ayla', 'Eşkıya'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('FİLM ÖNERİSİ')
                .setDescription(`🎬 **${f[Math.floor(Math.random() * f.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'dizi' || command === 'series') {
            const d = ['Diriliş Ertuğrul', 'Kurtlar Vadisi', 'Çukur', 'Gibi'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('DİZİ ÖNERİSİ')
                .setDescription(`📺 **${d[Math.floor(Math.random() * d.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'kitap' || command === 'book') {
            const k = ['Kürk Mantolu Madonna', 'Tutunamayanlar', 'İnce Memed'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KİTAP ÖNERİSİ')
                .setDescription(`📚 **${k[Math.floor(Math.random() * k.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'oyun' || command === 'game') {
            const o = ['Bannerlord', 'Kenshi', 'Stardew Valley', 'Elden Ring'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('OYUN ÖNERİSİ')
                .setDescription(`🕹️ **${o[Math.floor(Math.random() * o.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'karakter' || command === 'character') {
            const isim = ['Alp', 'Efe', 'Deniz', 'Yağmur', 'Kaya'];
            const meslek = ['Savaşçı', 'Büyücü', 'Okçu', 'Şövalye'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KARAKTER')
                .setDescription(`**İsim:** ${isim[Math.floor(Math.random()*isim.length)]}\n**Meslek:** ${meslek[Math.floor(Math.random()*meslek.length)]}\n**Level:** ${Math.floor(Math.random()*50)+1}`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'nick' || command === 'nickname') {
            const n = ['KaraKartal', 'BozKurt', 'GriKurt', 'KızılElma', 'ÇelikYelek'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('NICK ÖNERİSİ')
                .setDescription(`**${n[Math.floor(Math.random() * n.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'şifre' || command === 'password') {
            const uzunluk = parseInt(args[0]) || 12;
            if (uzunluk < 4 || uzunluk > 64) return message.reply('4-64 arası uzunluk girin.');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
            let sifre = '';
            for (let i = 0; i < uzunluk; i++) sifre += chars.charAt(Math.floor(Math.random() * chars.length));
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('ŞİFRE')
                .setDescription(`\`\`\`${sifre}\`\`\``)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'renk' || command === 'color') {
            const r = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('RENK')
                .setDescription(`**${r[Math.floor(Math.random() * r.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'emoji' || command === 'randomemoji') {
            const e = ['😊', '😂', '🤣', '❤️', '🔥', '💯', '👀', '🤔', '😎'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('EMOJİ')
                .setDescription(`**${e[Math.floor(Math.random() * e.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'hayvan' || command === 'animal') {
            const h = ['🐶 Köpek', '🐱 Kedi', '🦊 Tilki', '🐻 Ayı', '🐼 Panda'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('HAYVAN')
                .setDescription(`**${h[Math.floor(Math.random() * h.length)]}**`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'komik' || command === 'funny') {
            const k = ['Hayat güzel, ama ben güzel değilim.', 'Bugün yarın olabilir.', 'Başarı, başarısızlığın sonraki aşamasıdır.'];
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('KOMİK SÖZ')
                .setDescription(`*"${k[Math.floor(Math.random() * k.length)]}"*`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'random' || command === 'rastgele') {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            if (min >= max) return message.reply('Min < max!');
            const sayi = Math.floor(Math.random() * (max - min + 1)) + min;
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle('RASTGELE SAYI')
                .setDescription(`**${sayi}** (${min} - ${max})`)
                .setFooter({ text: `KALE ${BAYRAK}` });
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== YARDIM ====================
        if (command === 'yardim' || command === 'help') {
            const embed = new EmbedBuilder()
                .setColor(0xE30A17)
                .setTitle(`${EMOJIS.kale} KALE BOT KOMUTLARI ${BAYRAK}`)
                .setDescription(`
                    Merhaba **${message.author.username}**! 👋
                    Toplam **150+ komut** ile hizmetindeyim.
                    
                    📖 **Detaylı yardım için:** \`k!yardim <komut>\`
                    📊 **Sunucu istatistikleri:** \`k!bot\`
                `)
                .addFields(
                    {
                        name: `${EMOJIS.kalkan} MODERASYON (ADMIN)`,
                        value: '`temizle` `kick` `ban` `unban` `uyar` `uyarılar` `sustur` `susturma-kaldır` `slowmode` `kanal-kilit` `kanal-aç`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.oyun} EĞLENCE & OYUNLAR`,
                        value: '`milyoner` `xox` `şişeçevir` `rusruleti` `tahmin` `zar` `yazıtura` `şans` `8ball` `espri` `fıkra` `kaçcm` `ship` `1vs1` `hackle` `wasted` `aranıyor` `hapishane` `adamasmaca` `kelime-oyunu` `argo` `trivia` `apoyabas`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.ataturk} MİLLİ DEĞERLER`,
                        value: '`atam` `gencligehitabe` `istiklalmarsi` `gununsozu` `ataturkbilgi` `cumhuriyet` `nutuk` `bayrak` `saygi` `vatan`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.para} BİLGİ & VERİ`,
                        value: '`hava` `döviz` `altın` `kripto` `haber` `spor` `namaz` `wiki` `ip` `dns` `roblox` `minecraft` `çeviri` `hesap`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.kalp} ETKİLEŞİM`,
                        value: '`tokat` `sarıl` `yumruk` `tekme` `öp` `çiçek` `kahve` `kek` `gül` `ağla` `gıdıkla` `kafa` `çay` `dondurma` `pizza` `yemek` `su`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.zil} ÖNERİLER`,
                        value: '`muzik` `film` `dizi` `kitap` `oyun`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.kilit} ARAÇLAR`,
                        value: '`karakter` `nick` `şifre` `renk` `emoji` `hayvan` `komik` `random` `hatırlat` `anket`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.goz} BİLGİ`,
                        value: '`ping` `zaman` `kullanıcı` `sunucu` `avatar` `bot` `aktif` `profil` `günlük-istatistik` `öneri` `şikayet`',
                        inline: false
                    },
                    {
                        name: `${EMOJIS.kalkan} YÖNETİM (ADMIN)`,
                        value: '`yedek` `ayar aç/kapa/durum` `debug`',
                        inline: false
                    }
                )
                .setFooter({ text: `KALE ${BAYRAK} • Toplam 150+ komut • İyi eğlenceler!` })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }

        // ==================== DETAYLI YARDIM ====================
        if (command === 'yardim' && args[0]) {
            const arananKomut = args[0].toLowerCase();
            const komutBilgileri = {
                'apoyabas': { aciklama: 'Apo sayacını arttırır.', kullanim: 'k!apoyabas' },
                'milyoner': { aciklama: '13 soruluk bilgi yarışması başlatır.', kullanim: 'k!milyoner' },
                'trivia': { aciklama: 'Tek soruluk bilgi yarışması.', kullanim: 'k!trivia [kategori]' },
                'temizle': { aciklama: 'Belirtilen sayıda mesaj siler.', kullanim: 'k!temizle <1-100>' },
                'kick': { aciklama: 'Kullanıcıyı sunucudan atar.', kullanim: 'k!kick @kullanıcı [sebep]' },
                'ban': { aciklama: 'Kullanıcıyı sunucudan yasaklar.', kullanim: 'k!ban @kullanıcı [sebep]' },
                'uyar': { aciklama: 'Kullanıcıya uyarı verir.', kullanim: 'k!uyar @kullanıcı [sebep]' },
                'hava': { aciklama: 'Belirtilen şehrin hava durumunu gösterir.', kullanim: 'k!hava [şehir]' },
                'döviz': { aciklama: 'Güncel döviz kurlarını gösterir.', kullanim: 'k!döviz' },
                'kripto': { aciklama: 'Güncel kripto para fiyatlarını gösterir.', kullanim: 'k!kripto' },
                'wiki': { aciklama: 'Wikipedia\'dan bilgi getirir.', kullanim: 'k!wiki <konu>' },
                'şifre': { aciklama: 'Rastgele şifre üretir.', kullanim: 'k!şifre [uzunluk]' },
                'hatırlat': { aciklama: 'Belirtilen süre sonra hatırlatır.', kullanim: 'k!hatırlat <dakika> <mesaj>' },
                'anket': { aciklama: 'Evet/Hayır anketi başlatır.', kullanim: 'k!anket <soru>' },
                'hesap': { aciklama: 'Matematiksel işlem yapar.', kullanim: 'k!hesap <işlem>' },
                'çeviri': { aciklama: 'Metni Türkçeye çevirir.', kullanim: 'k!çeviri <metin>' },
                'profil': { aciklama: 'Kullanıcı profilini gösterir.', kullanim: 'k!profil [@kullanıcı]' },
                'atam': { aciklama: 'Rastgele Atatürk fotoğrafı ve sözü gönderir.', kullanim: 'k!atam' }
            };
            const bilgi = komutBilgileri[arananKomut];
            if (!bilgi) {
                return message.reply(`${EMOJIS.carpi} **\`${arananKomut}\`** komutu hakkında bilgi bulunamadı!`);
            }
            const embed = new EmbedBuilder()
                .setColor(0x4FC3F7)
                .setTitle(`📖 \`k!${arananKomut}\` KOMUTU`)
                .addFields(
                    { name: '📝 Açıklama', value: bilgi.aciklama, inline: false },
                    { name: '💡 Kullanım', value: `\`${bilgi.kullanim}\``, inline: false }
                )
                .setFooter({ text: `KALE ${BAYRAK} • k!yardim <komut>` })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            return;
        }
    });
};
