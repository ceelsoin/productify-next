/**
 * Define as dependências de cada tipo de job
 * Um job só pode ser executado se suas dependências já foram concluídas
 */
export const JOB_DEPENDENCIES: Record<string, string[]> = {
  'enhanced-images': [], // Não tem dependências
  'viral-copy': [], // Não tem dependências
  'product-description': [], // Não tem dependências
  'voice-over': ['viral-copy'], // Precisa do texto para gerar áudio
  'captions': ['voice-over'], // Precisa do áudio para gerar legendas
  'promotional-video': ['enhanced-images'], // Precisa de pelo menos imagens
};

/**
 * Determinar qual pipeline usar baseado nos items do job
 * Retorna um ID único de pipeline baseado nos tipos selecionados
 * O orchestrator criará o pipeline dinamicamente respeitando as dependências
 */
export function determinePipeline(items: Array<{ type: string }>): string {
  const types = items.map(item => item.type).sort();
  
  // Criar um ID único baseado nos tipos selecionados
  // Exemplo: "enhanced-images+product-description+viral-copy"
  const pipelineId = types.join('+');
  
  console.log(`[PipelineMapper] Determined pipeline ID: ${pipelineId}`);
  console.log(`[PipelineMapper] Job types:`, types);
  
  return pipelineId;
}

/**
 * Verifica se um tipo de job tem todas as suas dependências satisfeitas
 */
export function areDependenciesSatisfied(
  jobType: string,
  completedTypes: Set<string>
): boolean {
  const dependencies = JOB_DEPENDENCIES[jobType] || [];
  return dependencies.every(dep => completedTypes.has(dep));
}

/**
 * Retorna as dependências de um tipo de job
 */
export function getDependencies(jobType: string): string[] {
  return JOB_DEPENDENCIES[jobType] || [];
}
