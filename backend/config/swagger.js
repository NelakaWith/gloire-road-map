/**
 * @fileoverview Swagger/OpenAPI configuration
 * @description Configuration for automatic API documentation generation using external spec file
 * @author @NelakaWith
 * @version 1.0.0
 */
import YAML from "yamljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load OpenAPI specification from YAML file
 * @type {Object}
 */
export const specs = YAML.load(join(__dirname, "api-spec.yaml"));

/**
 * Swagger UI options
 * @type {Object}
 */
export const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Gloire Road Map API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};
