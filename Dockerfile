# 1. Start with a "Base Image" (A clean computer with Node.js 20 installed)
FROM node:20-slim


# Install system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libgconf-2-4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxshmfence1 \
    libglu1 \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Set the working directory (The folder inside the container)
WORKDIR /app

# 3. Copy package files first
# This is a trick: it makes Docker cache your dependencies so it doesn't 
# have to reinstall them every time you change a small line of code.
COPY package*.json ./

# 4. Install only production dependencies
RUN npm install --only=production

# 5. Copy all your project files into the container
COPY . .

# 6. Documentation: Tell Docker your app runs on Port 5000 (from your .env)
EXPOSE 5000

# 7. The command to start your app
CMD ["npm", "start"]