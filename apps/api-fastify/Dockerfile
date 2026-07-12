# Multi-stage build for the Fastify Connect backend.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api-fastify/package.json apps/api-fastify/
COPY packages ./packages
RUN npm ci
COPY . .
RUN npm run build --workspace @repo/api-fastify

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api-fastify/package.json ./apps/api-fastify/
COPY --from=build /app/apps/api-fastify/dist ./apps/api-fastify/dist
COPY --from=build /app/apps/api-fastify/drizzle ./apps/api-fastify/drizzle
WORKDIR /app/apps/api-fastify
EXPOSE 3001
# Apply migrations, then start.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
