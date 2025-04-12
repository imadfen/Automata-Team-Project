#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Mi_9T";
const char* password = "massinissa";

// MQTT Broker settings
const char* mqtt_server = "192.168.152.40";
const int mqtt_port = 1883;
const char* device_id = "67f73e61e7c8f941a74b8db4";  // Unique robot ID

// Topic patterns matching server
char topic_battery[50];
char topic_status[50];
char topic_navigation[50];

// Simulated values
float battery_level = 100.0;
const char* device_status = "idle"; // idle, busy, offline, error

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
const long interval = 5000;

void setup_topics() {
  // Match server topic patterns
  snprintf(topic_battery, 50, "device/%s/battery", device_id);
  snprintf(topic_status, 50, "device/%s/status", device_id);
  snprintf(topic_navigation, 50, "device/%s/navigation/instructions", device_id);
}

void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Create a buffer for the payload
  char message[256];
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.printf("Message arrived [%s]: %s\n", topic, message);

  // Handle navigation instructions
  if (strcmp(topic, topic_navigation) == 0) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      // Process navigation instructions
      JsonObject instructions = doc["instructions"];
      // Here you would implement the actual navigation logic
      device_status = "busy";  // Update status when moving
      publishStatus();
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(device_id)) {
      Serial.println("connected");
      
      // Subscribe to navigation instructions
      client.subscribe(topic_navigation);
      
      // Publish initial status
      publishStatus();
    } else {
      Serial.printf("failed, rc=%d try again in 5 seconds\n", client.state());
      delay(5000);
    }
  }
}

void publishStatus() {
  client.publish(topic_status, device_status);
  Serial.printf("Published status: %s\n", device_status);
}

void publishBattery() {
  // Simulate battery drain
  battery_level -= 0.1;
  if (battery_level < 10.0) {
    battery_level = 100.0;
  }

  char battery_str[10];
  dtostrf(battery_level, 4, 1, battery_str);
  client.publish(topic_battery, battery_str);
  
  Serial.printf("Published battery level: %s%%\n", battery_str);
}

void setup() {
  Serial.begin(115200);
  setup_topics();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    publishBattery();
    publishStatus();
  }
}