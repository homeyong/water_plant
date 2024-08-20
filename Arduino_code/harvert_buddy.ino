#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>

// Replace with your network credentials
const char* ssid = "";
const char* password = "";

// Motor pins
const int motorPinA = 8;
const int motorPinB = 9;

// Relay pin
const int relayPin = 2;

// Timing variables
unsigned long pumpStartTime = 0;
unsigned long lightStartTime = 0;
unsigned long pumpDuration = 5000; // 1 second
unsigned long lightDuration = 60000;
// unsigned long lightDuration = 1800000; // 30 mins
unsigned long additionalPumpDuration = 0;
unsigned long additionalLightDuration = 0;

bool isPumpRunning = false;
bool isLightOn = false;

// Create an instance of the server
WebServer server(80);

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to Wi-Fi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Print the IP address
  Serial.println(WiFi.localIP());