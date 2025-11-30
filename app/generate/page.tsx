'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
  Sparkles,
  Coins,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
} from 'lucide-react';

// Types for generation options
interface ImageScenario {
  id: string;
  name: string;
  preview: string;
}

interface VideoTransition {
  id: string;
  name: string;
  preview: string;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
}

interface GenerationConfig {
  enhancedImages?: {
    scenario: string;
  };
  promotionalVideo?: {
    music: boolean;
    narration: boolean;
    subtitles: boolean;
    transition: string;
  };
  viralCopy?: {
    tone: string;
    objective: string;
    style: string;
  };
  voiceOver?: {
    voice: string;
    tone: string;
    objective: string;
    speed: number;
  };
}

export default function GeneratePage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<string[]>([]);
  const [expandedOptions, setExpandedOptions] = useState<string[]>([]);
  
  // Product information
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    height: '',
    width: '',
    depth: '',
    weight: '',
  });

  // Generation configurations
  const [config, setConfig] = useState<GenerationConfig>({
    enhancedImages: { scenario: 'table' },
    promotionalVideo: {
      music: true,
      narration: false,
      subtitles: true,
      transition: 'fade',
    },
    viralCopy: {
      tone: 'professional',
      objective: 'sell',
      style: 'persuasive',
    },
    voiceOver: {
      voice: 'pt-BR-female-1',
      tone: 'enthusiastic',
      objective: 'inform',
      speed: 1.0,
    },
  });

  // Available scenarios for enhanced images
  const imageScenarios: ImageScenario[] = [
    { id: 'table', name: 'Mesa Profissional', preview: '🪑' },
    { id: 'nature', name: 'Natureza', preview: '🌿' },
    { id: 'minimal', name: 'Minimalista', preview: '⬜' },
    { id: 'lifestyle', name: 'Lifestyle', preview: '🏠' },
    { id: 'studio', name: 'Estúdio', preview: '📸' },
    { id: 'random', name: 'Aleatório', preview: '🎲' },
  ];

  // Available video transitions
  const videoTransitions: VideoTransition[] = [
    { id: 'fade', name: 'Fade', preview: '→' },
    { id: 'slide', name: 'Slide', preview: '⇒' },
    { id: 'zoom', name: 'Zoom', preview: '🔍' },
    { id: 'dissolve', name: 'Dissolve', preview: '✨' },
    { id: 'wipe', name: 'Wipe', preview: '↔' },
  ];

  // Available voices
  const voiceOptions: VoiceOption[] = [
    { id: 'pt-BR-female-1', name: 'Ana (Feminina)', gender: 'female', language: 'pt-BR' },
    { id: 'pt-BR-female-2', name: 'Beatriz (Feminina)', gender: 'female', language: 'pt-BR' },
    { id: 'pt-BR-male-1', name: 'Carlos (Masculina)', gender: 'male', language: 'pt-BR' },
    { id: 'pt-BR-male-2', name: 'Daniel (Masculina)', gender: 'male', language: 'pt-BR' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGenerationType = (type: string) => {
    setGenerationType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleExpandedOption = (type: string) => {
    setExpandedOptions(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const updateConfig = (type: string, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof GenerationConfig],
        [key]: value,
      },
    }));
  };

  const generationOptions = [
    {
      id: 'enhanced-images',
      name: 'Imagens Aprimoradas',
      description: '6 variações com IA (iluminação, fundo, nitidez)',
      icon: ImageIcon,
      credits: 10,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'promotional-video',
      name: 'Vídeo Promocional',
      description: 'Vídeo com transições e efeitos profissionais',
      icon: Video,
      credits: 30,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'viral-copy',
      name: 'Copy Viral',
      description: 'Legendas e descrições otimizadas para vendas',
      icon: FileText,
      credits: 5,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'voice-over',
      name: 'Narração (Voice-over)',
      description: 'Locução profissional com Google TTS',
      icon: Mic,
      credits: 15,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const totalCredits = generationType.reduce((acc, type) => {
    const option = generationOptions.find(opt => opt.id === type);
    return acc + (option?.credits || 0);
  }, 0);

  const hasEnoughCredits = (session?.user.credits || 0) >= totalCredits;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-24">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-cta">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary">
              Gerar Conteúdo
            </h1>
          </div>
          <p className="text-lg text-text-secondary">
            Faça upload da foto do seu produto e escolha o que deseja gerar
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-background-tertiary p-6">
                <h2 className="mb-4 text-xl font-semibold text-text-primary">
                  1. Foto do Produto
                </h2>

                {!previewUrl ? (
                  <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-12 transition-colors hover:border-primary-500 hover:bg-background-secondary">
                    <Upload className="mb-4 h-12 w-12 text-text-tertiary transition-colors group-hover:text-primary-400" />
                    <p className="mb-2 text-center font-medium text-text-primary">
                      Clique para fazer upload
                    </p>
                    <p className="text-center text-sm text-text-tertiary">
                      PNG, JPG ou WEBP até 10MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-auto w-full rounded-xl border border-border"
                    />
                    <button
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="absolute right-3 top-3 rounded-lg bg-background/90 px-4 py-2 text-sm font-medium text-text-primary backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      Trocar foto
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              {selectedFile && (
                <div className="rounded-2xl border border-border bg-background-tertiary p-6">
                  <h2 className="mb-4 text-xl font-semibold text-text-primary">
                    2. Informações do Produto
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-secondary">
                        Nome do Produto <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={productInfo.name}
                        onChange={e =>
                          setProductInfo({ ...productInfo, name: e.target.value })
                        }
                        placeholder="Ex: Tênis Esportivo Pro"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                          Altura (cm) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={productInfo.height}
                          onChange={e =>
                            setProductInfo({ ...productInfo, height: e.target.value })
                          }
                          placeholder="15"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                          Largura (cm) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={productInfo.width}
                          onChange={e =>
                            setProductInfo({ ...productInfo, width: e.target.value })
                          }
                          placeholder="10"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                          Profundidade (cm) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={productInfo.depth}
                          onChange={e =>
                            setProductInfo({ ...productInfo, depth: e.target.value })
                          }
                          placeholder="8"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                          Peso (g) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={productInfo.weight}
                          onChange={e =>
                            setProductInfo({ ...productInfo, weight: e.target.value })
                          }
                          placeholder="200"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-secondary">
                        Descrição Breve{' '}
                        <span className="text-text-tertiary">(Opcional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={productInfo.description}
                        onChange={e =>
                          setProductInfo({
                            ...productInfo,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descreva os pontos fortes do produto para auxiliar a IA..."
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              {selectedFile && (
                <div className="rounded-2xl border border-border bg-blue-500/10 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-blue-400">
                      Dicas para melhores resultados
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        Use fotos bem iluminadas, com o produto isolado e
                        inteiro.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        Garanta que a cor real apareça; isso melhora o título
                        sugerido.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        Imagens até 10MB. Use ferramentas de compressão se
                        necessário.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        Renomeie o projeto e refine descrições para
                        personalizar os resultados.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Generation Options */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-background-tertiary p-6">
                <h2 className="mb-4 text-xl font-semibold text-text-primary">
                  3. O que deseja gerar?
                </h2>

                <div className="space-y-3">
                  {generationOptions.map(option => (
                    <div key={option.id}>
                      <button
                        onClick={() => toggleGenerationType(option.id)}
                        disabled={!selectedFile}
                        className={`w-full rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          generationType.includes(option.id)
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-border bg-background hover:border-primary-500/50 hover:bg-background-secondary'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${option.color}`}
                          >
                            <option.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className="font-semibold text-text-primary">
                                {option.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-primary-400">
                                  <Coins className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {option.credits}
                                  </span>
                                </div>
                                {generationType.includes(option.id) && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleExpandedOption(option.id);
                                    }}
                                    className="text-text-tertiary hover:text-text-primary"
                                  >
                                    {expandedOptions.includes(option.id) ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-text-tertiary">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Configuration Options */}
                      {generationType.includes(option.id) &&
                        expandedOptions.includes(option.id) && (
                          <div className="mt-2 rounded-lg border border-border bg-background-secondary p-4">
                            {/* Enhanced Images Config */}
                            {option.id === 'enhanced-images' && (
                              <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Configurações de Cenário
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {imageScenarios.map(scenario => (
                                    <button
                                      key={scenario.id}
                                      onClick={() =>
                                        updateConfig(
                                          'enhancedImages',
                                          'scenario',
                                          scenario.id
                                        )
                                      }
                                      className={`rounded-lg border p-3 text-center transition-all ${
                                        config.enhancedImages?.scenario ===
                                        scenario.id
                                          ? 'border-primary-500 bg-primary-500/10'
                                          : 'border-border hover:border-primary-500/50'
                                      }`}
                                    >
                                      <div className="mb-1 text-2xl">
                                        {scenario.preview}
                                      </div>
                                      <div className="text-xs text-text-secondary">
                                        {scenario.name}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Promotional Video Config */}
                            {option.id === 'promotional-video' && (
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Configurações de Vídeo
                                </h4>

                                <div className="space-y-3">
                                  <label className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">
                                      Música ambiente
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={config.promotionalVideo?.music}
                                      onChange={e =>
                                        updateConfig(
                                          'promotionalVideo',
                                          'music',
                                          e.target.checked
                                        )
                                      }
                                      className="h-5 w-5 rounded border-border bg-background text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                  </label>

                                  <label className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">
                                      Narração
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={config.promotionalVideo?.narration}
                                      onChange={e =>
                                        updateConfig(
                                          'promotionalVideo',
                                          'narration',
                                          e.target.checked
                                        )
                                      }
                                      className="h-5 w-5 rounded border-border bg-background text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                  </label>

                                  <label className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">
                                      Legendas automáticas
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={config.promotionalVideo?.subtitles}
                                      onChange={e =>
                                        updateConfig(
                                          'promotionalVideo',
                                          'subtitles',
                                          e.target.checked
                                        )
                                      }
                                      className="h-5 w-5 rounded border-border bg-background text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                  </label>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Modelo de Transição
                                  </label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {videoTransitions.map(transition => (
                                      <button
                                        key={transition.id}
                                        onClick={() =>
                                          updateConfig(
                                            'promotionalVideo',
                                            'transition',
                                            transition.id
                                          )
                                        }
                                        className={`rounded-lg border p-2 text-center transition-all ${
                                          config.promotionalVideo?.transition ===
                                          transition.id
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-border hover:border-primary-500/50'
                                        }`}
                                      >
                                        <div className="mb-1 text-lg">
                                          {transition.preview}
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                          {transition.name}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Viral Copy Config */}
                            {option.id === 'viral-copy' && (
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Configurações de Copy
                                </h4>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Tonalidade
                                  </label>
                                  <select
                                    value={config.viralCopy?.tone}
                                    onChange={e =>
                                      updateConfig('viralCopy', 'tone', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="professional">Profissional</option>
                                    <option value="casual">Casual</option>
                                    <option value="enthusiastic">Entusiasmado</option>
                                    <option value="humorous">Humorístico</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Objetivo
                                  </label>
                                  <select
                                    value={config.viralCopy?.objective}
                                    onChange={e =>
                                      updateConfig(
                                        'viralCopy',
                                        'objective',
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="sell">Vender</option>
                                    <option value="inform">Informar</option>
                                    <option value="engage">Engajar</option>
                                    <option value="educate">Educar</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Estilo
                                  </label>
                                  <select
                                    value={config.viralCopy?.style}
                                    onChange={e =>
                                      updateConfig('viralCopy', 'style', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="persuasive">Persuasivo</option>
                                    <option value="storytelling">Storytelling</option>
                                    <option value="direct">Direto</option>
                                    <option value="emotional">Emocional</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Voice Over Config */}
                            {option.id === 'voice-over' && (
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Configurações de Narração
                                </h4>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Voz
                                  </label>
                                  <select
                                    value={config.voiceOver?.voice}
                                    onChange={e =>
                                      updateConfig('voiceOver', 'voice', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    {voiceOptions.map(voice => (
                                      <option key={voice.id} value={voice.id}>
                                        {voice.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Tonalidade
                                  </label>
                                  <select
                                    value={config.voiceOver?.tone}
                                    onChange={e =>
                                      updateConfig('voiceOver', 'tone', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="enthusiastic">Entusiasmado</option>
                                    <option value="calm">Calmo</option>
                                    <option value="energetic">Energético</option>
                                    <option value="serious">Sério</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Objetivo
                                  </label>
                                  <select
                                    value={config.voiceOver?.objective}
                                    onChange={e =>
                                      updateConfig(
                                        'voiceOver',
                                        'objective',
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="inform">Informar</option>
                                    <option value="sell">Vender</option>
                                    <option value="explain">Explicar</option>
                                    <option value="entertain">Entreter</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 flex items-center justify-between text-sm text-text-secondary">
                                    <span>Velocidade</span>
                                    <span className="font-medium text-text-primary">
                                      {config.voiceOver?.speed}x
                                    </span>
                                  </label>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={config.voiceOver?.speed}
                                    onChange={e =>
                                      updateConfig(
                                        'voiceOver',
                                        'speed',
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    className="w-full"
                                  />
                                  <div className="mt-1 flex justify-between text-xs text-text-tertiary">
                                    <span>Lento</span>
                                    <span>Normal</span>
                                    <span>Rápido</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & CTA */}
              <div className="rounded-2xl border border-border bg-background-tertiary p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-text-secondary">
                    Total de créditos:
                  </span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary-400" />
                    <span className="text-xl font-bold text-text-primary">
                      {totalCredits}
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-text-secondary">Seus créditos:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary-400" />
                    <span className="text-xl font-bold text-text-primary">
                      {session?.user.credits || 0}
                    </span>
                  </div>
                </div>

                {!hasEnoughCredits && generationType.length > 0 && (
                  <div className="mb-4 rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 text-sm text-orange-400">
                    Créditos insuficientes. Adicione mais créditos para
                    continuar.
                  </div>
                )}

                <button
                  disabled={
                    !selectedFile ||
                    !productInfo.name ||
                    !productInfo.height ||
                    !productInfo.width ||
                    !productInfo.depth ||
                    !productInfo.weight ||
                    generationType.length === 0 ||
                    !hasEnoughCredits
                  }
                  className="w-full rounded-lg bg-gradient-cta py-4 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {!selectedFile
                    ? 'Faça upload de uma foto'
                    : !productInfo.name ||
                        !productInfo.height ||
                        !productInfo.width ||
                        !productInfo.depth ||
                        !productInfo.weight
                      ? 'Preencha as informações do produto'
                      : generationType.length === 0
                        ? 'Selecione pelo menos uma opção'
                        : !hasEnoughCredits
                          ? 'Créditos insuficientes'
                          : 'Gerar Conteúdo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
