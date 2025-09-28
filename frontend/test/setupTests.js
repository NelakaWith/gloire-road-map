// Suppress noisy jsdom "Not implemented: HTMLCanvasElement.prototype.getContext" messages
// and Chart.js canvas warnings that appear before our polyfills run.
// We filter these specific messages to keep test output clean while still exposing other errors.
const _origConsoleError = console.error.bind(console);
console.error = (...args) => {
  try {
    const msg = args[0] && String(args[0]);
    if (
      msg &&
      (msg.includes(
        "Not implemented: HTMLCanvasElement.prototype.getContext"
      ) ||
        msg.includes(
          "Failed to create chart: can't acquire context from the given item"
        ))
    ) {
      return; // swallow this specific noisy message
    }
  } catch (e) {
    // fall through to default
  }
  _origConsoleError(...args);
};

// Polyfill for HTMLCanvasElement.getContext used by Chart.js in jsdom
if (
  typeof window !== "undefined" &&
  typeof window.HTMLCanvasElement !== "undefined"
) {
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = function () {
      // Minimal stub that returns an object with expected methods used by Chart.js
      return {
        // CanvasRenderingContext2D methods/properties used by Chart.js that may be called during tests
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4) }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        measureText: () => ({ width: 0 }),
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        // gradient & pattern stubs
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
      };
    };
  }
}

// Vitest mocking: mock chart.js to avoid canvas access during unit tests.
// This prevents "Not implemented: HTMLCanvasElement.prototype.getContext" stderr messages
// while keeping component logic testable.
try {
  if (typeof vi !== "undefined" && typeof vi.mock === "function") {
    // Provide a more complete mock of chart.js exports used by the components.
    // Note: the factory passed to vi.mock is hoisted, so avoid referencing
    // top-level variables. Return the mock object inline.
    vi.mock("chart.js", () => ({
      Chart: class {
        constructor() {}
        update() {}
        destroy() {}
        static register() {}
      },
      Title: {},
      Tooltip: {},
      Legend: {},
      LineElement: {},
      PointElement: {},
      LinearScale: {},
      CategoryScale: {},
      TimeScale: {},
      Filler: {},
    }));

    vi.mock("chart.js/auto", () => ({
      Chart: class {
        constructor() {}
        update() {}
        destroy() {}
        static register() {}
      },
      Title: {},
      Tooltip: {},
      Legend: {},
      LineElement: {},
      PointElement: {},
      LinearScale: {},
      CategoryScale: {},
      TimeScale: {},
      Filler: {},
    }));
  }
} catch (e) {
  // ignore if vi isn't available (e.g., linting or other tools reading this file)
}

// Setup PrimeVue globals for tests so components like DatePicker/Dropdown
// can access $primevue and default configuration during render.
try {
  // Import PrimeVue and components dynamically (won't fail when not installed)
  // and set up globalProperties for Vue Test Utils.
  const { config } = require("@vue/test-utils");
  // Create a lightweight $primevue config object expected by PrimeVue components
  const primeConfig = { ripple: false, inputStyle: "outlined" };

  // Provide a global $primevue object
  if (!config.global) config.global = {};
  config.global.config = config.global.config || {};
  config.global.config.globalProperties =
    config.global.config.globalProperties || {};
  config.global.config.globalProperties.$primevue = primeConfig;

  // Register stubbed PrimeVue components used by tests to avoid full render complexity
  // If real PrimeVue is available they will be used; otherwise these stubs keep tests stable.
  const PrimeDatePicker = {
    name: "DatePicker",
    props: ["modelValue", "showIcon"],
    emits: ["update:modelValue"],
    template: `<input type="date" :value="modelValue ? new Date(modelValue).toISOString().slice(0,10) : ''" @input="$emit('update:modelValue', $event.target.value ? new Date($event.target.value) : null)" />`,
  };
  const PrimeDropdown = {
    name: "Dropdown",
    props: ["modelValue", "options"],
    emits: ["update:modelValue"],
    template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"> <option v-for="opt in options" :key="opt.value" :value="opt.value">{{opt.label}}</option></select>`,
  };

  config.global.components = config.global.components || {};
  config.global.components.DatePicker = PrimeDatePicker;
  config.global.components.Dropdown = PrimeDropdown;
  const PrimeCard = {
    name: "Card",
    template: `<div class="pv-card"><slot name="title"></slot><slot name="content"></slot><slot /></div>`,
  };
  const PrimeButton = {
    name: "Button",
    props: ["label", "icon"],
    emits: ["click"],
    template: `<button @click="$emit('click')"><i v-if="icon" :class="icon"></i> {{label}}</button>`,
  };
  config.global.components.Card = PrimeCard;
  config.global.components.Button = PrimeButton;
} catch (e) {
  // ignore - this best-effort setup should not block tests if something can't be required
}
