# OpenAPI Client Generation

This directory contains the OpenAPI specification and generated client code for the API.

## Overview

The OpenAPI client is generated using the `openapi-typescript-codegen` package, which creates TypeScript client code from an OpenAPI specification. The generated client uses Axios for making HTTP requests.

## Prerequisites

- Node.js (v14 or higher)
- npm package manager
- Axios package installed in your project (`npm install axios`)

## Code Generation

Instructions:
0. npm install --save-dev @openapitools/openapi-generator-cli
1. Place the [`openapi.yaml`](openapi.yaml) file in the directory where you want to generate the client code
2. Run the following command in the same directory:

```sh
npx openapi-typescript-codegen --input openapi.yaml --output ./api-fonoaudiologia --client axios --useOptions --useUnionTypes --exportCore true --exportServices true --exportModels true --exportSchemas true
```

This command will:
- Generate TypeScript client code
- Create barrel files (index.ts) automatically
- Configure the client to use Axios
- Set up proper TypeScript types and interfaces

## Generated Code Structure

The generated code will be placed in the `./api-fonoaudiologia` directory and includes:
- TypeScript implementation files (.ts)
- API client classes for each endpoint
- Request/response interfaces
- Axios HTTP client implementation

The endpoints are organized into the following services:
- `GamesService`: Endpoints for game-related operations
- `AuthenticationService`: Endpoints for user authentication
- `UserService`: Endpoints for profile management

## Usage Example

After generation, you can import and use the generated client in your TypeScript code.

[example code](ejemploOpenAPi.ts)

## Important Notes

- The OpenAPI specification is defined in `openapi.yaml`
- After making changes to the specification, regenerate the client using the command above
- The generated client is configured to use Axios as the HTTP client
- All API endpoints and types are automatically generated based on the OpenAPI specification
- The client includes TypeScript type definitions for better development experience
- Endpoints are organized into separate services based on their tags in the OpenAPI specification
- Remember to set `OpenAPI.WITH_CREDENTIALS = true` to enable cookie handling in requests