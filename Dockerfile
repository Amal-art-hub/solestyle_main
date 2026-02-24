# 1. Start with a "Base Image" (A clean computer with Node.js 20 installed)
FROM node:20-slim

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