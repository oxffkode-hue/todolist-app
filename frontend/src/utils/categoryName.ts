import type { TFunction } from 'i18next';

export function getCategoryDisplayName(
  category: { name: string; isDefault: boolean },
  t: TFunction
): string {
  if (!category.isDefault) return category.name;
  return t(`category.defaultNames.${category.name}`, category.name);
}
