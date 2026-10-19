#!/bin/bash
# ============================================================
# MELEZYA BOT - Başlatıcı Script
# Guard bot + Ana bot + Proxy bot birlikte çalışır
# ============================================================

echo ""
echo "═══════════════════════════════════════════════"
echo "🚀 MELEZYA BOT BAŞLATILIYOR"
echo "═══════════════════════════════════════════════"
echo ""

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

if [ ! -d "data" ]; then
    mkdir -p data
    echo "📁 data/ klasörü oluşturuldu"
fi

echo "🛡️  Guard bot başlatılıyor..."
node guvenlik.js &
GUARD_PID=$!
echo "✅ Guard bot PID: $GUARD_PID"

sleep 3

echo ""
echo "🤖 Ana bot başlatılıyor..."
node index.js &
ANA_PID=$!
echo "✅ Ana bot PID: $ANA_PID"

sleep 2

echo ""
echo "🌐 Proxy bot başlatılıyor..."
node proxy_bot.js &
PROXY_PID=$!
echo "✅ Proxy bot PID: $PROXY_PID"

echo ""
echo "═══════════════════════════════════════════════"
echo "🎉 Üç bot da çalışıyor!"
echo "   Guard:  PID $GUARD_PID"
echo "   Ana:    PID $ANA_PID"
echo "   Proxy:  PID $PROXY_PID"
echo "═══════════════════════════════════════════════"
echo ""

trap "echo ''; echo '🛑 Kapatılıyor...'; kill $GUARD_PID $ANA_PID $PROXY_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
