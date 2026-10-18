#!/bin/bash
# ============================================================
# MELEZYA BOT - Başlatıcı Script
# Guard bot (veri sahibi) + Ana bot birlikte çalışır
# Duplicate process koruması dahil
# ============================================================

echo ""
echo "═══════════════════════════════════════════════"
echo "🚀 MELEZYA BOT BAŞLATILIYOR"
echo "═══════════════════════════════════════════════"
echo ""

# ============================================================
# ESKİ PROCESS'LERİ TEMİZLE (duplicate koruması)
# ============================================================
echo "🔍 Eski bot process'leri kontrol ediliyor..."

ESKI_INDEX=$(pgrep -f "node index.js" 2>/dev/null)
ESKI_GUVENLIK=$(pgrep -f "node guvenlik.js" 2>/dev/null)

if [ -n "$ESKI_INDEX" ] || [ -n "$ESKI_GUVENLIK" ]; then
    echo "⚠️  Eski process(ler) bulundu, kapatılıyor:"
    [ -n "$ESKI_INDEX" ] && echo "   index.js PID: $ESKI_INDEX"
    [ -n "$ESKI_GUVENLIK" ] && echo "   guvenlik.js PID: $ESKI_GUVENLIK"
    [ -n "$ESKI_INDEX" ] && kill -9 $ESKI_INDEX 2>/dev/null
    [ -n "$ESKI_GUVENLIK" ] && kill -9 $ESKI_GUVENLIK 2>/dev/null
    sleep 2
    echo "✅ Eski process'ler kapatıldı"
else
    echo "✅ Eski process yok, temiz başlangıç"
fi
echo ""

# ============================================================
# NODE SÜRÜM KONTROLÜ
# ============================================================
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
NODE_MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)

echo "📌 Node sürümü: v$NODE_VERSION"

if [ "$NODE_MAJOR" -lt 22 ] || ([ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 13 ]); then
    echo "❌ HATA: Node 22.13+ gerekli!"
    echo "   Mevcut: v$NODE_VERSION"
    exit 1
fi
echo "✅ Node sürümü uygun"
echo ""

# data klasörünü oluştur (yoksa)
if [ ! -d "data" ]; then
    mkdir -p data
    echo "📁 data/ klasörü oluşturuldu"
fi

# ============================================================
# GUARD BOT (Veri Sahibi)
# ============================================================
echo "🛡️  Guard bot başlatılıyor..."
node guvenlik.js &
GUARD_PID=$!
echo "✅ Guard bot PID: $GUARD_PID"

# Guard botun SQLite'ı açması için bekle
sleep 3

# ============================================================
# ANA BOT
# ============================================================
echo ""
echo "🤖 Ana bot başlatılıyor..."
node index.js &
ANA_PID=$!
echo "✅ Ana bot PID: $ANA_PID"

echo ""
echo "═══════════════════════════════════════════════"
echo "🎉 Her iki bot da çalışıyor!"
echo "   Guard: PID $GUARD_PID"
echo "   Ana:   PID $ANA_PID"
echo "═══════════════════════════════════════════════"
echo ""

# ============================================================
# DUPLICATE KONTROL (10 saniye sonra)
# ============================================================
sleep 10
echo "🔍 Duplicate process kontrolü (10 sn sonra):"
INDEX_SAYI=$(pgrep -f "node index.js" | wc -l)
GUVENLIK_SAYI=$(pgrep -f "node guvenlik.js" | wc -l)
echo "   index.js çalışan process sayısı: $INDEX_SAYI (olması gereken: 1)"
echo "   guvenlik.js çalışan process sayısı: $GUVENLIK_SAYI (olması gereken: 1)"
if [ "$INDEX_SAYI" -gt 1 ] || [ "$GUVENLIK_SAYI" -gt 1 ]; then
    echo "   ⚠️  DUPLICATE TESPİT EDİLDİ!"
else
    echo "   ✅ Duplicate yok, sistem temiz"
fi
echo ""

# Çıkışta ikisini de kapat
trap "echo ''; echo '🛑 Kapatılıyor...'; kill $GUARD_PID $ANA_PID 2>/dev/null; exit" SIGINT SIGTERM

# Bekle
wait
