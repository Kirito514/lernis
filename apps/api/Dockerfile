FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared package
RUN pnpm --filter @edunft/shared build

# Generate Prisma client
RUN pnpm --filter @edunft/api prisma:generate

EXPOSE 4000

CMD ["pnpm", "--filter", "@edunft/api", "dev"]
