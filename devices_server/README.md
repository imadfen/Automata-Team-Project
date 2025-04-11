# MQTT device Control Server

A Node.js application that acts as a dedicated MQTT device control server for warehouse stock management systems. It controls and monitors ESP32-powered devices navigating the warehouse via MQTT.

## Features

- MQTT-based communication with devices
- Real-time device status monitoring
- Checkpoint-based navigation
- Automatic timeout handling
- Reconnection and rerouting logic
- HTTP synchronization with main backend
- Comprehensive logging
- Graceful shutdown handling

## Prerequisites

- Node.js (v14 or higher)
- MQTT broker (e.g., Mosquitto)
- Express.js backend server

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables
4. Build the project:
   ```bash
   npm run build
   ```

## Configuration

Create a `.env` file with the following variables:

```
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=device_control_server
HTTP_BACKEND_URL=http://localhost:3000/api
CHECKPOINT_TIMEOUT_MS=30000
PING_CHECK_TIMEOUT_MS=5000
LOG_LEVEL=info
```

## Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## MQTT Topics

### Subscribed Topics

- `device/+/checkpoint_reached`
- `device/+/status`
- `device/+/reconnected`
- `device/+/ack_new_route`
- `device/+/disconnected`

### Published Topics

- `device/{id}/route`
- `device/{id}/ping_check`
- `device/{id}/new_route`

## Architecture

The server consists of three main components:

1. **MQTTHandler**: Manages MQTT connections and message handling
2. **HTTPSyncService**: Handles communication with the main backend
3. **deviceController**: Manages device state and navigation logic

## Error Handling

The server implements comprehensive error handling:

- MQTT connection errors
- Timeout handling for checkpoints
- device disconnection detection
- HTTP backend communication errors

## Logging

Logs are written to both console and files:

- Console: Human-readable format
- Files: JSON format for log aggregation
  - `error.log`: Error-level logs
  - `combined.log`: All logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
