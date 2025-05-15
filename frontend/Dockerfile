FROM node:18

# Set the working directory in the container
WORKDIR /app

COPY bun.lock package.json ./

RUN npm install -g bun

# Install your application's dependencies
RUN npx bun install

COPY . .

RUN npx bun run build

EXPOSE 3000

CMD [ "npx", "bun", "run", "preview" ]