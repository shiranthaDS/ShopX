# ShopX 🛍️

[![Azure Container Apps](https://img.shields.io/badge/Azure-Container%20Apps-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/services/container-apps/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://vercel.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)](https://nodejs.org/)

> **Modern full-stack e-commerce platform** built with microservices architecture, featuring seamless shopping experience from browsing to checkout with PayPal integration.

**URL:** [https://shop-x-henna.vercel.app](https://shop-x-henna.vercel.app)

---
## 🌟 Key Features

### Technical Highlights
- ⚡  **Microservices Architecture** - Independent, scalable services
- 🌐 **Cloud-Native Deployment** - Azure Container Apps + Vercel
- 🐳 **Containerized Services** - Docker containers for all microservices
- 🔄 **Auto-Scaling** - Azure Container Apps auto-scaling capabilities
- 🔒 **JWT Authentication** - Secure token-based auth with httpOnly cookies
- 💳 **PayPal Integration** - Secure payments with PayPal sandbox/live mode
- 🔄 **CI/CD:** GitHub Actions CI/CD pipelines via Azure Container Apps & Vercel 

---
## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vercel)                        │
│              React + Vite + Tailwind CSS                     │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │   Azure Container Apps │
         │   Environment          │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌─────▼─────┐   ┌─────▼──────┐
│ Auth   │    │  Product  │   │   Cart     │
│Service │    │  Service  │   │  Service   │
│:4001   │    │   :4002   │   │   :4003    │
└───┬────┘    └─────┬─────┘   └─────┬──────┘
    │               │               │
┌───▼────┐    ┌─────▼─────┐   ┌─────▼──────┐
│Payment │    │  Order    │   │ Inventory  │
│Service │    │  Service  │   │  Service   │
│:4004   │    │   :4005   │   │   :4006    │
└───┬────┘    └─────┬─────┘   └─────┬──────┘
    │               │               │
    └───────────────┴───────────────┘
                    │
            ┌───────▼────────┐
            │  MongoDB Atlas │
            │   (Cloud DB)   │
            └────────────────┘
```

---

### Service Responsibilities

| Service | Port | Description | Database |
|---------|------|-------------|----------|
| **Auth Service** | 4001 | User authentication, JWT token management | `auth` |
| **Product Service** | 4002 | Product catalog, categories, image uploads | `product` |
| **Cart Service** | 4003 | Shopping cart operations, checkout summary | `cart` |
| **Payment Service** | 4004 | PayPal integration, order capture | N/A |
| **Order Service** | 4005 | Order history and management | `orders` |
| **Inventory Service** | 4006 | Stock levels, inventory tracking | `inventory` |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Custom Components
- **Routing:** React Router v6
- **Build Tool:** Vite 

### Backend
- **Runtime:** Node.js 20 (Alpine Linux)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT (jsonwebtoken)
- **Payment:** PayPal REST SDK (@paypal/checkout-server-sdk)

### DevOps & Cloud
- **Containerization:** Docker + Docker Compose
- **Container Registry:** Azure Container Registry (ACR)
- **Backend Hosting:** Azure Container Apps
- **Frontend Hosting:** Vercel
- **CI/CD:** GitHub Actions automate CI/CD workflows directly 
- **Database:** MongoDB Atlas (Managed)
- **DNS:** Azure Container Apps default domains + Vercel domains


---

## 🚀 Deployment Architecture

### Azure Container Apps (Backend)
```
shopx-rg (Resource Group)
├── shopx-eu (Container Apps Environment)
├── shopx.azurecr.io (Container Registry)
└── Container Apps:
    ├── auth-service
    ├── product-service (min replicas: 1)
    ├── cart-service
    ├── payment-service (min replicas: 1)
    ├── order-service (min replicas: 1)
    └── inventory-service (min replicas: 1)
```

**Features:**
- External ingress enabled on all services
- CORS configured for Vercel origin
- Environment variables for service URLs
- Auto-scaling (0-10 replicas, critical services min 1)
- Health endpoints for monitoring


---

## 📋 Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker Desktop** (for local development)
- **MongoDB Atlas** account (free tier works)
- **Azure Account** (for deployment)
- **Vercel Account** (for frontend deployment)
- **PayPal Developer** account (for payment integration)


---

## 🐳 Docker Deployment

### Build and Push to Azure Container Registry

```bash
# Login to ACR
az acr login --name shopx

# Build and push each service
cd backend/auth-service
docker buildx build --platform linux/amd64 -t shopx.azurecr.io/auth-service:latest --push .

cd ../product-service
docker buildx build --platform linux/amd64 -t shopx.azurecr.io/product-service:latest --push .

# Repeat for all services
```

### Deploy to Azure Container Apps

```bash
# Create resource group
az group create --name shopx-u --location uaenorth

# Create Container Apps environment
az containerapp env create --name shopx-eu --resource-group shopx-u --location uaenorth

# Deploy auth service
az containerapp create \
  --name auth-service \
  --resource-group shopx-u \
  --environment shopx-eu \
  --image shopx.azurecr.io/auth-service:latest \
  --target-port 4001 \
  --ingress external \
  --registry-server shopx.azurecr.io \
  --env-vars MONGODB_URI=... JWT_SECRET=... \
  --min-replicas 0 \
  --max-replicas 10

# Repeat for all services
```

### Frontend Deployment (Vercel)

```bash
cd frontend
npx vercel deploy --prod

# Alias to custom domain
npx vercel alias <deployment-url> shop-x-henna.vercel.app
```

---

## 📈 Performance Optimizations

- Vite for fast frontend builds
- Lazy loading for routes
- Image optimization in product service
- MongoDB indexing for fast queries
- Azure Container Apps auto-scaling
- Vercel global CDN
- Efficient state management with Context API

---

## 👨‍💻 Author

**Shirantha Dissanayake**
- GitHub: [@shiranthaDS](https://github.com/shiranthaDS)
- Email: shiranthadw@gmail.com
---

**⭐ If you find this project useful, please consider giving it a star!**
