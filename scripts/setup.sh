#!/bin/bash

# Script para configurar o ambiente de desenvolvimento

echo "🚀 Productify - Setup do Ambiente"
echo "=================================="
echo ""

# Gerar NEXTAUTH_SECRET se não existir
if [ ! -f .env.local ]; then
  echo "📝 Criando arquivo .env.local..."
  
  # Gerar secret
  SECRET=$(openssl rand -base64 32)
  
  cat > .env.local <<EOF
# NextAuth Configuration
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/productify
# ou MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/productify

# OAuth Providers (Opcional - configure depois)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# 
# FACEBOOK_CLIENT_ID=
# FACEBOOK_CLIENT_SECRET=
# 
# TWITTER_CLIENT_ID=
# TWITTER_CLIENT_SECRET=

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

  echo "✅ Arquivo .env.local criado com sucesso!"
  echo ""
else
  echo "⚠️  Arquivo .env.local já existe. Pulando criação."
  echo ""
fi

# Verificar se MongoDB está rodando
echo "🔍 Verificando MongoDB..."
if command -v mongosh &> /dev/null; then
  if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    echo "✅ MongoDB está rodando localmente!"
    echo ""
  else
    echo "❌ MongoDB não está rodando."
    echo ""
    echo "Para iniciar o MongoDB:"
    echo "  - macOS (Homebrew): brew services start mongodb-community"
    echo "  - Linux (systemd): sudo systemctl start mongod"
    echo "  - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
    echo "Ou use MongoDB Atlas (cloud):"
    echo "  1. Crie uma conta em https://www.mongodb.com/cloud/atlas"
    echo "  2. Crie um cluster gratuito"
    echo "  3. Configure o IP de acesso (0.0.0.0/0 para testes)"
    echo "  4. Copie a connection string para .env.local"
    echo ""
  fi
elif command -v mongo &> /dev/null; then
  if mongo --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    echo "✅ MongoDB está rodando localmente!"
    echo ""
  else
    echo "❌ MongoDB não está rodando. Veja instruções acima."
    echo ""
  fi
else
  echo "⚠️  MongoDB não encontrado no sistema."
  echo ""
  echo "Opções:"
  echo "  1. Instalar localmente:"
  echo "     - macOS: brew tap mongodb/brew && brew install mongodb-community"
  echo "     - Linux: https://docs.mongodb.com/manual/administration/install-on-linux/"
  echo ""
  echo "  2. Usar Docker:"
  echo "     docker run -d -p 27017:27017 --name mongodb mongo:latest"
  echo ""
  echo "  3. Usar MongoDB Atlas (recomendado para produção):"
  echo "     https://www.mongodb.com/cloud/atlas"
  echo ""
fi

echo "📋 Próximos passos:"
echo "  1. ✅ Arquivo .env.local configurado"
echo "  2. Configure MongoDB (local ou Atlas)"
echo "  3. npm run dev - para iniciar o servidor"
echo "  4. Acesse http://localhost:3000/register para criar conta"
echo "  5. (Opcional) Configure OAuth providers em .env.local"
echo ""
echo "🎉 Setup concluído!"
