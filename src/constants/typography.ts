export const TextVariants = {
  heading_lg : 'displayLarge',
  heading_md : 'displayMedium',
  heading_sm : 'displaySmall',
  title_lg : 'headlineLarge',
  title_md : 'headlineMedium',
  title_sm : 'headlineSmall',
  subtitle_lg : 'titleLarge',
  subtitle_md : 'titleMedium',
  subtitle_sm : 'titleSmall',
  body_lg : 'bodyLarge',
  body_md : 'bodyMedium',
  body_sm : 'bodySmall',
  label_lg : 'labelLarge',
  label_md : 'labelMedium',
  label_sm : 'labelSmall'
} as const;

export type CustomTextVariant = typeof TextVariants[keyof typeof TextVariants];