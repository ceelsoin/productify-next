# Configuração de Email com Maildev

Este documento descreve como configurar e usar o Maildev para testes de email locais no Productify.

## 🐳 O que é Maildev?

Maildev é um servidor SMTP simples e interface web para desenvolvimento. Ele captura todos os emails enviados localmente e permite visualizá-los através de uma interface web bonita, sem enviar os emails de verdade.

**Perfeito para:**
- ✅ Testar recuperação de senha
- ✅ Visualizar templates de email
- ✅ Desenvolver funcionalidades de notificação
- ✅ Não precisar de credenciais SMTP reais
- ✅ Não enviar emails de teste para usuários reais

## 🚀 Iniciando o Maildev

### Usando Docker Compose (Recomendado)

```bash
# Iniciar Maildev e MongoDB
docker-compose up -d

# Apenas Maildev
docker-compose up -d maildev

# Ver logs
docker-compose logs -f maildev

# Parar containers
docker-compose down
```

### Acessando a Interface Web

Após iniciar o container, acesse:
- **Interface Web**: http://localhost:1080
- **Servidor SMTP**: localhost:1025

## ⚙️ Configuração no Projeto

As variáveis de ambiente já estão configuradas no `.env.example`:

```bash
# SMTP Configuration (Email)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="Productify" <noreply@productify.app>
```

Para desenvolvimento local, **não é necessário** configurar `SMTP_USER` e `SMTP_PASS`.

## 📧 Testando Recuperação de Senha

### 1. Inicie o servidor Next.js e o Maildev

```bash
# Terminal 1: Iniciar Maildev
docker-compose up -d maildev

# Terminal 2: Iniciar Next.js
npm run dev
```

### 2. Solicite recuperação de senha

1. Acesse http://localhost:3000/forgot-password
2. Digite um email cadastrado
3. Clique em "Enviar link de recuperação"

### 3. Visualize o email no Maildev

1. Abra http://localhost:1080 no navegador
2. Você verá o email com o template profissional
3. Clique no botão ou copie o link
4. Redefina sua senha

## 🎨 Template de Email

O email de recuperação inclui:
- ✨ Design responsivo e moderno
- 🎨 Gradiente brand (primary + accent)
- ⏰ Aviso de expiração (1 hora)
- 🔗 Botão CTA + link alternativo
- 📱 Otimizado para mobile
- 🌙 Dark theme (brand colors)

## 🔧 Usando em Produção

Para produção, substitua as variáveis por um serviço SMTP real:

### Gmail (Exemplo)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app  # Use App Password, não a senha real
SMTP_FROM="Productify" <noreply@productify.app>
```

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua_api_key_aqui
SMTP_FROM="Productify" <noreply@productify.app>
```

### Amazon SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=sua_access_key_id
SMTP_PASS=sua_secret_access_key
SMTP_FROM="Productify" <noreply@productify.app>
```

### Resend (Recomendado para Next.js)

```bash
# Resend tem SDK próprio, mas também suporta SMTP
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_sua_api_key
SMTP_FROM="Productify" <noreply@productify.app>
```

## 📋 Comandos Úteis

```bash
# Ver emails no terminal (alternativa à interface web)
curl http://localhost:1080/email

# Limpar todos os emails
curl -X DELETE http://localhost:1080/email/all

# Ver status do container
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f maildev

# Reiniciar container
docker-compose restart maildev

# Parar e remover container
docker-compose down
```

## 🧪 Testes de API

Você também pode testar os endpoints diretamente:

```bash
# Solicitar recuperação de senha
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@teste.com"}'

# Validar token
curl -X POST http://localhost:3000/api/auth/validate-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"token_aqui"}'

# Redefinir senha
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"token_aqui","password":"novaSenha123"}'
```

## 🔍 Troubleshooting

### Maildev não inicia

```bash
# Verificar se a porta 1080 está em uso
lsof -i :1080
lsof -i :1025

# Matar processo na porta
kill -9 $(lsof -t -i:1080)

# Verificar logs do container
docker-compose logs maildev
```

### Email não aparece no Maildev

1. Verifique se o Maildev está rodando: http://localhost:1080
2. Verifique os logs do Next.js para mensagens "📧 Email enviado:"
3. Verifique as variáveis de ambiente (SMTP_HOST e SMTP_PORT)
4. Recarregue a página do Maildev (F5)

### Erro de conexão SMTP

```bash
# Verificar se o container está rodando
docker ps | grep maildev

# Reiniciar container
docker-compose restart maildev

# Verificar variáveis de ambiente
env | grep SMTP
```

## 📚 Recursos Adicionais

- [Maildev no GitHub](https://github.com/maildev/maildev)
- [Nodemailer Docs](https://nodemailer.com)
- [Docker Compose Docs](https://docs.docker.com/compose/)

## 🎯 Próximos Passos

- [ ] Adicionar templates para outros tipos de email
- [ ] Implementar notificações de novo produto gerado
- [ ] Email de boas-vindas após registro
- [ ] Notificação de compra de créditos
- [ ] Newsletter e promoções (opt-in)
