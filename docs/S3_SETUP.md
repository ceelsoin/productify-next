# Configuração S3 para Upload de Imagens

## Por que S3?

A integração com **Kie.ai** (utilizada para geração de imagens com Nano Banana Edit) requer que as imagens estejam disponíveis publicamente na internet. A Kie.ai precisa fazer o download da imagem original para processá-la e gerar as versões aprimoradas.

Por isso, ao invés de usar o armazenamento local do Next.js, enviamos as imagens para um bucket S3 público.

## Opções de Provedores S3

Você pode usar qualquer provedor compatível com S3:

### 1. **Linode Object Storage** (Recomendado - Melhor custo-benefício)
- Preço: $5/mês para 250GB
- Endpoint: `us-east-1.linodeobjects.com` (ou região escolhida)
- Console: https://cloud.linode.com/object-storage/buckets

### 2. **DigitalOcean Spaces**
- Preço: $5/mês para 250GB
- Endpoint: `nyc3.digitaloceanspaces.com` (ou região escolhida)
- Console: https://cloud.digitalocean.com/spaces

### 3. **AWS S3**
- Preço variável (pay-per-use)
- Endpoint: `s3.amazonaws.com` + região
- Console: https://console.aws.amazon.com/s3

### 4. **Backblaze B2** (Alternativa mais barata)
- Preço: Primeiros 10GB grátis, depois ~$0.005/GB
- Compatível com S3 API
- Console: https://www.backblaze.com/b2/cloud-storage.html

## Como Configurar (Exemplo com Linode)

### Passo 1: Criar Bucket

1. Acesse: https://cloud.linode.com/object-storage/buckets
2. Clique em "Create Bucket"
3. Escolha:
   - **Label**: `productify-media` (ou nome de sua preferência)
   - **Region**: `us-east-1` (ou mais próximo do seu servidor)
   - **Access**: **Public** (importante!)
4. Clique em "Create Bucket"

### Passo 2: Gerar Access Keys

1. No Linode Cloud Manager, vá para "Object Storage" > "Access Keys"
2. Clique em "Create Access Key"
3. Label: `productify-app`
4. Permissions:
   - **Read/Write**: Selecione seu bucket `productify-media`
5. Clique em "Submit"
6. **Copie e guarde**: Access Key e Secret Key (não poderá ver novamente!)

### Passo 3: Configurar Variáveis de Ambiente

Adicione ao `.env` e `workers/.env`:

```bash
# S3 Configuration (Linode)
S3_ENDPOINT=us-east-1.linodeobjects.com
S3_BUCKET_NAME=productify-media
S3_ACCESS_KEY=seu_access_key_aqui
S3_SECRET_KEY=seu_secret_key_aqui
```

**Para AWS S3:**
```bash
S3_ENDPOINT=s3.us-east-1.amazonaws.com
S3_BUCKET_NAME=productify-media
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Para DigitalOcean Spaces:**
```bash
S3_ENDPOINT=nyc3.digitaloceanspaces.com
S3_BUCKET_NAME=productify-media
S3_ACCESS_KEY=seu_spaces_key_aqui
S3_SECRET_KEY=seu_spaces_secret_aqui
```

### Passo 4: Configurar CORS (Importante!)

Para permitir que o navegador faça upload direto (se necessário), configure CORS no bucket:

**Linode/DigitalOcean/AWS:**
1. Acesse as configurações do bucket
2. Vá para "CORS Configuration"
3. Adicione:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**Produção:** Substitua `"*"` pelo domínio real:
```json
"AllowedOrigins": ["https://productify.app"]
```

### Passo 5: Testar Configuração

Execute o comando de teste:

```bash
cd workers
npm run test:s3
```

Ou crie um teste manual:

```typescript
import { s3Service } from './src/services/s3.service';

async function testS3() {
  try {
    const testUrl = await s3Service.uploadBuffer(
      Buffer.from('Hello S3!'),
      'test.txt',
      'text/plain'
    );
    console.log('✅ Upload bem-sucedido!');
    console.log('URL:', testUrl);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testS3();
```

## Estrutura de URLs

Após o upload, as imagens terão URLs no formato:

**Linode:**
```
https://us-east-1.linodeobjects.com/productify-media/1234567890-produto.jpg
```

**DigitalOcean:**
```
https://productify-media.nyc3.digitaloceanspaces.com/1234567890-produto.jpg
```

**AWS S3:**
```
https://productify-media.s3.us-east-1.amazonaws.com/1234567890-produto.jpg
```

## Permissões do Bucket

### Bucket Policy (AWS S3)

Para tornar todos os objetos públicos automaticamente:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::productify-media/*"
    }
  ]
}
```

### ACL (Linode/DigitalOcean)

O serviço S3 já configura `ACL: 'public-read'` automaticamente em cada upload.

## Custos Estimados

Para um app com **1000 uploads/mês**:

| Provedor | Custo Mensal | Storage (250GB) | Transferência |
|----------|--------------|-----------------|---------------|
| **Linode** | $5 fixo | Incluído | 1TB incluído |
| **DigitalOcean** | $5 fixo | Incluído | 1TB incluído |
| **AWS S3** | ~$6-10 variável | $0.023/GB | $0.09/GB |
| **Backblaze B2** | ~$1.25 | $0.005/GB | Grátis (primeiros 3x storage) |

**Recomendação:** Linode ou DigitalOcean para previsibilidade de custos.

## Troubleshooting

### Erro: "Access Denied"
- Verifique se as Access Keys estão corretas
- Confirme que o bucket tem permissão de escrita
- Verifique se o endpoint está correto

### Erro: "NoSuchBucket"
- Confirme o nome do bucket em `S3_BUCKET_NAME`
- Verifique se o bucket existe no painel

### Imagens não aparecem (404)
- Confirme que o bucket está configurado como **público**
- Verifique a ACL do objeto: deve ser `public-read`
- Teste acessando a URL diretamente no navegador

### Erro: "SignatureDoesNotMatch"
- Revise `S3_SECRET_KEY` - pode ter espaços ou caracteres extras
- Verifique se o endpoint está correto (com ou sem `https://`)

## Segurança

### Produção

1. **Nunca commite** as keys no Git
2. Use `.env` (já no `.gitignore`)
3. Rotacione as keys periodicamente
4. Configure alertas de custo no provedor
5. Use CORS restrito ao domínio de produção

### Opcional: Cloudflare R2

Para custos ainda menores (sem cobrança de egress):
- $0.015/GB storage
- $0 de transferência
- Compatível com S3 API
- https://www.cloudflare.com/products/r2/

## Referências

- [Linode Object Storage Docs](https://www.linode.com/docs/products/storage/object-storage/)
- [DigitalOcean Spaces Docs](https://docs.digitalocean.com/products/spaces/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Backblaze B2 S3 Compatible API](https://www.backblaze.com/b2/docs/s3_compatible_api.html)
