FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY src ./src
# Ensure uploads directory exists even if empty in build context
RUN mkdir -p /app/uploads
EXPOSE 4002
CMD ["node", "src/server.js"]
