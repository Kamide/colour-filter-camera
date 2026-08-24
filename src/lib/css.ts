export const pointerFine = matchMedia("pointer: fine");

export const supportsCustomizableSelect = CSS.supports(
  "appearance: base-select",
);

export const supportsHas = CSS.supports("selector(:has(*))");

export const supportsOpen = CSS.supports("selector(:open)");
