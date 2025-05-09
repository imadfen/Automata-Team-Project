# Automata-Team-Project

## Overview

An advanced warehouse automation system that manages autonomous devices, inventory tracking, and real-time operations monitoring. The system consists of three main components: a client application, a main server, and a devices server, all working together to provide a comprehensive warehouse management solution.

## 🚀 Features

### Device Management

- Real-time device status monitoring and control
- Live location tracking and navigation
- Battery level monitoring
- Automated task assignment and execution
- RFID tag integration
- Device checkpoint logging

### Warehouse Management

- Interactive warehouse map visualization
- Real-time inventory tracking
- Multi-level shelf organization
- QR code integration

### Real-time Communication

- WebSocket-based real-time updates
- MQTT protocol for device communication
- Bidirectional data flow
- Real-time alerts and notifications

### Security

- JWT-based authentication
- Secure API endpoints

## 🛠 Technology Stack

### Client Application

- React + TypeScript
- Vite for build tooling
- Socket.IO for real-time communications
- Material-UI for interface components

### Main Server

- Node.js + TypeScript
- Express.js framework
- MongoDB for data persistence
- Socket.IO for WebSocket handling
- JWT for authentication

### Devices Server

- Node.js + TypeScript
- MQTT protocol for device communication
- Custom navigation algorithms
- Real-time device coordination

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- MQTT Broker (e.g., Mosquitto)

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/imadfen/Automata-Team-Project
cd Automata-Team-Project
```

2. **Install Dependencies**

Client:

```bash
cd client
npm install
```

Main Server:

```bash
cd server
npm install
```

Devices Server:

```bash
cd devices_server
npm install
```

3. **Environment Configuration**

Create `.env` files in each directory with appropriate configurations.

4. **Start the Applications**

Main Server:

```bash
cd server
npm run dev
```

Devices Server:

```bash
cd devices_server
npm run dev
```

Client:

```bash
cd client
npm run dev
```

## 🌐 API Documentation

The API documentation is available in Postman format. Import the collection from:
`/server/postman/Automata_Team_Project.postman_collection.json`

## 🏗 Project Structure

```
project/
├── client/               # React + TypeScript frontend
├── server/              # Main Expressjs backend server
└── devices_server/      # Device management server
```

## 🔧 Development

### Running Tests

```bash
npm test        # Run unit tests
npm run e2e     # Run end-to-end tests
```

### Code Style

- ESLint configuration is provided
- TypeScript strict mode enabled
- Prettier for code formatting

## 👥 Team

- [imad fenniche + massinissa nail sebiha] - Backend Development
- [imad fenniche + massinissa nail sebiha] - Frontend Development
- [massinissa nail sebiha] - Device Communication
- [ wissam ] - device building
- [ chaima ] - device building
- [ lamin moula ] - device building
