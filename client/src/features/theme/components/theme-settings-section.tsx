import ColorModeSection from './color-mode-section';
import ThemePresetSection from './theme-preset-section';

interface ThemeSettingsSectionProps {
  headingAs?: 'h2' | 'h3';
}

const ThemeSettingsSection = ({ headingAs = 'h2' }: ThemeSettingsSectionProps) => (
  <>
    <ColorModeSection headingAs={headingAs} />
    <ThemePresetSection headingAs={headingAs} />
  </>
);

export default ThemeSettingsSection;
