# 1. اختار base image Node.js
FROM node:20-alpine

# 2. اعمل folder داخل container
WORKDIR /app

# 3. انسخ package.json و package-lock.json فقط
COPY package*.json ./

# 4. نزل dependencies
RUN npm install

# 5. انسخ باقي ملفات المشروع
COPY . .

# 6. ابني المشروع (لـ NestJS TypeScript)
RUN npm run build

# 7. افتح البورت
EXPOSE 3000

# 8. شغل المشروع
CMD ["node", "dist/main"]
