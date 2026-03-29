import { CustomTextVariant } from '@/constants/typography';
import { Text, type TextProps } from 'react-native-paper';


export type ThemedTextProps = TextProps<never> & {
  variant?: CustomTextVariant;
};

export function ThemedText({ style, variant, ...rest }: ThemedTextProps) {

  return (
    <Text
      variant={variant}
      style={[
        style,
      ]}
      {...rest}
    />
  );
}

