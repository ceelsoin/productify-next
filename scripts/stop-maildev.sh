#!/bin/bash

# Script para parar Maildev

echo "🛑 Parando Maildev..."

# Matar processos nas portas do Maildev
if lsof -Pi :1025 -sTCP:LISTEN -t >/dev/null ; then
    kill -9 $(lsof -t -i:1025)
    echo "✅ Processo SMTP (porta 1025) parado"
fi

if lsof -Pi :1080 -sTCP:LISTEN -t >/dev/null ; then
    kill -9 $(lsof -t -i:1080)
    echo "✅ Processo Web (porta 1080) parado"
fi

# Matar processo maildev por nome
pkill -f maildev

echo "✅ Maildev parado completamente"
