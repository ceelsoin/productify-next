#!/bin/bash

# Script para iniciar Maildev sem Docker
# Útil quando há problemas de rede/DNS no Docker

echo "🚀 Iniciando Maildev..."
echo ""

# Verificar se Maildev está instalado
if ! command -v maildev &> /dev/null; then
    echo "⚠️  Maildev não está instalado."
    echo "📦 Instalando Maildev globalmente..."
    npm install -g maildev
fi

# Verificar se a porta 1025 está livre
if lsof -Pi :1025 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 1025 já está em uso. Parando processo..."
    kill -9 $(lsof -t -i:1025)
fi

# Verificar se a porta 1080 está livre
if lsof -Pi :1080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 1080 já está em uso. Parando processo..."
    kill -9 $(lsof -t -i:1080)
fi

# Iniciar Maildev em background
echo "✅ Iniciando Maildev nas portas:"
echo "   📧 SMTP: localhost:1025"
echo "   🌐 Web:  http://localhost:1080"
echo ""

nohup maildev --smtp 1025 --web 1080 > /tmp/maildev.log 2>&1 &
MAILDEV_PID=$!

echo "✅ Maildev iniciado! (PID: $MAILDEV_PID)"
echo ""
echo "📝 Para acessar a interface web:"
echo "   👉 http://localhost:1080"
echo ""
echo "🛑 Para parar o Maildev:"
echo "   kill $MAILDEV_PID"
echo "   ou"
echo "   npm run maildev:stop"
echo ""
echo "📋 Ver logs:"
echo "   tail -f /tmp/maildev.log"
