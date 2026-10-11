#!/bin/bash
# ============================================================
# KALE BOT - Başlatıcı Script
# Guard bot (veri sahibi) + Ana bot birlikte çalışır
# ============================================================

echo ""
echo "═══════════════════════════════════════════════"
echo "🚀 KALE BOT BAŞLATILIYOR"
echo "═══════════════════════════════════════════════"
echo ""

# Node sürüm kontrolü
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

# Çıkışta ikisini de kapat
trap "echo ''; echo '🛑 Kapatılıyor...'; kill $GUARD_PID $ANA_PID 2>/dev/null; exit" SIGINT SIGTERM

# Bekle
wait
