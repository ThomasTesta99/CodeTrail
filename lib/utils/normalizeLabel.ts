export const normalizeQuestionLabel = (
  label: string | null | undefined
): string | null => {
  const trimmed = label?.trim();

  if (!trimmed || trimmed.toLowerCase() === "unlabeled") {
    return null;
  }

  return trimmed;
};