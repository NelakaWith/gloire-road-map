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
