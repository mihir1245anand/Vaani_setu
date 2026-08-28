# Deployment Guide for Vaani-Setu

## Vercel (Recommended)
1. Push repository to GitHub: git push origin main.
2. Link project in Vercel Dashboard.
3. Zero-configuration automatic deployment from ercel.json.

## Netlify
1. Connect repository in Netlify console.
2. Publish directory: ./ (root).
3. Build command: leave blank.

## Docker
Build and run the containerized application:
`ash
docker build -t vaani-setu .
docker run -p 3000:3000 vaani-setu
`
"@
        Msg = "docs: add deployment instructions for Vercel, Netlify, and Docker"
        Time = "2026-08-28 22:04:30 +0530"
    },
    @{
        File = "Dockerfile"
        Content = @"
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD [""node"", ""server.js""]
