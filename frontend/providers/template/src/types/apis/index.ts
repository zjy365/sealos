import * as z from 'zod';
import { createDocument } from 'zod-openapi';

import * as deleteInstanceSchemas from './delete-instance';
import * as listTemplateSchemas from './list-template';
import * as getTemplateSchemas from './get-template';

export * as deleteInstanceSchemas from './delete-instance';
export * as listTemplateSchemas from './list-template';
export * as getTemplateSchemas from './get-template';

export const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Template API',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local development server'
    }
  ],
  components: {
    securitySchemes: {
      KubeconfigAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization'
      }
    }
  },
  paths: {
    '/instance/{instanceName}': {
      delete: {
        summary: 'Delete Instance',
        description: 'Delete an instance and all dependent resources.',
        security: [{ KubeconfigAuth: [] }],
        requestParams: {
          path: deleteInstanceSchemas.pathParams
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: deleteInstanceSchemas.response
              }
            }
          }
        }
      }
    },
    '/template': {
      get: {
        summary: 'List Templates',
        description:
          'Get simplified template list (without resource calculation for better performance).',
        requestParams: {
          query: listTemplateSchemas.queryParams
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: listTemplateSchemas.response
              }
            }
          }
        }
      }
    },
    '/template/{name}': {
      get: {
        summary: 'Get Template Detail',
        description:
          'Get complete template information including dynamically calculated resource requirements.',
        requestParams: {
          path: getTemplateSchemas.pathParams,
          query: getTemplateSchemas.queryParams
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: getTemplateSchemas.response
              }
            }
          }
        }
      }
    }
  }
});
