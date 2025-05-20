FROM node:16-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl bash sudo

# Copy package files
COPY package.json package-lock.json* ./

# Create package.json if it doesn't exist
RUN if [ ! -f package.json ]; then \
    echo '{"name":"developer-setup-tool","version":"1.0.0","description":"Developer environment setup tool","main":"server.js","scripts":{"start":"node server.js"},"dependencies":{"express":"^4.18.2"}}' > package.json; \
    fi

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create temp directory for downloads
RUN mkdir -p temp && chmod 777 temp

# Create installers directories
RUN mkdir -p installers/mac installers/windows && chmod -R 777 installers

EXPOSE 80

# Command to run the server
CMD ["node", "server.js"] 