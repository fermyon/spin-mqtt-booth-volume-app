#include "WiFiS3.h"
#include "arduino_secrets.h"
#include "mqtt_secrets.h"
#include <ArduinoMqttClient.h>
#include <ArduinoJson.h>

int sound_sensor = A2; // Sound sensor should be plugged into pin A2

char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;        // your network password (use for WPA, or use as key for WEP)

char mqtt_user[] = MQTT_CLIENT_USERNAME;
char mqtt_pass[] = MQTT_CLIENT_PASSWORD;

const char broker[] = "emqx.demo.fermyon.com"; // IP address of the MQTT broker.
int        port     = 1883;
const char publish_topic[]  = "booth/demo"; // Unique topic for the "booth" this sensor is in
int threshold = 50;
int delay_ms = 100;
int pub_interval_ms = 10000; // Publish the maximum volume heard over 10 seconds

WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

void setup() {
  Serial.begin(9600);
  // Wait for serial to initialize.
  while (!Serial) {
    ;
  }
  connectWiFi();     // Establish Wi-Fi connection
  connectMQTT();     // Connect to MQTT broker
}

void loop() {
  static unsigned long startTime = millis();  // Track the start time of the 10-second interval
  static int maxSoundValue = 0;               // Track the maximum sound value over 10 seconds

  if (!mqttClient.connected()) {
    reconnectMQTT();  // Reconnect if the connection is lost
  }

  int soundValue = 0;
  for (int i = 0; i < 32; i++) {
    // Read the sound sensor
    soundValue += analogRead(sound_sensor);  
  }

  soundValue >>= 5; // Bitshift operation
  Serial.println(soundValue);

  // Track the maximum sound value within the 10-second window
  if (soundValue > maxSoundValue) {
    maxSoundValue = soundValue;
  }

  // Check if 10 seconds have elapsed
  if (millis() - startTime >= pub_interval_ms) {
    // Send the maximum sound value if it exceeds the threshold
    if (maxSoundValue > threshold) {
      sendVolumeData(maxSoundValue);
    }
    // Reset for the next interval
    maxSoundValue = 0;
    startTime = millis();  // Restart the timer
  }

  delay(delay_ms); // Delay between sound readings
}

void connectWiFi() {
  Serial.print("Attempting to connect to WPA SSID: ");
  Serial.println(ssid);
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    // failed, retry
    Serial.print(".");
    delay(1000);
  }

  Serial.println("You're connected to the network");
}

void connectMQTT() {
  Serial.println("Attempting to connect to the MQTT broker.");
  mqttClient.setUsernamePassword(mqtt_user, mqtt_pass);
  while (!mqttClient.connect(broker, port)) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("You're connected to the MQTT broker!");
}

void reconnectMQTT() {
  Serial.println("MQTT connection lost. Reconnecting...");
  while (!mqttClient.connect(broker, port)) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println(" Reconnected!");
}

void sendVolumeData(int soundValue) {
    // Create a JSON object
    StaticJsonDocument<64> doc;
    doc["volume"] = soundValue;

    // Serialize the JSON object to a string
    char jsonBuffer[64];
    serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));

    // Send the serialized JSON string over MQTT
    mqttClient.beginMessage(publish_topic);
    // The print interface can be used to set the message contents
    mqttClient.print(jsonBuffer);
    mqttClient.endMessage();
}