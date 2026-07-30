import { useState } from 'react';
import { Box, Button, Card, chakra, HStack, Stack, Text } from '@chakra-ui/react';
import { LuClipboard, LuDownload, LuPrinter, LuShieldCheck } from 'react-icons/lu';

import { toaster } from '@/components/ui/toaster-store';
import { buildRecoveryKit, getRecoveryKitFilename } from '@/features/auth/recovery-kit';

interface RecoveryCodeDisplayProps {
  continueLabel: string;
  generatedAt?: Date;
  heading?: string;
  onContinue: () => void;
  recoveryCode: string;
  username: string;
}

const downloadRecoveryKit = (contents: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const printRecoveryKit = (contents: string) => {
  const printWindow = window.open('', '_blank', 'width=720,height=900');

  if (!printWindow) {
    toaster.error({ title: 'Allow pop-ups to print the recovery kit' });
    return;
  }

  printWindow.opener = null;
  printWindow.document.title = 'Kadha account recovery kit';

  const pre = printWindow.document.createElement('pre');
  pre.textContent = contents;
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  pre.style.fontSize = '14px';
  pre.style.lineHeight = '1.5';
  pre.style.padding = '32px';

  printWindow.document.body.appendChild(pre);
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const RecoveryCodeDisplay = ({
  continueLabel,
  generatedAt,
  heading = 'Save your account recovery code',
  onContinue,
  recoveryCode,
  username,
}: RecoveryCodeDisplayProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [effectiveGeneratedAt] = useState(() => generatedAt ?? new Date());
  const recoveryKit = buildRecoveryKit({
    generatedAt: effectiveGeneratedAt,
    recoveryCode,
    username,
  });

  const copyRecoveryCode = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      toaster.success({ title: 'Recovery code copied' });
    } catch {
      toaster.error({ title: 'Could not copy the recovery code' });
    }
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap={2}>
          <LuShieldCheck aria-hidden />
          <Text as="h2" textStyle="sectionTitle">
            {heading}
          </Text>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          This code is the only way to reset your password. Kadha cannot recover your account if you lose both your
          password and this code.
        </Text>
      </Card.Header>

      <Card.Body>
        <Stack gap={5}>
          <Box
            as="code"
            aria-label="Account recovery code"
            bg="bg.subtle"
            borderColor="border"
            borderWidth="1px"
            borderRadius="md"
            color="fg.default"
            fontFamily="mono"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="semibold"
            letterSpacing="wide"
            overflowWrap="anywhere"
            p={{ base: 3, md: 4 }}
            textAlign="center"
          >
            {recoveryCode}
          </Box>

          <HStack gap={2} flexWrap="wrap">
            <Button type="button" variant="outline" colorPalette="gray" onClick={copyRecoveryCode}>
              <LuClipboard />
              Copy code
            </Button>
            <Button
              type="button"
              variant="outline"
              colorPalette="gray"
              onClick={() => downloadRecoveryKit(recoveryKit, getRecoveryKitFilename(username))}
            >
              <LuDownload />
              Download recovery kit
            </Button>
            <Button type="button" variant="outline" colorPalette="gray" onClick={() => printRecoveryKit(recoveryKit)}>
              <LuPrinter />
              Print
            </Button>
          </HStack>

          <HStack
            as="label"
            align="start"
            bg={acknowledged ? 'bg.subtle' : undefined}
            borderColor={acknowledged ? 'border.emphasized' : 'border'}
            borderWidth="1px"
            borderRadius="md"
            cursor="pointer"
            gap={3}
            p={3}
          >
            <chakra.input
              type="checkbox"
              checked={acknowledged}
              width="4"
              height="4"
              mt="0.5"
              accentColor="brand.solid"
              onChange={(event) => setAcknowledged(event.currentTarget.checked)}
            />
            <Stack gap={1}>
              <Text fontWeight="semibold" textStyle="compactLabel">
                I saved my recovery code
              </Text>
              <Text color="fg.muted" textStyle="supporting">
                I understand that Kadha support cannot recover this account without it.
              </Text>
            </Stack>
          </HStack>

          <Button
            type="button"
            colorPalette="brand"
            disabled={!acknowledged}
            alignSelf={{ base: 'stretch', md: 'flex-end' }}
            onClick={onContinue}
          >
            {continueLabel}
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default RecoveryCodeDisplay;
