# Orchestrator Worker

O orquestrador é um worker Bull que gerencia a execução de pipelines complexos com dependências entre workers.

## Como Funciona

### 1. Adicionar Job ao Orquestrador

A aplicação Next.js adiciona um job à fila `orchestrator-queue`:

```typescript
import { queueManager } from '@/lib/queue-manager';

await queueManager.addJob('orchestrator-queue', {
  jobId: job._id.toString(),
  pipelineName: 'promotional-video-full',
});
```

### 2. Orquestrador Inicia Pipeline

O orquestrador:
1. Busca a definição do pipeline (ex: `promotional-video-full`)
2. Identifica quais steps não têm dependências
3. Adiciona esses steps às suas respectivas filas
4. Monitora a conclusão de cada step

### 3. Workers Processam Steps

Cada worker processa seu step e retorna resultado:
- `images-queue` → ImageEnhancementWorker
- `text-queue` → TextGenerationWorker
- `voiceover-queue` → VoiceOverWorker
- `captions-queue` → CaptionGenerationWorker
- `video-queue` → VideoGenerationWorker

### 4. Orquestrador Rastreia Conclusões

Quando um step é concluído:
1. Orquestrador armazena o resultado
2. Verifica quais próximos steps podem ser executados
3. Adiciona steps prontos às suas filas
4. Repete até todos os steps serem concluídos

## Pipelines Disponíveis

### `enhanced-images-only`
```
[ENHANCED_IMAGES] → Fim
```

### `viral-copy-only`
```
[VIRAL_COPY] → Fim
```

### `voice-over-only`
```
[VIRAL_COPY] → [VOICE_OVER] → Fim
```

### `promotional-video-basic`
```
[ENHANCED_IMAGES] → [PROMOTIONAL_VIDEO] → Fim
```

### `promotional-video-with-text`
```
[ENHANCED_IMAGES]
[VIRAL_COPY]
         ↓
[PROMOTIONAL_VIDEO] → Fim
```

### `promotional-video-with-voiceover`
```
[ENHANCED_IMAGES]
[VIRAL_COPY] → [VOICE_OVER]
                    ↓
         [PROMOTIONAL_VIDEO] → Fim
```

### `promotional-video-full` (Completo)
```
[ENHANCED_IMAGES]
[VIRAL_COPY] → [VOICE_OVER] → [CAPTIONS]
                                  ↓
                      [PROMOTIONAL_VIDEO] → Fim
```

## Executando

### Modo Desenvolvimento

```bash
# Apenas orquestrador
npm run orchestrator

# Todos os workers + orquestrador
npm run worker:all
```

### Adicionar Novo Pipeline

Edite `src/core/pipelines.ts`:

```typescript
export const PIPELINES: Record<string, Pipeline> = {
  'meu-pipeline': {
    name: 'Meu Pipeline',
    description: 'Pipeline customizado',
    steps: [
      {
        type: JobType.ENHANCED_IMAGES,
        config: { count: 5 },
      },
      {
        type: JobType.VIRAL_COPY,
        config: { platform: 'instagram' },
      },
      {
        type: JobType.PROMOTIONAL_VIDEO,
        dependsOn: [JobType.ENHANCED_IMAGES, JobType.VIRAL_COPY],
        config: { duration: 30 },
      },
    ],
  },
};
```

## Vantagens

✅ **Declarativo**: Pipelines definidos em JSON  
✅ **Flexível**: Fácil adicionar/remover steps  
✅ **Paralelo**: Steps sem dependências rodam simultaneamente  
✅ **Resiliente**: Retry automático em cada step  
✅ **Escalável**: Workers podem rodar em máquinas diferentes  
✅ **Rastreável**: Progresso de cada step no MongoDB
