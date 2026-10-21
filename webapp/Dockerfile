FROM node:24-alpine 
WORKDIR /app
COPY package*.jason ./
RUN npm ci
COPY . .     
EXPOSE 4000
CMD ["npm","run","dev","--","--host"]
