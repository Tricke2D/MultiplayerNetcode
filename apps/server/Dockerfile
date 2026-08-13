FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY . .

WORKDIR /app/apps/server
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/main.js"]
