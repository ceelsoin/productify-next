/**
 * Simple template engine for prompt generation
 * Supports {{variable}} syntax and basic conditionals
 */
export class PromptTemplateService {
  /**
   * Replace variables in template
   * Supports: {{variable}}, {{#if condition}}...{{/if}}, {{#if condition}}...{{else}}...{{/if}}
   */
  static render(template: string, variables: Record<string, any>): string {
    let result = template;

    // Handle if/else blocks first
    result = this.processConditionals(result, variables);

    // Replace simple variables
    result = this.replaceVariables(result, variables);

    return result.trim();
  }

  /**
   * Process {{#if condition}}...{{else}}...{{/if}} blocks
   */
  private static processConditionals(template: string, variables: Record<string, any>): string {
    let result = template;

    // Match {{#if condition}}...{{else}}...{{/if}}
    const ifElseRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifElseRegex, (_match, condition, trueBranch, falseBranch) => {
      const shouldShow = this.evaluateCondition(condition, variables);
      return shouldShow ? trueBranch : falseBranch;
    });

    // Match {{#if condition}}...{{/if}} (without else)
    const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifRegex, (_match, condition, content) => {
      const shouldShow = this.evaluateCondition(condition, variables);
      return shouldShow ? content : '';
    });

    return result;
  }

  /**
   * Evaluate a condition
   */
  private static evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    // Handle simple variable checks
    if (!condition.includes('===') && !condition.includes('!==')) {
      const varName = condition.trim();
      const value = variables[varName];
      return !!value; // Truthy check
    }

    // Handle === comparison
    if (condition.includes('===')) {
      const [left, right] = condition.split('===').map(s => s.trim());
      const leftValue = this.resolveValue(left, variables);
      const rightValue = this.resolveValue(right, variables);
      return leftValue === rightValue;
    }

    // Handle !== comparison
    if (condition.includes('!==')) {
      const [left, right] = condition.split('!==').map(s => s.trim());
      const leftValue = this.resolveValue(left, variables);
      const rightValue = this.resolveValue(right, variables);
      return leftValue !== rightValue;
    }

    return false;
  }

  /**
   * Resolve a value from variables or return literal
   */
  private static resolveValue(value: string, variables: Record<string, any>): any {
    // Remove quotes if it's a string literal
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1);
    }

    // Check if it's a variable
    if (variables.hasOwnProperty(value)) {
      return variables[value];
    }

    // Return as-is (for boolean literals, etc)
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);

    return value;
  }

  /**
   * Replace simple {{variable}} placeholders
   */
  private static replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^#/}]+)\}\}/g, (_match, varName) => {
      const key = varName.trim();
      const value = variables[key];
      
      // Return empty string if undefined/null, otherwise stringify
      if (value === undefined || value === null) {
        return '';
      }
      
      return String(value);
    });
  }
}
