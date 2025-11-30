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
  Settings,
} from 'lucide-react';

// Types for generation options
interface ImageScenario {
  id: string;
  name: string;
  preview: string;
  previewImage?: string; // URL da imagem de preview
}

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  previewVideo?: string; // URL do vídeo de preview
  previewImage?: string; // Thumbnail do template
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
    language?: string;
  };
  promotionalVideo?: {
    music: boolean;
    narration: boolean;
    subtitles: boolean;
    template: string;
    language?: string;
  };
  viralCopy?: {
    platform: string;
    tone: string;
    includeEmojis: boolean;
    includeHashtags: boolean;
    language: string;
  };
  productDescription?: {
    style: string;
    targetAudience: string;
    includeEmojis: boolean;
    language: string;
  };
  voiceOver?: {
    voice: string;
    tone: string;
    objective: string;
    speed: number;
    language: string;
  };
  captions?: {
    language: string;
    format: string;
  };
}

export default function GeneratePage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<string[]>([]);
  const [expandedOptions, setExpandedOptions] = useState<string[]>([]);
  const [isPlayingVoicePreview, setIsPlayingVoicePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
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
    enhancedImages: { 
      scenario: 'table',
      language: 'pt-BR',
    },
    promotionalVideo: {
      music: true,
      narration: false,
      subtitles: true,
      template: 'template-1',
      language: 'pt-BR',
    },
    viralCopy: {
      platform: 'instagram',
      tone: 'professional',
      includeEmojis: true,
      includeHashtags: true,
      language: 'pt-BR',
    },
    productDescription: {
      style: 'marketplace',
      targetAudience: 'general',
      includeEmojis: false,
      language: 'pt-BR',
    },
    voiceOver: {
      voice: 'pt-BR-female-1',
      tone: 'enthusiastic',
      objective: 'inform',
      speed: 1.0,
      language: 'pt-BR',
    },
    captions: {
      language: 'pt-BR',
      format: 'srt',
    },
  });

  // Available scenarios for enhanced images
  const imageScenarios: ImageScenario[] = [
    { 
      id: 'table', 
      name: 'Mesa Profissional', 
      preview: '🪑',
      previewImage: '/templates/scenarios/table.jpg' // Placeholder - você pode adicionar imagens reais
    },
    { 
      id: 'nature', 
      name: 'Natureza', 
      preview: '🌿',
      previewImage: '/templates/scenarios/nature.jpg'
    },
    { 
      id: 'minimal', 
      name: 'Minimalista', 
      preview: '⬜',
      previewImage: '/templates/scenarios/minimal.jpg'
    },
    { 
      id: 'lifestyle', 
      name: 'Lifestyle', 
      preview: '🏠',
      previewImage: '/templates/scenarios/lifestyle.jpg'
    },
    { 
      id: 'studio', 
      name: 'Estúdio', 
      preview: '📸',
      previewImage: '/templates/scenarios/studio.jpg'
    },
    { 
      id: 'random', 
      name: 'Aleatório', 
      preview: '🎲',
      previewImage: '/templates/scenarios/random.jpg'
    },
  ];

  // Available video templates
  const videoTemplates: VideoTemplate[] = [
    { 
      id: 'template-1', 
      name: 'Modelo 1', 
      description: 'Dinâmico e moderno',
      previewImage: '/templates/videos/template-1-thumb.jpg',
      previewVideo: '/templates/videos/template-1-preview.mp4'
    },
    { 
      id: 'template-2', 
      name: 'Modelo 2', 
      description: 'Elegante e minimalista',
      previewImage: '/templates/videos/template-2-thumb.jpg',
      previewVideo: '/templates/videos/template-2-preview.mp4'
    },
    { 
      id: 'template-3', 
      name: 'Modelo 3', 
      description: 'Energético e vibrante',
      previewImage: '/templates/videos/template-3-thumb.jpg',
      previewVideo: '/templates/videos/template-3-preview.mp4'
    },
    { 
      id: 'template-4', 
      name: 'Modelo 4', 
      description: 'Profissional e clean',
      previewImage: '/templates/videos/template-4-thumb.jpg',
      previewVideo: '/templates/videos/template-4-preview.mp4'
    },
  ];

  // Available voices
  const voiceOptions: VoiceOption[] = [
    { id: 'pt-BR-female-1', name: 'Ana (Feminina)', gender: 'female', language: 'pt-BR' },
    { id: 'pt-BR-female-2', name: 'Beatriz (Feminina)', gender: 'female', language: 'pt-BR' },
    { id: 'pt-BR-male-1', name: 'Carlos (Masculina)', gender: 'male', language: 'pt-BR' },
    { id: 'pt-BR-male-2', name: 'Daniel (Masculina)', gender: 'male', language: 'pt-BR' },
  ];

  // Available languages
  const languageOptions = [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
  ];

  // Social media platforms
  const platformOptions = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'twitter', name: 'Twitter/X' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'tiktok', name: 'TikTok' },
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
    setGenerationType(prev => {
      const newTypes = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      
      // Auto-expandir opções quando selecionar um tipo
      if (!prev.includes(type)) {
        setExpandedOptions(prevExpanded => 
          prevExpanded.includes(type) ? prevExpanded : [...prevExpanded, type]
        );
      } else {
        // Recolher quando desmarcar
        setExpandedOptions(prevExpanded => prevExpanded.filter(t => t !== type));
      }
      
      return newTypes;
    });
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

  const playVoicePreview = () => {
    setIsPlayingVoicePreview(true);
    
    // Simular preview de voz com Web Speech API (ou você pode usar Google TTS API)
    const utterance = new SpeechSynthesisUtterance(
      'Olá! Este é um exemplo de como ficará a narração do seu produto com as configurações selecionadas.'
    );
    
    // Configurar voz baseado na seleção
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => 
      v.lang.includes('pt-BR') && 
      (config.voiceOver?.voice.includes('female') ? v.name.includes('female') || v.name.includes('Google português do Brasil') : v.name.includes('male'))
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = config.voiceOver?.speed || 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsPlayingVoicePreview(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopVoicePreview = () => {
    window.speechSynthesis.cancel();
    setIsPlayingVoicePreview(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !productInfo.name || generationType.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Preparar FormData
      const formData = new FormData();
      
      // Adicionar imagem
      formData.append('image', selectedFile);
      
      // Adicionar informações do produto
      formData.append('productName', productInfo.name);
      if (productInfo.description) {
        formData.append('productDescription', productInfo.description);
      }
      if (productInfo.height) {
        formData.append('height', productInfo.height);
      }
      if (productInfo.width) {
        formData.append('width', productInfo.width);
      }
      if (productInfo.depth) {
        formData.append('depth', productInfo.depth);
      }
      if (productInfo.weight) {
        formData.append('weight', productInfo.weight);
      }
      
      // Preparar itens de geração com suas configurações
      const items = generationType.map(type => {
        const option = generationOptions.find(opt => opt.id === type);
        
        let itemConfig: any = {};
        
        // Adicionar configurações específicas de cada tipo
        if (type === 'enhanced-images') {
          itemConfig = config.enhancedImages || {};
        } else if (type === 'promotional-video') {
          itemConfig = config.promotionalVideo || {};
        } else if (type === 'viral-copy') {
          itemConfig = config.viralCopy || {};
        } else if (type === 'product-description') {
          itemConfig = config.productDescription || {};
        } else if (type === 'voice-over') {
          itemConfig = config.voiceOver || {};
        }
        
        return {
          type,
          credits: option?.credits || 0,
          config: itemConfig,
        };
      });
      
      formData.append('items', JSON.stringify(items));
      
      // Enviar para API
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar trabalho');
      }

      // Sucesso! Redirecionar para página de status do job
      window.location.href = `/jobs/${data.job.id}`;
    } catch (error) {
      console.error('Erro ao submeter:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao criar trabalho'
      );
    } finally {
      setIsSubmitting(false);
    }
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
      name: 'Copy para Redes Sociais',
      description: 'Copy otimizado para viralizar em Instagram, Facebook, Twitter, etc.',
      icon: FileText,
      credits: 5,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'product-description',
      name: 'Descrição de Produto',
      description: 'Descrição otimizada para marketplaces e ecommerces',
      icon: FileText,
      credits: 5,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'voice-over',
      name: 'Narração (Voice-over)',
      description: 'Locução profissional com TTS para seus vídeos',
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
                          Altura (cm){' '}
                          <span className="text-text-tertiary">(Opcional)</span>
                        </label>
                        <input
                          type="number"
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
                          Largura (cm){' '}
                          <span className="text-text-tertiary">(Opcional)</span>
                        </label>
                        <input
                          type="number"
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
                          Profundidade (cm){' '}
                          <span className="text-text-tertiary">(Opcional)</span>
                        </label>
                        <input
                          type="number"
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
                          Peso (g){' '}
                          <span className="text-text-tertiary">(Opcional)</span>
                        </label>
                        <input
                          type="number"
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
                        <strong>Dimensões e peso:</strong> apesar de opcionais,
                        ajudam muito a IA a criar descrições mais precisas do
                        produto.
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

                <div className="space-y-4">
                  {generationOptions.map(option => (
                    <div key={option.id} className={`rounded-xl border-2 transition-all ${
                      generationType.includes(option.id)
                        ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                        : 'border-border bg-background'
                    }`}>
                      <button
                        onClick={() => toggleGenerationType(option.id)}
                        disabled={!selectedFile}
                        className={`w-full p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}
                          >
                            <option.icon className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-text-primary">
                                {option.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1.5 text-primary-400">
                                  <Coins className="h-4 w-4" />
                                  <span className="text-sm font-semibold">
                                    {option.credits} créditos
                                  </span>
                                </div>
                                {generationType.includes(option.id) && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleExpandedOption(option.id);
                                    }}
                                    className="rounded-full p-1.5 text-text-tertiary hover:bg-background-tertiary hover:text-text-primary transition-colors"
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
                            <p className="text-sm text-text-secondary">
                              {option.description}
                            </p>
                            {generationType.includes(option.id) && (
                              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary-400">
                                <Settings className="h-4 w-4" />
                                <span>
                                  {expandedOptions.includes(option.id)
                                    ? 'Clique para ocultar configurações'
                                    : 'Clique para ver e personalizar configurações'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Configuration Options */}
                      {generationType.includes(option.id) &&
                        expandedOptions.includes(option.id) && (
                          <div className="border-t border-primary-500/20 bg-gradient-to-b from-primary-500/5 to-transparent p-6 mt-1">
                            <div className="mb-4 flex items-center gap-2 text-primary-400">
                              <Settings className="h-5 w-5" />
                              <h4 className="font-semibold">Configurações Personalizadas</h4>
                            </div>
                            
                            {/* Enhanced Images Config */}
                            {option.id === 'enhanced-images' && (
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Escolha o Cenário
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
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
                                      className={`group relative overflow-hidden rounded-lg border transition-all ${
                                        config.enhancedImages?.scenario ===
                                        scenario.id
                                          ? 'border-primary-500 ring-2 ring-primary-500/20'
                                          : 'border-border hover:border-primary-500/50'
                                      }`}
                                    >
                                      {/* Preview Image */}
                                      <div className="relative aspect-square w-full overflow-hidden bg-background-secondary">
                                        {scenario.previewImage ? (
                                          <img
                                            src={scenario.previewImage}
                                            alt={scenario.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              // Fallback se a imagem não carregar
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        {/* Fallback emoji */}
                                        <div className={`flex h-full w-full items-center justify-center text-4xl ${scenario.previewImage ? 'hidden' : ''}`}>
                                          {scenario.preview}
                                        </div>
                                      </div>
                                      {/* Scenario Name */}
                                      <div className="p-2 text-center">
                                        <div className="text-xs font-medium text-text-primary">
                                          {scenario.name}
                                        </div>
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
                                    Modelo de Vídeo
                                  </label>
                                  <div className="grid grid-cols-2 gap-3">
                                    {videoTemplates.map(template => (
                                      <button
                                        key={template.id}
                                        onClick={() =>
                                          updateConfig(
                                            'promotionalVideo',
                                            'template',
                                            template.id
                                          )
                                        }
                                        className={`group relative overflow-hidden rounded-lg border transition-all ${
                                          config.promotionalVideo?.template ===
                                          template.id
                                            ? 'border-primary-500 ring-2 ring-primary-500/20'
                                            : 'border-border hover:border-primary-500/50'
                                        }`}
                                      >
                                        {/* Preview Image/Video */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-background-secondary">
                                          {template.previewImage ? (
                                            <img
                                              src={template.previewImage}
                                              alt={template.name}
                                              className="h-full w-full object-cover"
                                              onError={(e) => {
                                                // Fallback se a imagem não carregar
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                              }}
                                            />
                                          ) : null}
                                          {/* Fallback icon */}
                                          <div className={`flex h-full w-full items-center justify-center ${template.previewImage ? 'hidden' : ''}`}>
                                            <Video className="h-12 w-12 text-text-tertiary" />
                                          </div>
                                          {/* Play overlay for video preview */}
                                          {template.previewVideo && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                  <path d="M8 5v14l11-7z" />
                                                </svg>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        {/* Template Info */}
                                        <div className="p-3 text-left">
                                          <div className="font-medium text-text-primary">
                                            {template.name}
                                          </div>
                                          <div className="text-xs text-text-tertiary">
                                            {template.description}
                                          </div>
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
                                  Configurações de Copy para Redes Sociais
                                </h4>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Plataforma
                                  </label>
                                  <select
                                    value={config.viralCopy?.platform}
                                    onChange={e =>
                                      updateConfig('viralCopy', 'platform', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    {platformOptions.map(platform => (
                                      <option key={platform.id} value={platform.id}>
                                        {platform.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

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
                                    <option value="friendly">Amigável</option>
                                    <option value="luxury">Luxo</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Idioma
                                  </label>
                                  <select
                                    value={config.viralCopy?.language}
                                    onChange={e =>
                                      updateConfig('viralCopy', 'language', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    {languageOptions.map(lang => (
                                      <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center justify-between">
                                  <label className="text-sm text-text-secondary">
                                    Incluir Emojis
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateConfig('viralCopy', 'includeEmojis', !config.viralCopy?.includeEmojis)
                                    }
                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                      config.viralCopy?.includeEmojis
                                        ? 'bg-primary-500'
                                        : 'bg-gray-600'
                                    }`}
                                  >
                                    <span
                                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                        config.viralCopy?.includeEmojis ? 'translate-x-5' : ''
                                      }`}
                                    />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between">
                                  <label className="text-sm text-text-secondary">
                                    Incluir Hashtags
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateConfig('viralCopy', 'includeHashtags', !config.viralCopy?.includeHashtags)
                                    }
                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                      config.viralCopy?.includeHashtags
                                        ? 'bg-primary-500'
                                        : 'bg-gray-600'
                                    }`}
                                  >
                                    <span
                                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                        config.viralCopy?.includeHashtags ? 'translate-x-5' : ''
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Product Description Config */}
                            {option.id === 'product-description' && (
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                                  <Info className="h-4 w-4" />
                                  Configurações de Descrição de Produto
                                </h4>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Estilo
                                  </label>
                                  <select
                                    value={config.productDescription?.style}
                                    onChange={e =>
                                      updateConfig('productDescription', 'style', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="marketplace">Marketplace (Amazon, Mercado Livre)</option>
                                    <option value="ecommerce">Ecommerce (Loja Online)</option>
                                    <option value="professional">Profissional (B2B)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Público-Alvo
                                  </label>
                                  <select
                                    value={config.productDescription?.targetAudience}
                                    onChange={e =>
                                      updateConfig('productDescription', 'targetAudience', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    <option value="general">Público Geral</option>
                                    <option value="young-adults">Jovens Adultos</option>
                                    <option value="professionals">Profissionais</option>
                                    <option value="parents">Pais e Mães</option>
                                    <option value="tech-savvy">Entusiastas de Tecnologia</option>
                                    <option value="luxury">Consumidores Premium</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm text-text-secondary">
                                    Idioma
                                  </label>
                                  <select
                                    value={config.productDescription?.language}
                                    onChange={e =>
                                      updateConfig('productDescription', 'language', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    {languageOptions.map(lang => (
                                      <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center justify-between">
                                  <label className="text-sm text-text-secondary">
                                    Incluir Emojis
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateConfig('productDescription', 'includeEmojis', !config.productDescription?.includeEmojis)
                                    }
                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                      config.productDescription?.includeEmojis
                                        ? 'bg-primary-500'
                                        : 'bg-gray-600'
                                    }`}
                                  >
                                    <span
                                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                        config.productDescription?.includeEmojis ? 'translate-x-5' : ''
                                      }`}
                                    />
                                  </button>
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
                                    Idioma
                                  </label>
                                  <select
                                    value={config.voiceOver?.language}
                                    onChange={e =>
                                      updateConfig('voiceOver', 'language', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                  >
                                    {languageOptions.map(lang => (
                                      <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                      </option>
                                    ))}
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

                                {/* Voice Preview Button */}
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={isPlayingVoicePreview ? stopVoicePreview : playVoicePreview}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-500 bg-primary-500/10 px-4 py-3 font-medium text-primary-400 transition-all hover:bg-primary-500/20"
                                  >
                                    {isPlayingVoicePreview ? (
                                      <>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                        <span>Parar Preview</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                        <span>Ouvir Preview da Voz</span>
                                      </>
                                    )}
                                  </button>
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

                {submitError && (
                  <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                    {submitError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={
                    !selectedFile ||
                    !productInfo.name ||
                    generationType.length === 0 ||
                    !hasEnoughCredits ||
                    isSubmitting
                  }
                  className="w-full rounded-lg bg-gradient-cta py-4 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting
                    ? 'Criando trabalho...'
                    : !selectedFile
                      ? 'Faça upload de uma foto'
                      : !productInfo.name
                        ? 'Preencha o nome do produto'
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
