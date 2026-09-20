import { Button } from "@chakra-ui/react";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render";
import SimpleCheckbox from "./simple-checkbox";
import SimpleCheckboxCard from "./simple-checkbox-card";
import SimpleRadioGroup from "./simple-radio-group";
import SimpleTabs from "./simple-tabs";

const paletteSolid = (element: Element) =>
  getComputedStyle(element).getPropertyValue(
    "--chakra-colors-color-palette-solid",
  );

describe("shared interactive controls", () => {
  it("uses the Kadha brand as the global interactive palette", () => {
    renderWithProviders(<Button>Continue</Button>);

    const globalStyles = [...document.head.querySelectorAll("style")].map(
      (style) => style.textContent ?? "",
    );
    expect(
      globalStyles.some(
        (text) =>
          text.includes("html{") &&
          text.includes(
            "--chakra-colors-color-palette-solid:var(--chakra-colors-brand-solid)",
          ),
      ),
    ).toBe(true);
  });

  it("uses the Kadha brand for shared tabs and selection controls", () => {
    renderWithProviders(
      <>
        <SimpleTabs tabs={[{ value: "first", label: "First" }]} />
        <SimpleCheckbox label="Remember me" />
        <SimpleCheckboxCard label="Featured" />
        <SimpleRadioGroup
          aria-label="View preference"
          options={[{ label: "Compact", value: "compact" }]}
          value="compact"
        />
      </>,
    );

    expect(paletteSolid(screen.getByRole("tab", { name: "First" }))).toBe(
      "var(--chakra-colors-brand-solid)",
    );
    const rememberCheckbox = screen.getByRole("checkbox", {
      name: "Remember me",
    });
    expect(paletteSolid(rememberCheckbox.parentElement!)).toBe(
      "var(--chakra-colors-brand-solid)",
    );
    const featuredCheckbox = screen.getByRole("checkbox", { name: "Featured" });
    expect(paletteSolid(featuredCheckbox.parentElement!)).toBe(
      "var(--chakra-colors-brand-solid)",
    );
    expect(
      paletteSolid(
        screen
          .getByRole("radio", { name: "Compact" })
          .closest('[data-scope="radio-group"][data-part="root"]')!,
      ),
    ).toBe("var(--chakra-colors-brand-solid)");
  });

  it("preserves explicit palette overrides on shared controls", () => {
    renderWithProviders(
      <>
        <SimpleTabs
          colorPalette="gray"
          tabs={[{ value: "first", label: "First" }]}
        />
        <SimpleCheckbox colorPalette="gray" label="Remember me" />
        <SimpleCheckboxCard colorPalette="gray" label="Featured" />
        <SimpleRadioGroup
          aria-label="View preference"
          colorPalette="gray"
          options={[{ label: "Compact", value: "compact" }]}
          value="compact"
        />
      </>,
    );

    expect(paletteSolid(screen.getByRole("tab", { name: "First" }))).toBe(
      "var(--chakra-colors-gray-solid)",
    );
    expect(
      paletteSolid(
        screen.getByRole("checkbox", { name: "Remember me" }).parentElement!,
      ),
    ).toBe("var(--chakra-colors-gray-solid)");
    expect(
      paletteSolid(
        screen.getByRole("checkbox", { name: "Featured" }).parentElement!,
      ),
    ).toBe("var(--chakra-colors-gray-solid)");
    expect(
      paletteSolid(
        screen
          .getByRole("radio", { name: "Compact" })
          .closest('[data-scope="radio-group"][data-part="root"]')!,
      ),
    ).toBe("var(--chakra-colors-gray-solid)");
  });
});
