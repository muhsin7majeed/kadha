import { Box, HStack, IconButton, Text, chakra } from '@chakra-ui/react';
import { LuStar, LuStarHalf, LuX } from 'react-icons/lu';

interface RatingInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const formatRatingLabel = (value: number) => {
  const stars = value / 2;

  return `${stars % 1 === 0 ? stars.toFixed(0) : stars.toFixed(1)} out of 5 stars`;
};

const RatingInput = ({ value, onChange, disabled }: RatingInputProps) => (
  <HStack gap="3" align="center" flexWrap="wrap">
    <HStack role="radiogroup" aria-label="Your rating" gap="1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fullValue = star * 2;
        const halfValue = fullValue - 1;
        const isFull = Boolean(value && value >= fullValue);
        const isHalf = value === halfValue;
        const StarIcon = isHalf ? LuStarHalf : LuStar;

        return (
          <Box
            key={star}
            position="relative"
            boxSize="9"
            color={isFull || isHalf ? 'yellow.400' : 'fg.muted'}
            flexShrink={0}
          >
            <Box aria-hidden display="flex" alignItems="center" justifyContent="center" boxSize="full" fontSize="2xl">
              <StarIcon fill={isFull || isHalf ? 'currentColor' : 'none'} />
            </Box>

            <chakra.button
              type="button"
              aria-label={formatRatingLabel(halfValue)}
              aria-checked={value === halfValue}
              role="radio"
              disabled={disabled}
              position="absolute"
              insetY={0}
              left={0}
              width="50%"
              cursor={disabled ? 'not-allowed' : 'pointer'}
              bg="transparent"
              border={0}
              _focusVisible={{ outline: '2px solid', outlineColor: 'border.focused', outlineOffset: '2px' }}
              onClick={() => onChange(halfValue)}
            />

            <chakra.button
              type="button"
              aria-label={formatRatingLabel(fullValue)}
              aria-checked={value === fullValue}
              role="radio"
              disabled={disabled}
              position="absolute"
              insetY={0}
              right={0}
              width="50%"
              cursor={disabled ? 'not-allowed' : 'pointer'}
              bg="transparent"
              border={0}
              _focusVisible={{ outline: '2px solid', outlineColor: 'border.focused', outlineOffset: '2px' }}
              onClick={() => onChange(fullValue)}
            />
          </Box>
        );
      })}
    </HStack>

    <Text color="fg.muted" textStyle="sm" minW="20">
      {value ? formatRatingLabel(value).replace(' stars', '') : 'No rating'}
    </Text>

    {value && (
      <IconButton
        aria-label="Clear rating"
        title="Clear rating"
        size="xs"
        variant="ghost"
        colorPalette="gray"
        disabled={disabled}
        onClick={() => onChange(null)}
      >
        <LuX />
      </IconButton>
    )}
  </HStack>
);

export default RatingInput;
