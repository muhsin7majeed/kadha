import { Badge, Box, HStack, Icon, Stack, Text, VisuallyHidden } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuCheck, LuCircle } from 'react-icons/lu';

import { estimatePasswordStrength } from '@/features/auth/password-strength';

interface PasswordGuidanceProps {
  id?: string;
  password: string;
  username: string;
}

interface StrengthPresentation {
  colorPalette: 'red' | 'orange' | 'green' | 'purple';
  label: 'Weak' | 'Fair' | 'Strong' | 'Ultra';
}

const getStrengthPresentation = (score: number, passwordLength: number): StrengthPresentation => {
  if (score >= 4 && passwordLength >= 16) {
    return { colorPalette: 'purple', label: 'Ultra' };
  }

  if (score >= 3) {
    return { colorPalette: 'green', label: 'Strong' };
  }

  if (score >= 2) {
    return { colorPalette: 'orange', label: 'Fair' };
  }

  return { colorPalette: 'red', label: 'Weak' };
};

const PasswordGuidance = ({ id = 'registration-password-guidance', password, username }: PasswordGuidanceProps) => {
  const [score, setScore] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);

  const checks = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
      { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  useEffect(() => {
    let isCurrent = true;

    if (!password) {
      setScore(0);
      setIsEstimating(false);
      return () => {
        isCurrent = false;
      };
    }

    setIsEstimating(true);
    const timer = window.setTimeout(() => {
      estimatePasswordStrength(password, username)
        .then((result) => {
          if (isCurrent) {
            setScore(result.score);
          }
        })
        .catch(() => {
          if (isCurrent) {
            setScore(0);
          }
        })
        .finally(() => {
          if (isCurrent) {
            setIsEstimating(false);
          }
        });
    }, 150);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [password, username]);

  const strength = getStrengthPresentation(score, password.length);

  return (
    <Box id={id} borderWidth="1px" borderColor="border" rounded="md" p={3}>
      <HStack justify="space-between" gap={3} mb={2}>
        <Text textStyle="compactLabel">Make your password safer</Text>
        {password ? (
          <Badge colorPalette={strength.colorPalette} variant="subtle" aria-live="polite">
            {isEstimating ? 'Checking…' : strength.label}
          </Badge>
        ) : (
          <Badge colorPalette="gray" variant="subtle">
            Start typing
          </Badge>
        )}
      </HStack>

      <Stack as="ul" gap={1.5} listStyleType="none" m={0} p={0}>
        {checks.map((check) => (
          <HStack as="li" key={check.label} gap={2} color={check.met ? 'green.fg' : 'fg.muted'}>
            <Icon aria-hidden>{check.met ? <LuCheck /> : <LuCircle />}</Icon>
            <Text textStyle="supporting">{check.label}</Text>
            <VisuallyHidden>{check.met ? 'Added' : 'Not added'}</VisuallyHidden>
          </HStack>
        ))}
      </Stack>

      <Text mt={2} textStyle="supporting" color="fg.muted">
        Only 8 characters are required. The other suggestions are optional.
      </Text>
    </Box>
  );
};

export default PasswordGuidance;
