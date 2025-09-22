# EduNFT - Educational Certificate NFT Platform

A secure, verifiable platform where verified universities and training centers can mint educational certificates as NFTs, ensuring authenticity and preventing fraud.

## 🚀 Features

- **Tamper-Proof Security**: Certificates stored on blockchain with cryptographic verification
- **Verified Institutions**: Only verified universities and training centers can mint certificates
- **Instant Verification**: Public verification system for instant certificate validation
- **Gasless Transactions**: Biconomy integration for seamless user experience
- **IPFS Storage**: Decentralized metadata and file storage
- **Role-Based Access**: Different user roles (Student, University, Training Center, Company, Admin)
- **Wallet Management**: Secure wallet creation and export functionality
- **QR Code Generation**: Easy certificate sharing and verification

## 🏗️ Architecture

### Monorepo Structure
```
edunft-mvp/
├── apps/
│   ├── web/            # Next.js frontend
│   └── api/            # Express.js backend
├── contracts/          # Solidity smart contracts
├── packages/
│   └── shared/         # Shared types and utilities
└── docker-compose.yml  # Local development setup
```

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, React Hook Form
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Blockchain**: Solidity, Hardhat, Ethers.js, Polygon Mumbai
- **Storage**: IPFS (Pinata), PostgreSQL
- **Authentication**: JWT, bcrypt
- **Development**: pnpm, ESLint, Prettier, Husky

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and pnpm 8+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd edunft-mvp
   cp env.example .env
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec api pnpm prisma:migrate
   docker-compose exec api pnpm prisma:seed
   ```

4. **Deploy contracts** (optional):
   ```bash
   cd contracts
   pnpm install
   pnpm deploy:mumbai
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - MailHog (Email testing): http://localhost:8025

### Option 2: Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup database**:
   ```bash
   # Start PostgreSQL (or use Docker)
   docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
   
   # Run migrations
   pnpm prisma:migrate
   pnpm prisma:seed
   ```

3. **Setup environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**:
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

#### Database
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edunft
```

#### JWT Secrets
```env
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
```

#### Encryption Key (32 bytes in hex)
```env
ENCRYPTION_KEY_32B=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

#### Blockchain
```env
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x_your_private_key_here
CONTRACT_ADDRESS=0x_deployed_contract_address
```

#### IPFS (Pinata)
```env
PINATA_JWT=your_pinata_jwt_here
```

#### Biconomy (Gasless Transactions)
```env
BICONOMY_API_KEY=your_biconomy_api_key
BICONOMY_API_ID=your_biconomy_api_id
GASLESS_MODE=mock  # Set to 'real' for production
```

## 📱 Usage

### Demo Accounts
After running the seed script, you can use these accounts:

- **Admin**: `admin@edunft.io` / `admin123`
- **University**: `university@edunft.io` / `university123`
- **Student**: `student@edunft.io` / `student123`

### User Flows

#### 1. Student Registration
1. Visit `/auth/register`
2. Select "Student" role
3. Complete registration
4. Wallet is automatically created

#### 2. University Registration & Verification
1. Register with "University" role
2. Create organization profile
3. Admin reviews and approves
4. University can now mint certificates

#### 3. Certificate Minting
1. Verified university logs in
2. Navigate to `/org/mint`
3. Fill certificate details
4. Certificate is minted as NFT

#### 4. Certificate Verification
1. Visit `/verify/{tokenId}`
2. View certificate details
3. Verify authenticity on blockchain

## 🔐 Security Features

- **Encrypted Private Keys**: Wallet private keys are encrypted with AES-GCM
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting protection
- **CORS Protection**: Configured CORS policies
- **Helmet Security**: Security headers middleware

## 🧪 Testing

### Run Tests
```bash
# All tests
pnpm test

# Contract tests
pnpm --filter contracts test

# API tests
pnpm --filter api test

# Frontend tests
pnpm --filter web test
```

### Test Coverage
```bash
# Generate coverage reports
pnpm --filter contracts test:coverage
pnpm --filter api test:coverage
```

## 🚀 Deployment

### Smart Contracts

1. **Deploy to Mumbai**:
   ```bash
   cd contracts
   pnpm deploy:mumbai
   ```

2. **Verify on Polygonscan**:
   ```bash
   pnpm verify:mumbai <contract-address> <constructor-args>
   ```

### Backend API

1. **Build and deploy**:
   ```bash
   pnpm --filter api build
   pnpm --filter api start
   ```

2. **Database migration**:
   ```bash
   pnpm --filter api prisma:deploy
   ```

### Frontend

1. **Build and deploy**:
   ```bash
   pnpm --filter web build
   pnpm --filter web start
   ```

## 📊 API Documentation

### Authentication Endpoints
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "STUDENT"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Certificate Endpoints
```bash
# Mint certificate (verified orgs only)
POST /api/certificates/mint
{
  "studentName": "John Doe",
  "courseName": "Blockchain Development",
  "ownerAddress": "0x...",
  "issueDate": "2024-01-15T00:00:00Z"
}

# Get user certificates
GET /api/certificates/my

# Verify certificate
GET /api/verify/{tokenId}
```

### Admin Endpoints
```bash
# Get verification requests
GET /api/admin/verification-requests

# Approve organization
POST /api/admin/verification-requests/{id}/approve
{
  "notes": "Approved after document review"
}

# Reject organization
POST /api/admin/verification-requests/{id}/reject
{
  "notes": "Insufficient documentation"
}
```

## 🔄 Sample API Calls

### 1. Register → Login → Get Profile
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (use token from login response)
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### 2. Admin Approve Organization → Mint Certificate
```bash
# Approve organization (admin only)
curl -X POST http://localhost:4000/api/admin/verification-requests/{request_id}/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# Mint certificate (verified org only)
curl -X POST http://localhost:4000/api/certificates/mint \
  -H "Authorization: Bearer <org_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "courseName": "Blockchain Development",
    "ownerAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "issueDate": "2024-01-15T00:00:00Z"
  }'
```

### 3. Public Certificate Verification
```bash
# Verify certificate by token ID
curl -X GET http://localhost:4000/api/verify/1

# Verify certificate by contract address and token ID
curl -X GET http://localhost:4000/api/verify/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6/1
```

## 🛡️ Security Considerations

### Production Deployment
- Use managed database services (AWS RDS, Google Cloud SQL)
- Store secrets in secret management services (AWS Secrets Manager, HashiCorp Vault)
- Use production-grade email services (SendGrid, AWS SES)
- Enable HTTPS with proper SSL certificates
- Implement proper logging and monitoring
- Regular security audits and dependency updates

### Key Management
- Rotate JWT secrets regularly
- Use hardware security modules for private keys in production
- Implement key versioning for encryption keys
- Never commit private keys or secrets to version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🗺️ Roadmap

- [ ] Multi-chain support (Ethereum, BSC, etc.)
- [ ] Advanced certificate templates
- [ ] Batch certificate minting
- [ ] Mobile application
- [ ] Integration with learning management systems
- [ ] Advanced analytics and reporting
- [ ] Certificate revocation system
- [ ] Multi-language support

---

**Built with ❤️ for the future of education**
#   e d u n f t  
 