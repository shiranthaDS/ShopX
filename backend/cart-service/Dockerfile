FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 4003
CMD ["node", "src/server.js"]
