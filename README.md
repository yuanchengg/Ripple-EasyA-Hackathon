# Climate Aid Escrow System

A blockchain-based solution for transparent and accountable distribution of farming subsidies using XRPL's conditional escrow functionality.

## 🌱 Overview

This system enables NGOs and governments to distribute climate resilience farming subsidies through conditional escrows on the XRP Ledger. Funds are automatically released only when verifiable climate-smart farming practices are implemented.

Short description
Offers conditional crypto escrow to help donors and NGOs prevent aid misuse by releasing funds only when farmers prove verified impact.

Full description
Our project is a proof-of-work escrow system that ensures donations or subsidies are only released after real-world work is verified. We built it to solve a widespread problem in aid distribution: fraud, misuse, and lack of transparency. Whether it's charitable donations or farming subsidies, funds often go to waste due to corruption, delayed verification, or a lack of traceable accountability. We focused on a concrete use case: climate-resilient farming aid. NGOs or governments want to support farmers adopting sustainable practices like planting drought-resistant crops or installing water-saving irrigation. But right now, they have no way to guarantee the work was actually done before money is sent. Our solution uses XRPL’s native escrow and conditional execution features to hold funds in smart contracts until off-chain proof of work is submitted, such as satellite data, IoT sensor input, or remote verification. When the required conditions are met, funds are automatically released from escrow to the intended recipient. If they’re not, the funds can be returned or reallocated. By leveraging XRPL’s fast settlement, low fees, and native escrow support, we’re able to build a transparent and efficient system that bridges on-chain trust with off-chain impact. Donors gain confidence that their funds are used meaningfully, and farmers get timely access to aid, with no middlemen, no paperwork delays, and only verified action.

Technical explanation
We built our project using XRPL’s native escrow functionality, specifically leveraging condition-based escrows that allow funds to be locked and released only when a predefined condition is met. This is the core mechanism that enables our proof-of-work escrow system.

We used XRP Ledger’s EscrowCreate and EscrowFinish transactions to set up conditional escrows between donors and recipients. These escrows are created with attached crypto-conditions, which require a matching fulfillment to unlock funds. In our case, the condition represents verified proof that a real-world task, like climate-resilient farming, has been completed.

What makes this possible is XRPL’s support for crypto-conditions using the Condition and Fulfillment fields, which are compact, efficient, and do not require full smart contract execution. This ensures low fees, fast transaction times, and reliable finality, all of which are critical for scalable aid distribution systems.

To handle off-chain verification, we designed the system to accept external attestations, such as satellite imaging data, IoT device input, or human audits. These are hashed into a fulfillment string, which is submitted via an EscrowFinish transaction. Once the fulfillment matches the condition on-chain, the funds are released to the intended recipient.

We also used:
XRPL.js for transaction construction and signing
Node.js backend to process verification data and interact with XRPL

XRPL’s built-in escrow features and crypto-condition support made this project uniquely feasible. Unlike EVM-based chains, we did not need to write or maintain complex smart contracts. Instead, we achieved secure, conditional payouts using native XRPL features, keeping the system lightweight, efficient, and secure.

This setup is ideal for real-world scenarios like conditional aid disbursement, where transparency, speed, and cost-efficiency are all essential.

canva: https://www.canva.com/design/DAGprKjuosk/nlRaFf9Yp5Ih8JELCx9ANw/edit

### Key Features

- 🔒 Conditional escrow smart contracts
- 📡 Satellite imagery verification
- 📊 Real-time monitoring and analytics
- 🌍 Climate-smart practice validation
- 💰 Transparent fund distribution

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- SQLite3
- XRPL Testnet account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/climate-aid-escrow.git
cd climate-aid-escrow
```

2. Install backend dependencies:
```bash
cd back
npm install
```

3. Install frontend dependencies:
```bash
cd ../front
npm install
```

4. Set up environment variables:
```bash
# back/.env
NGO_WALLET_ADDRESS=your_xrpl_address
NGO_WALLET_SECRET=your_xrpl_secret
PORT=3001

# front/.env
REACT_APP_API_URL=http://localhost:3001/api
```

5. Initialize the database:
```bash
cd back
npm run migrate
```

### Running the Application

1. Start the backend server:
```bash
cd back
npm run dev
```

2. Start the frontend development server:
```bash
cd front
npm start
```

## 🔧 Technical Architecture

### Backend
- Express.js REST API
- SQLite database with Knex.js ORM
- XRPL integration for escrow management
- Verification service for practice validation

### Frontend
- React with Material-UI
- Real-time XRPL transaction monitoring
- Interactive dashboards and analytics
- Responsive design for field use

## 📊 Supported Climate-Smart Practices

1. Drought-Resistant Crops
2. Water-Saving Irrigation
3. Soil Conservation
4. Agroforestry
5. Organic Farming

## 🔍 Verification Methods

- Satellite imagery analysis
- IoT sensor data
- Field inspection reports
- Weather data integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- XRPL Foundation
- Climate Action Network
- Sustainable Agriculture Network#   R i p p l e - E a s y A 
 
 