# 🎯 Setup Rápido - Recuperação de Senha com Maildev

## ✅ O que foi implementado

### 1. Serviço de Email (`lib/email.ts`)
- ✉️ Configuração Nodemailer com SMTP
- 🎨 Template HTML profissional com gradiente brand
- 📱 Design responsivo e dark theme
- 📄 Versão texto puro (fallback)

### 2. Modelo PasswordReset (`lib/models/PasswordReset.ts`)
- 🔐 Token único e seguro (32 bytes)
- ⏰ Expiração em 1 hora
- 🗑️ Auto-cleanup com TTL index (24h após expirar)
- ✅ One-time use (marca como usado após reset)

### 3. API Endpoints

#### POST `/api/auth/forgot-password`
- Recebe email do usuário
- Gera token seguro (crypto.randomBytes)
- Desativa tokens anteriores
- Envia email com link de recuperação
- Retorna sempre sucesso (security best practice)

#### POST `/api/auth/validate-reset-token`
- Valida se token existe e não está usado
- Verifica se não expirou
- Retorna status de validade

#### POST `/api/auth/reset-password`
- Valida token novamente
- Atualiza senha com bcrypt
- Marca token como usado
- Impede reuso do mesmo token

### 4. Páginas Frontend
- `/forgot-password` - Solicitar recuperação (já implementada)
- `/reset-password` - Redefinir senha (já implementada)

## 🚀 Como Testar

### Passo 1: Configurar variáveis de ambiente

Crie `.env.local` (se não existir) e adicione:

```bash
# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="Productify" <noreply@productify.app>

# MongoDB
MONGODB_URI=sua_connection_string_aqui

# NextAuth
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Passo 2: Instalar e iniciar Maildev

**Opção A: Docker (Recomendado)**

```bash
# Se Docker estiver funcionando
docker-compose up -d maildev
```

**Opção B: NPM (Alternativa)**

```bash
# Instalar Maildev globalmente
npm install -g maildev

# Iniciar Maildev
maildev --smtp 1025 --web 1080
```

**Opção C: Docker direto**

```bash
docker run -d \
  --name productify-maildev \
  -p 1080:1080 \
  -p 1025:1025 \
  maildev/maildev
```

### Passo 3: Verificar se Maildev está rodando

Abra no navegador:
- **Interface Web**: http://localhost:1080

Você deve ver a interface do Maildev (inicialmente vazia).

### Passo 4: Testar recuperação de senha

1. **Acesse a aplicação**
   ```bash
   npm run dev
   ```

2. **Vá para página de recuperação**
   - http://localhost:3000/forgot-password

3. **Digite um email cadastrado**
   - Use um email que você tenha cadastrado no sistema

4. **Clique em "Enviar link de recuperação"**
   - Você verá a mensagem de sucesso

5. **Abra o Maildev** (http://localhost:1080)
   - O email aparecerá na lista
   - Clique para visualizar o template bonito
   - Copie o link de recuperação ou clique no botão

6. **Acesse o link ou cole no navegador**
   - Você será redirecionado para `/reset-password?token=...`
   - A página validará o token automaticamente
   - Digite sua nova senha
   - Confirme a senha
   - Clique em "Redefinir senha"

7. **Faça login com a nova senha**
   - Você será redirecionado para `/login?reset=success`
   - Use a nova senha para entrar

## 🎨 Visualizando o Email

O template inclui:
- ✨ Logo Productify
- 🎨 Gradiente brand (primary #d946ef + accent #3b82f6)
- 📧 Mensagem personalizada com nome do usuário
- 🔘 Botão CTA destacado
- 🔗 Link alternativo (caso o botão não funcione)
- ⏰ Aviso de expiração (1 hora)
- 🔒 Nota de segurança
- 📱 Responsivo e dark theme

## 📊 Verificar Logs

No terminal do Next.js, você verá:

```bash
✅ Token de reset criado: {
  userId: ObjectId('...'),
  email: 'usuario@teste.com',
  expires: '2025-11-30T16:00:00.000Z'
}

📧 Email enviado: {
  to: 'usuario@teste.com',
  subject: 'Recuperação de Senha - Productify',
  messageId: '<...>'
}
```

## 🧪 Testar via API

### 1. Solicitar recuperação

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

Resposta:
```json
{
  "success": true,
  "message": "Se este email estiver cadastrado, você receberá as instruções de recuperação."
}
```

### 2. Pegar o token do Maildev

Abra http://localhost:1080, clique no email e copie o token da URL.

### 3. Validar token

```bash
curl -X POST http://localhost:3000/api/auth/validate-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI"}'
```

Resposta:
```json
{
  "valid": true,
  "message": "Token válido"
}
```

### 4. Redefinir senha

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI","password":"novaSenha123"}'
```

Resposta:
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

## 🔧 Troubleshooting

### Maildev não inicia

```bash
# Verificar portas
lsof -i :1080
lsof -i :1025

# Se já tiver algo rodando, matar processo
kill -9 $(lsof -t -i:1080)
kill -9 $(lsof -t -i:1025)

# Tentar novamente
maildev --smtp 1025 --web 1080
```

### Email não aparece no Maildev

1. Verificar se Maildev está rodando: http://localhost:1080
2. Verificar variáveis `SMTP_HOST` e `SMTP_PORT` no `.env.local`
3. Verificar logs do Next.js para mensagens de erro
4. Recarregar página do Maildev (F5)

### Token inválido ou expirado

- Tokens expiram em 1 hora
- Tokens só podem ser usados uma vez
- Solicite um novo link de recuperação

### Erro de conexão SMTP

```bash
# Verificar se Maildev está rodando
curl http://localhost:1080

# Se retornar HTML, está funcionando
```

## 📝 Notas de Segurança

1. **Sempre retorna sucesso**: Mesmo se o email não existir, a API retorna sucesso para não expor quais emails estão cadastrados.

2. **Tokens seguros**: Usamos `crypto.randomBytes(32)` para gerar tokens imprevisíveis.

3. **Expiração curta**: Tokens expiram em 1 hora por segurança.

4. **One-time use**: Tokens não podem ser reutilizados após redefinir senha.

5. **Auto-cleanup**: MongoDB remove tokens expirados automaticamente (TTL index).

## 🚀 Próximos Passos

Para produção:
1. Configure um provedor SMTP real (Gmail, SendGrid, SES, Resend)
2. Adicione rate limiting no endpoint forgot-password
3. Adicione captcha para prevenir abuso
4. Configure SPF, DKIM, DMARC para deliverability
5. Monitore taxa de entrega de emails

## 📚 Documentação Completa

Para mais detalhes, veja:
- `docs/MAILDEV.md` - Documentação completa do Maildev
- `lib/email.ts` - Configuração de email
- `lib/models/PasswordReset.ts` - Modelo de dados
