FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS builder

# libc6-compat might be needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the entire project
COPY . .

# Set CI environment variable to avoid prompts
ENV CI=true

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Build using pnpm
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Select production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache and create directories for static assets
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next
RUN mkdir -p public && chown nextjs:nodejs public
RUN mkdir -p .next/static && chown nextjs:nodejs .next/static

# Copy the standalone Next.js server and other necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the .next/static folder to the appropriate location
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the public folder to the appropriate location
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Ensure config.json is writable (change to 666 for write permissions)
RUN touch ./public/config.json && \
    chown nextjs:nodejs ./public/config.json && \
    chmod 666 ./public/config.json

# Copy the entrypoint script into the image
COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Use the entrypoint script to dynamically set environment variables
ENTRYPOINT ["/entrypoint.sh"]

# Switch to the non-root user for security
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Specify the default command to run
CMD ["node", "server.js"]
