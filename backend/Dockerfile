# Use the official Node.js image as the base image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy bun lock file
COPY bun.lock ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code with bun
RUN bun run build

# Expose the port the app runs on in the container
EXPOSE 4000

# Define the command to run the app using JSON array syntax
CMD ["bun", "run", "start"]
