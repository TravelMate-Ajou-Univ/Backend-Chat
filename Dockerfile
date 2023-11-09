FROM node:20-alpine

WORKDIR /app
COPY ./package*.json ./
COPY ./package-lock.json ./
COPY ./tsconfig*.json ./
RUN npm ci 

COPY src ./src
RUN  npm run build

FROM node:20-alpine
WORKDIR /app
COPY ./package*.json ./
COPY ./package-lock.json ./
COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/dist ./dist


ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 8080
ENTRYPOINT ["npm", "run", "start:prod"]
