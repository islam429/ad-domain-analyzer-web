FROM mcr.microsoft.com/playwright:v1.56.1-noble

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node","index.js"]
