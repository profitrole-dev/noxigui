import { RuleRegistry } from './engine.js';
import { FixedPxRule, PercentRule, ContentAutoRule, StretchRule, ClampRule } from './rules/basic.js';

/**
 * Create a RuleRegistry with the default sizing rules.
 */
export function createDefaultRegistry(): RuleRegistry {
  const reg = new RuleRegistry();
  reg.register(FixedPxRule, PercentRule, ContentAutoRule, StretchRule, ClampRule);
  return reg;
}
