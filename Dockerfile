# Use Node.js 18 as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npx vite build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npx", "vite", "preview", "--port", "8080"]