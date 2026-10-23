FROM node:24-alpine AS Build 
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS Production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./   
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=Build /app/server ./server
EXPOSE 4000 
CMD ["npm", "start"]
