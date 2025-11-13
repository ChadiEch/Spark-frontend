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

# Ensure node_modules/.bin is in PATH and build the application
ENV PATH="/app/node_modules/.bin:${PATH}"
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "serve"]