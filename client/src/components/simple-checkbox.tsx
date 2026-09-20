import { Box, Checkbox, Text, VisuallyHidden } from "@chakra-ui/react";
import type { ReactNode } from "react";

type SimpleCheckboxProps = Omit<Checkbox.RootProps, "children"> & {
  ariaLabel?: string;
  label: ReactNode;
  description?: ReactNode;
};

const SimpleCheckbox = ({
  ariaLabel,
  label,
  description,
  ...props
}: SimpleCheckboxProps) => (
  <Checkbox.Root
    colorPalette="brand"
    alignItems="flex-start"
    gap="2"
    {...props}
  >
    <Checkbox.HiddenInput />
    <Checkbox.Control mt={description ? "0.5" : undefined} />
    <Box>
      <Checkbox.Label fontWeight="medium">
        {ariaLabel ? (
          <>
            <VisuallyHidden>{ariaLabel}</VisuallyHidden>
            <Box as="span" aria-hidden="true">
              {label}
            </Box>
          </>
        ) : (
          label
        )}
      </Checkbox.Label>
      {description ? (
        <Text color="fg.muted" textStyle="supporting" mt="0.5">
          {description}
        </Text>
      ) : null}
    </Box>
  </Checkbox.Root>
);

export default SimpleCheckbox;
