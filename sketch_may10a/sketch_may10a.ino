
#include "Adafruit_Thermal.h"
#include "adalogo.h"
String incomingByte;     // a variable to read incoming serial data into
String barcode;

#include "SoftwareSerial.h"
#define TX_PIN 6 // Arduino transmit  YELLOW WIRE  labeled RX on printer
#define RX_PIN 5 // Arduino receive   GREEN WIRE   labeled TX on printer


SoftwareSerial mySerial(RX_PIN, TX_PIN); // Declare SoftwareSerial obj first
Adafruit_Thermal printer(&mySerial);     // Pass addr to printer constructor

//make a counter for number of lights currently on.
int lightsOn = 0;
int lightFlashBuffer = 300;

void setup() {
  //output pin for the printer.
  pinMode(7, OUTPUT); digitalWrite(7, LOW);

  // NOTE: SOME PRINTERS NEED 9600 BAUD instead of 19200, check test page.
  mySerial.begin(19200);  // Initialize SoftwareSerial
  //Serial1.begin(19200); // Use this instead if using hardware serial
  printer.begin();        // Init printer (same regardless of serial type)


  //output pins for the lights
  pinMode(11, OUTPUT); //light number 1.
  pinMode(10, OUTPUT); //light number 2.
  pinMode(9, OUTPUT); //light number 3.


}

void loop() {
  delay(100); // Wait for 100 millisecond(s)

  //TELL THE PRINTER HOW WE WANT TO ALIGN THE TEXT. 
  printer.setSize('M'); 
  printer.justify('C');
  printer.setLineHeight(50);


  //IF IT'S RECIEVING FROM P5...
  if (Serial.available() > 0) { 
    //READ UNTIL P5 SENDS AN "@".
    incomingByte = Serial.readStringUntil('@');  


    //TEST IF WE SHOULD PRINT A BARCODE 
    if (incomingByte.indexOf("<") >= 0) {

      //TURN ON LIGHTS TO SHOW WHAT GAME NUMBER WE'RE ON.
      if(lightsOn == 2) {
        digitalWrite(9, HIGH);
        lightsOn = lightsOn + 1;
      }
      if(lightsOn == 1) {
        digitalWrite(10, HIGH);
        lightsOn = lightsOn + 1;
      }
      if(lightsOn == 0) {
        digitalWrite(11, HIGH);
        lightsOn = lightsOn + 1;
      }

      //OUTPUT THE BARCODE LINES.
      printer.printBarcode("----------", CODE93);
    }
    
    //RESET/TURN OFF THE LIGHTS WHEN THE GAME IS FINISHED.
    if (incomingByte.indexOf("-") >= 0) {
      digitalWrite(9, LOW);
      digitalWrite(10, LOW);
      digitalWrite(11, LOW);
      //USE MILLIS TO GET THESE BAY BOYS FLASHING AT THE END OF THE GAME!

      //reset the counter so we know all the lights are now off.
      lightsOn = 0;
    }

    //PRINT THE MESSAGE FROM P5.
    printer.println(incomingByte);
    }
  }
  

