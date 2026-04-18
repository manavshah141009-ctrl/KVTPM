FROM node:20-alpine

# Install ffmpeg (required for audio transcoding)
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy only what the worker needs
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY radio-worker/ ./radio-worker/
COPY .env* ./

CMD ["node", "radio-worker/index.mjs"]
