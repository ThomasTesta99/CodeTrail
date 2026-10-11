export const SOCIAL_PROVIDERS = [
  {id: "google", name: "Google", image: "/assets/icons/google.svg"},
  {id: "github", name: "GitHub", image: "/assets/icons/github.svg"},
] as const;

export type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];

export const isSocialProviderId = (value: unknown): value is SocialProviderId => {
  return typeof value === "string" && SOCIAL_PROVIDERS.some(provider => provider.id === value);
};