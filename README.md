
<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
A scalable and production-ready <a href="http://nodejs.org" target="_blank">Node.js</a> backend API built with <a href="https://nestjs.com/">NestJS</a> and MongoDB.
</p>

---

## 🏗 Tech Stack

* **Backend Framework:** NestJS 11
* **Database:** MongoDB with Mongoose
* **Authentication:** JWT + Refresh Tokens
* **Authorization:** Role-Based Access Control (RBAC)
* **API Types:** REST & GraphQL (Code First)
* **Caching:** Redis
* **Real-time:** WebSocket Notifications
* **File Handling:** Cloudinary + Multer
* **Payments:** Stripe integration
* **Validation:** class-validator + class-transformer
* **Testing:** Jest + Supertest
* **Containerization:** Docker-ready

---

## ⚡ Features

* Secure user authentication (JWT & refresh tokens)
* Role-based access control (Admin / User)
* Product management CRUD
* Order lifecycle management with pagination, filtering & search
* Stripe payment processing simulation
* Real-time order status notifications via WebSocket
* Global error handling interceptor
* Redis caching for optimized performance
* Unit & E2E testing coverage
* Dockerized deployment ready

---

## 📂 Project Structure

```
src/
├─ modules/
│  ├─ auth/
│  ├─ users/
│  ├─ products/
│  └─ orders/
├─ common/
│  ├─ interceptors/
│  └─ filters/
├─ main.ts
└─ app.module.ts
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```


---

## 📊 Architecture Diagram

```
Client → REST / GraphQL API → Service Layer → Repository → MongoDB
                                  ↓
                                 Redis
                                  ↓
                               Stripe
```

---

## 💡 Key Notes

* Clean, scalable, production-ready architecture
* Designed to handle real-world ecommerce scenarios
* Easily extendable for additional microservices

---

## 🔗 Resources

* [NestJS Documentation](https://docs.nestjs.com)
* [GraphQL Docs](https://graphql.org/learn/)
* [MongoDB Docs](https://www.mongodb.com/docs/)
* [Redis Docs](https://redis.io/docs/)
* [Stripe API Docs](https://stripe.com/docs/api)

---

## ⚖ License

MIT Licensed
