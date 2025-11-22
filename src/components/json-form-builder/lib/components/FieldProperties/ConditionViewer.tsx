// components/ConfigDisplay.tsx

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code2, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Power, 
  PowerOff, 
  ArrowRight,
  ChevronRight,
  Settings,
  Target,
  Zap
} from 'lucide-react';
import type { CustomRule, CustomRuleEffect } from '../../types/dnd-types';
import type { JsonSchema } from '@jsonforms/core';

interface ConfigDisplayProps {
  rule?: CustomRule;
  onRemoveCondition?: () => void;
  onEditCondition?: () => void;
}

const ConfigDisplay: React.FC<ConfigDisplayProps> = ({ 
  rule,
  onRemoveCondition,
  onEditCondition
}) => {
  if (!rule) return null;

  const getEffectConfig = (effect: CustomRuleEffect) => {
    const configs: Record<CustomRuleEffect, { color: string; icon: React.ReactNode; label: string; description: string }> = {
      'HIDE': { 
        color: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200', 
        icon: <EyeOff className="w-4 h-4" />, 
        label: 'Hide Element',
        description: 'This element will be hidden from view'
      },
      'SHOW': { 
        color: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200', 
        icon: <Eye className="w-4 h-4" />, 
        label: 'Show Element',
        description: 'This element will be visible'
      },
      'ENABLE': { 
        color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200', 
        icon: <Power className="w-4 h-4" />, 
        label: 'Enable Element',
        description: 'This element will be enabled for interaction'
      },
      'DISABLE': { 
        color: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200', 
        icon: <PowerOff className="w-4 h-4" />, 
        label: 'Disable Element',
        description: 'This element will be disabled'
      },
      'JUMP': { 
        color: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200', 
        icon: <ArrowRight className="w-4 h-4" />, 
        label: 'Jump to Section',
        description: 'Navigate to a different section'
      }
    };
    return configs[effect] || configs['SHOW'];
  };

  // Helper function to parse condition and extract readable information
  const parseCondition = (schema: JsonSchema): { text: string; complexity: 'simple' | 'medium' | 'complex' } => {
    if (!schema) return { text: 'No condition', complexity: 'simple' };

    // Handle allOf (all conditions must be true)
    if (schema.allOf && Array.isArray(schema.allOf)) {
      const conditions = schema.allOf.map(condition => parseCondition(condition));
      return {
        text: conditions.map(c => c.text).join(' AND '),
        complexity: conditions.length > 2 ? 'complex' : 'medium'
      };
    }

    // Handle anyOf (any condition must be true)
    if (schema.anyOf && Array.isArray(schema.anyOf)) {
      const conditions = schema.anyOf.map(condition => parseCondition(condition));
      return {
        text: conditions.map(c => c.text).join(' OR '),
        complexity: conditions.length > 2 ? 'complex' : 'medium'
      };
    }

    // Handle oneOf (exactly one condition must be true)
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
      const conditions = schema.oneOf.map(condition => parseCondition(condition));
      return {
        text: conditions.map(c => c.text).join(' XOR '),
        complexity: 'complex'
      };
    }

    // Handle properties
    if (schema.properties) {
      const conditions: string[] = [];
      
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const condition = parseFieldCondition(fieldName, fieldSchema);
        if (condition) conditions.push(condition);
      });

      return {
        text: conditions.join(' AND '),
        complexity: conditions.length > 1 ? 'medium' : 'simple'
      };
    }

    return { text: 'Complex condition', complexity: 'complex' };
  };

  // Helper function to parse individual field conditions
  const parseFieldCondition = (fieldName: string, fieldSchema: any): string => {
    if (!fieldSchema) return '';

    // Handle const (equals)
    if (fieldSchema.const !== undefined) {
      return `${fieldName} equals "${fieldSchema.const}"`;
    }

    // Handle not (not equals)
    if (fieldSchema.not) {
      if (fieldSchema.not.const !== undefined) {
        return `${fieldName} does not equal "${fieldSchema.not.const}"`;
      }
      if (fieldSchema.not.pattern) {
        return `${fieldName} does not match pattern "${fieldSchema.not.pattern}"`;
      }
    }

    // Handle pattern (string matching)
    if (fieldSchema.pattern) {
      const pattern = fieldSchema.pattern;
      if (pattern.startsWith('^') && pattern.endsWith('$')) {
        return `${fieldName} matches exactly "${pattern.slice(1, -1)}"`;
      } else if (pattern.startsWith('^')) {
        return `${fieldName} starts with "${pattern.slice(1)}"`;
      } else if (pattern.endsWith('$')) {
        return `${fieldName} ends with "${pattern.slice(0, -1)}"`;
      } else {
        return `${fieldName} contains "${pattern}"`;
      }
    }

    // Handle enum (one of values)
    if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
      return `${fieldName} is one of [${fieldSchema.enum.join(', ')}]`;
    }

    // Handle range conditions
    if (fieldSchema.minimum !== undefined || fieldSchema.maximum !== undefined) {
      let condition = fieldName;
      
      if (fieldSchema.minimum !== undefined && fieldSchema.maximum !== undefined) {
        const minSymbol = fieldSchema.exclusiveMinimum ? '>' : '≥';
        const maxSymbol = fieldSchema.exclusiveMaximum ? '<' : '≤';
        condition += ` ${minSymbol} ${fieldSchema.minimum} AND ${fieldName} ${maxSymbol} ${fieldSchema.maximum}`;
      } else if (fieldSchema.minimum !== undefined) {
        const symbol = fieldSchema.exclusiveMinimum ? '>' : '≥';
        condition += ` ${symbol} ${fieldSchema.minimum}`;
      } else if (fieldSchema.maximum !== undefined) {
        const symbol = fieldSchema.exclusiveMaximum ? '<' : '≤';
        condition += ` ${symbol} ${fieldSchema.maximum}`;
      }
      
      return condition;
    }

    // Handle type constraints
    if (fieldSchema.type) {
      return `${fieldName} is of type ${fieldSchema.type}`;
    }

    return `${fieldName} has custom condition`;
  };

  // Get jump destination if effect is JUMP
  const getJumpDestination = (schema: JsonSchema): string | null => {
    if (rule.effect === 'JUMP' && schema.jumpTo) {
      return schema.jumpTo;
    }
    return null;
  };

  const effectConfig = getEffectConfig(rule.effect);
  const conditionInfo = rule.condition?.schema ? parseCondition(rule.condition.schema) : null;
  const jumpDestination = rule.condition?.schema ? getJumpDestination(rule.condition.schema) : null;

  return (
    <Card className="w-full max-w-3xl bg-white dark:bg-gray-900 shadow-lg border-0 rounded-xl overflow-hidden">
      {/* Header Section */}
      <CardHeader className={`${effectConfig.color} border-b-0 pb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {effectConfig.icon}
              <span className="font-semibold text-base">{effectConfig.label}</span>
            </div>
            {jumpDestination && (
              <div className="flex items-center gap-1 text-sm opacity-90">
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium">{jumpDestination}</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onEditCondition && (
              <Button 
                variant="ghost" 
                size="sm" 
                type="button"
                onClick={onEditCondition}
                className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Edit condition"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onRemoveCondition && (
              <Button 
                variant="ghost" 
                size="sm" 
                type="button"
                onClick={onRemoveCondition}
                className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                title="Remove condition"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm opacity-80 mt-1">{effectConfig.description}</p>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-6 space-y-6">
        {rule.condition ? (
          <div className="space-y-4">
            {/* Scope Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Scope</span>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs px-3 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full"
              >
                {rule.condition.scope}
              </Badge>
            </div>

            {/* Condition Section */}
            {conditionInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition Rules</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      conditionInfo.complexity === 'simple' 
                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                        : conditionInfo.complexity === 'medium'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                        : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                    }`}
                  >
                    {conditionInfo.complexity}
                  </Badge>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {conditionInfo.text}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Section - Development Only */}
            {process.env.NODE_ENV === 'development' && rule.condition.schema && (
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Code2 className="w-3 h-3" />
                  <span>Raw Schema (Development)</span>
                  <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-2 bg-gray-900 dark:bg-gray-950 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
                  <pre className="text-xs text-green-400 overflow-auto max-h-40 leading-relaxed">
                    {JSON.stringify(rule.condition.schema, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Settings className="w-8 h-8 mx-auto opacity-50" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No condition specified for this rule
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              This rule will always apply
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigDisplay;