import { IconButton, Input, InputGroup, type InputProps } from '@chakra-ui/react';
import { forwardRef, useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const visibilityLabel = isVisible ? 'Hide password' : 'Show password';

  return (
    <InputGroup
      endElement={
        <IconButton
          type="button"
          aria-label={visibilityLabel}
          aria-pressed={isVisible}
          colorPalette="gray"
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <LuEyeOff /> : <LuEye />}
        </IconButton>
      }
    >
      <Input ref={ref} type={isVisible ? 'text' : 'password'} paddingEnd="12" {...props} />
    </InputGroup>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
