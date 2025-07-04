import type { LauncherOptions } from "./options";
import { getArch, getOS } from "./os-utils";
import type { ManifestRule } from "./types/version";

function matchesRuleConditions(rule: ManifestRule, opts: LauncherOptions) {
  if (rule.features) {
    if (
      rule.features.is_demo_user !== undefined &&
      rule.features.is_demo_user !== opts.isDemoUser
    ) {
      return false;
    }

    if (
      rule.features.has_custom_resolution !== undefined &&
      rule.features.has_custom_resolution !== opts.hasCustomResolution
    ) {
      return false;
    }

    if (
      rule.features.has_quick_plays_support !== undefined &&
      rule.features.has_quick_plays_support !== opts.hasQuickPlaysSupport
    ) {
      return false;
    }

    if (
      rule.features.is_quick_play_multiplayer !== undefined &&
      rule.features.is_quick_play_multiplayer !== opts.isQuickPlayMultiplayer
    ) {
      return false;
    }

    if (
      rule.features.is_quick_play_singleplayer !== undefined &&
      rule.features.is_quick_play_singleplayer !== opts.isQuickPlaySingleplayer
    ) {
      return false;
    }

    if (
      rule.features.is_quick_play_realms !== undefined &&
      rule.features.is_quick_play_realms !== opts.isQuickPlayRealms
    ) {
      return false;
    }
  }

  if (rule.os) {
    if (rule.os.arch !== getArch()) {
      return false;
    }

    if (rule.os.name !== getOS()) {
      return false;
    }
  }

  return true;
}

export function matchesAllRules(rules: ManifestRule | ManifestRule[], opts: LauncherOptions) {
  const ruleList = Array.isArray(rules) ? rules : [rules];

  for (const rule of ruleList) {
    const conditionsMet = matchesRuleConditions(rule, opts);
    if (
      (rule.action === "allow" && !conditionsMet) ||
      (rule.action === "disallow" && conditionsMet)
    ) {
      return false;
    }
  }

  return true;
};
