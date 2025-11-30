# ✅ Teste Rápido - Recuperação de Senha

## 1️⃣ Instalar Maildev (escolha uma opção)

### Opção A: NPM Global (mais fácil)
```bash
npm install -g maildev
maildev --smtp 1025 --web 1080
```

### Opção B: Docker
```bash
docker run -d -p 1080:1080 -p 1025:1025 maildev/maildev
```

### Opção C: Docker Compose
```bash
docker-compose up -d maildev
```

## 2️⃣ Configurar Variáveis de Ambiente

Certifique-se que `.env.local` contém:

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="Productify" <noreply@productify.app>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3️⃣ Iniciar Next.js

```bash
npm run dev
```

## 4️⃣ Testar o Fluxo Completo

1. **Abra o Maildev**: http://localhost:1080
2. **Acesse a aplicação**: http://localhost:3000/login
3. **Clique em "Esqueceu a senha?"** (link abaixo do campo de senha)
4. **Digite seu email** e clique em "Enviar link de recuperação"
5. **Veja a confirmação** na tela
6. **Abra o Maildev** (http://localhost:1080) e veja o email
7. **Clique no botão** ou copie o link do email
8. **Digite a nova senha** (mínimo 6 caracteres)
9. **Confirme a senha** e clique em "Redefinir senha"
10. **Aguarde o redirecionamento** para login
11. **Faça login** com a nova senha

## 🎉 Pronto!

Se tudo funcionar, você verá:
- ✅ Email no Maildev com template profissional
- ✅ Token validado corretamente
- ✅ Senha alterada no banco
- ✅ Login bem-sucedido com nova senha

## 🐛 Problemas?

### Maildev não inicia
```bash
# Verificar se as portas estão livres
lsof -i :1080
lsof -i :1025

# Matar processos se necessário
kill -9 $(lsof -t -i:1080)
```

### Email não aparece
1. Recarregue o Maildev (F5)
2. Verifique os logs do Next.js
3. Verifique `SMTP_HOST` e `SMTP_PORT` no `.env.local`

### Token inválido
- Tokens expiram em 1 hora
- Use um token novo se expirou
