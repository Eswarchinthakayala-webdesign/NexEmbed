const SAMPLE_DATA = [
{
  id: 1,
  title: "Study of Proteus and Keil Micro Vision",
  aim: `**Aim:** To study the working procedures of Proteus and Keil Micro Vision software. Keil Micro Vision is a free integrated development environment (IDE) which includes a text editor, compiler, and HEX file generator. μVision4 also supports flexible window management and multiple monitors.`,
  procedure: `**Keil Procedure:**  
1. Open Keil software, click on Project → New Project.  
2. Create a new project file.  
3. Select AT89C51 as the microcontroller.  
4. When prompted, click NO.  
5. Press [Ctrl+N] and type the source code.  
6. Open Project → Build Target.  
7. Add source files, then close.  
8. Build the project.  
9. Start Debug → Run and Stop program.  
10. Open Peripherals → Port 2.  
11. Run program in Debug mode.  
12. Open Project → Options for Target → Output tab.  
13. Generate HEX file.  

**Proteus Procedure:**  
1. Open Proteus (Run as Administrator).  
2. Create a New Project and enter the file name.  
3. Click Next → Next → Finish.  
4. Click the 'P' symbol, search and place required components.  
5. Connect the components as required.  
6. Load the generated HEX file into AT89C51.  
7. Start simulation.`,
result: `**Result:** The working procedures of Proteus and Keil Micro Vision software were successfully studied.`,
image: "output/nooutput.png",
},

  {
  id: 2,
  title: "Flashing LED using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program to flash the LED using AT89C51 microcontroller.`,
  procedure: `**Software Required:**  
- Proteus software  

**Program:**  
\`\`\`asm
ORG 0000H  
UP:     SETB P2.0  
        ACALL DELAY  
        CLR P2.0  
        ACALL DELAY  
        SJMP UP  

DELAY:  MOV R4,#35  
H1:     MOV R3,#255  
H2:     DJNZ R3,H2  
        DJNZ R4,H1  
        RET  
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, flashing the LED.`,
  image: "/output/image1.png",
},
{
  id: 3,
  title: "Generation of Square Wave using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program to generate a square wave using AT89C51 microcontroller.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 0000H  
UP:     SETB P2.0  
        ACALL DELAY  
        CLR P2.0  
        ACALL DELAY  
        SJMP UP  

DELAY:  MOV R4,#35  
H1:     MOV R3,#255  
H2:     DJNZ R3,H2  
        DJNZ R4,H1  
        RET  
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, generating a square wave on P2.0.`,
  image: "output/image2.png",
},
{
  id: 4,
  title: "Smooth Brightness Change of LED using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly/C program for fade-in and fade-out of an LED using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`c
#include <REGX52.h>

void delay(unsigned int y) {
    unsigned int i, j;
    for(i = 0; i < y; i++) {
        for(j = 0; j < 1275; j++) {}
    }
}

int main() {
    while(1) {
        delay(100);
        P1_0 = 0;
        delay(100);
        P1_0 = 1;
    }
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, creating smooth fade-in and fade-out effects on the LED.`,
  image: "output/image3.png",
},
{
  id: 5,
  title: "Stepper Motor using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program to control a stepper motor using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 0000H
UP:     MOV P2,#09H
        ACALL DELAY
        MOV P2,#0CH
        ACALL DELAY
        MOV P2,#06H
        ACALL DELAY
        MOV P2,#03H
        ACALL DELAY
        SJMP UP

DELAY:  MOV R4,#18
H1:     MOV R3,#255
H2:     DJNZ R3,H2
        DJNZ R4,H1
        RET
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, controlling the stepper motor as intended.`,
  image: "output/image4.png",
},
{
  id: 6,
  title: "Interfacing of Relay Using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program for interfacing a relay using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 0000H
UP:     SETB P2.0
        ACALL DELAY
        CLR P2.0
        ACALL DELAY
        SJMP UP

DELAY:  MOV R4,#18
H1:     MOV R3,#255
H2:     DJNZ R3,H2
        DJNZ R4,H1
        RET
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, controlling the relay as intended.`,
  image: "output/image5.png"
},
{
  id: 7,
  title: "LED Toggle Using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program for LED toggle using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 0000H
UP:     MOV P2,#55H
        ACALL DELAY
        MOV P2,#0AAH
        ACALL DELAY
        SJMP UP

DELAY:  MOV R4,#10
H1:     MOV R3,#255
H2:     DJNZ R3,H2
        DJNZ R4,H1
        RET
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, toggling the LEDs as intended.`,
  image: "output/image6.png"
},
{
  id: 8,
  title: "7 Segment Display Using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program for interfacing a 7-segment display using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 000H
UP:     MOV P2,#0C0H
        ACALL DELAY
        MOV P2,#0F9H
        ACALL DELAY
        MOV P2,#0A4H
        ACALL DELAY
        MOV P2,#0B0H
        ACALL DELAY
        MOV P2,#99H
        ACALL DELAY
        MOV P2,#92H
        ACALL DELAY
        MOV P2,#82H
        ACALL DELAY
        MOV P2,#0F8H
        ACALL DELAY
        MOV P2,#80H
        ACALL DELAY
        MOV P2,#90H
        ACALL DELAY

DELAY:  MOV R5,#10
H1:     MOV R4,#180
H2:     MOV R3,#255
H3:     DJNZ R3,H3
        DJNZ R4,H2
        DJNZ R5,H1
        RET
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying numbers on the 7-segment display as intended.`,
  image: "output/image7.png"
}
,
{
  id: 9,
  title: "LED Chaser Using AT89C51 (Proteus)",
  aim: `**Aim:** To write an assembly language program for LED chaser using AT89C51 with Keil and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  

**Program:**  
\`\`\`asm
ORG 0000H
UP:     MOV P2,#01H
        ACALL DELAY
        MOV P2,#02H
        ACALL DELAY
        MOV P2,#04H
        ACALL DELAY
        MOV P2,#08H
        ACALL DELAY
        MOV P2,#10H
        ACALL DELAY
        MOV P2,#20H
        ACALL DELAY
        MOV P2,#40H
        ACALL DELAY
        MOV P2,#80H
        ACALL DELAY
        SJMP UP

DELAY:  MOV R4,#255
H1:     DJNZ R4,H1
        RET
END
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, creating a LED chaser effect.`,
  image: "output/image8.png"
},
{
  id: 10,
  title: "Arduino Based Manual Electronic Counter (Proteus)",
  aim: `**Aim:** To write an Embedded C program for a manual electronic counter using Arduino IDE and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE  

**Program:**  
\`\`\`cpp
int x0,x1,x2,x3,x4,x5,x6,x7,x8,x9; 
int delay_time=200; 

void setup() { 
  // configure pin 12 as an input with internal pull-up
  pinMode(12, INPUT_PULLUP); 

  pinMode(1,OUTPUT); 
  pinMode(2,OUTPUT); 
  pinMode(3,OUTPUT); 
  pinMode(4,OUTPUT); 
  pinMode(5,OUTPUT); 
  pinMode(6,OUTPUT); 
  pinMode(7,OUTPUT); 
} 

void loop() { 
  int sensorVal = digitalRead(12); 
  if (sensorVal == LOW) { 
    x0=true; 
  } 
  while(x0){ 
    zero(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x1=true; 
      x0=false; 
    } 
  } 
  while(x1){ 
    one(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x2=true; 
      x1=false; 
    } 
  } 
  while(x2){ 
    two(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x3=true; 
      x2=false; 
    } 
  } 
  while(x3){ 
    three(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x4=true; 
      x3=false; 
    } 
  } 
  while(x4){ 
    four(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x5=true; 
      x4=false; 
    } 
  } 
  while(x5){ 
    five(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x6=true; 
      x5=false; 
    } 
  } 
  while(x6){ 
    six(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x7=true; 
      x6=false; 
    } 
  } 
  while(x7){ 
    seven(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x8=true; 
      x7=false; 
    } 
  } 
  while(x8){ 
    eight(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x9=true; 
      x8=false; 
    } 
  } 
  while(x9){ 
    nine(); 
    sensorVal = digitalRead(12); 
    if (sensorVal == LOW) { 
      x0=true; 
      x9=false; 
    } 
  } 
} 

void zero() { 
  for(int i=1;i<7;i++) { 
    digitalWrite(i,HIGH); 
    digitalWrite(7,LOW); 
  } 
  delay(delay_time); 
} 

void one() { 
  digitalWrite(1,LOW); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,LOW); 
  digitalWrite(5,LOW); 
  digitalWrite(6,LOW); 
  digitalWrite(7,LOW); 
  delay(delay_time); 
} 

void two() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,LOW); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,HIGH); 
  digitalWrite(6,LOW); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void three() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,LOW); 
  digitalWrite(6,LOW); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void four() { 
  digitalWrite(1,LOW); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,LOW); 
  digitalWrite(5,LOW); 
  digitalWrite(6,HIGH); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void five() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,LOW); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,LOW); 
  digitalWrite(6,HIGH); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void six() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,LOW); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,HIGH); 
  digitalWrite(6,HIGH); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void seven() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,LOW); 
  digitalWrite(5,LOW); 
  digitalWrite(6,LOW); 
  digitalWrite(7,LOW); 
  delay(delay_time); 
} 

void eight() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,HIGH); 
  digitalWrite(6,HIGH); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 

void nine() { 
  digitalWrite(1,HIGH); 
  digitalWrite(2,HIGH); 
  digitalWrite(3,HIGH); 
  digitalWrite(4,HIGH); 
  digitalWrite(5,LOW); 
  digitalWrite(6,HIGH); 
  digitalWrite(7,HIGH); 
  delay(delay_time); 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, functioning as a manual electronic counter.`,
  image: "output/image10.png"
}
,
{
  id: 11,
  title: "Arduino to 16x2 LCD Display (Proteus)",
  aim: `**Aim:** To write an Embedded C program to interface Arduino Uno with a 16x2 LCD display using Arduino IDE and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
#include <LiquidCrystal.h> 

LiquidCrystal lcd(7, 8, 9, 10, 11, 12); 

void setup() { 
  lcd.begin(16, 2); 
  lcd.print("put your message here"); 
} 

void loop() { 
  for (int i = 0; i < 13; i++) { 
    lcd.scrollDisplayLeft(); 
    delay(700); 
  } 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying text on the 16x2 LCD using Arduino Uno in Proteus.`,
  image: "output/image11.png"
}
,
{
  id: 12,
  title: "Serial Communication Using Arduino (Proteus)",
  aim: `**Aim:** To write an Embedded C program for serial communication using Arduino Uno with Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
void setup() {
  Serial.begin(9600); // send and receive at 9600 baud
}

int number = 0;

void loop() {
  Serial.print("Number is ");  
  Serial.println(number); // print the number
  delay(500);             // delay half second between numbers
  number++;               // increment to next number
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, enabling serial communication between Arduino Uno and Proteus.`,
  image: "output/image12.png"
},
{
  id: 13,
  title: "Temperature Sensor in Proteus Using Arduino",
  aim: `**Aim:** To write an Embedded C program for interfacing a temperature sensor using Arduino Uno and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
float temp;

void setup() { 
  pinMode(13, OUTPUT); 
  Serial.begin(9600); 
} 

void loop() { 
  temp = analogRead(A0); 
  temp = (temp * 500) / 1024; 

  Serial.println(temp); 
  if (temp > 30) 
    digitalWrite(13, HIGH); 
  else 
    digitalWrite(13, LOW); 

  delay(1000); 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, reading temperature values and controlling an LED accordingly.`,
  image: "output/image13.png"
},
{
  id: 14,
  title: "Gas Sensor MQ-2 in Proteus Using Arduino",
  aim: `**Aim:** To write an Embedded C program for interfacing Gas Sensor MQ-2 using Arduino Uno and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
#define GreenLed 13 
#define Sensor A0 

void setup() { 
  pinMode(13, OUTPUT); 
  pinMode(12, OUTPUT); 
  pinMode(A0, INPUT); 
  Serial.begin(9600); 
} 

void loop() { 
  int value = analogRead(A0); 
  Serial.print("Analog Value coming from the sensor : ");   
  Serial.println(value); 
  delay(100); 
  
  if (value > 600) { 
    digitalWrite(13, HIGH); 
  } else { 
    digitalWrite(13, LOW); 
  } 
  
  delay(20); 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, detecting gas levels and controlling the LED accordingly.`,
  image: "output/image14.png"
},
{
  id: 15,
  title: "Ultrasonic Sensor in Proteus Using Arduino",
  aim: `**Aim:** To write an Embedded C program for interfacing an Ultrasonic Sensor using Arduino Uno and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
int trig = 10; 
int echo = 9; 
long duration; 
int cm; 

void setup() { 
  pinMode(trig, OUTPUT); 
  pinMode(echo, INPUT); 
  Serial.begin(9600); 
} 

void loop() { 
  digitalWrite(trig, LOW); 
  delayMicroseconds(10); 
  digitalWrite(trig, HIGH); 
  delayMicroseconds(10); 
  digitalWrite(trig, LOW); 
  delayMicroseconds(10); 

  duration = pulseIn(echo, HIGH); 
  cm = (duration / 2) * 0.034; 

  Serial.print("Distance = "); 
  Serial.print(cm); 
  Serial.println(" cm"); 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, measuring distance using the Ultrasonic Sensor in Proteus.`,
  image: "output/image15.png"
},
{
  id: 16,
  title: "PIR Sensor in Proteus Using Arduino",
  aim: `**Aim:** To write an Embedded C program for interfacing a PIR Sensor using Arduino Uno and Proteus.`,
  procedure: `**Software Required:**  
- Proteus 8 software  
- Arduino IDE software  

**Program:**  
\`\`\`cpp
int Status = 13;  // LED pin
int sensor = 12;  // PIR sensor pin

void setup() { 
  Serial.begin(9600); 
  pinMode(sensor, INPUT);   // declare PIR sensor as input 
  pinMode(Status, OUTPUT);  // declare LED as output 
} 

void loop() { 
  long state = digitalRead(sensor); 
  Serial.println(state); 

  if (state == HIGH) { 
    digitalWrite(Status, HIGH); 
    Serial.println("Motion detected!"); 
    delay(1000); 
  } else { 
    digitalWrite(Status, LOW); 
    Serial.println("Motion absent!"); 
    delay(1000); 
  } 
} 
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, detecting motion using the PIR sensor and controlling the LED.`,
  image: "output/image16.png"
},
{
  id: 17,
  title: "Multiply Two 16-bit Binary Numbers (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to multiply two 16-bit binary numbers using Keil software.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 

void main() { 
  while (1) { 
    unsigned int num1, num2; 
    unsigned long int product; 

    num1 = 0x2222; 
    num2 = 0xBBBB; 

    product = (unsigned long int)num1 * num2; 

    P0 = product & 0xFF; 
    P1 = (product & 0xFF00) >> 8; 
    P2 = (product & 0xFF0000) >> 16; 
    P3 = (product & 0xFF000000) >> 24; 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, multiplying two 16-bit numbers and displaying the 32-bit result.`,
  image: "output/nooutput.png",
},
{
  id: 18,
  title: "Sum of First 10 Integer Numbers (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to find the sum of the first 10 integer numbers using Keil software.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 

void main() { 
  unsigned char sum = 0; 
  unsigned char i; 

  for (i = 1; i <= 10; i++) { 
    sum = sum + i; 
  } 

  ACC = sum; 
  P0 = sum; 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed.  
**Output:** 1+2+3+4+5+6+7+8+9+10 = 55 (0x37 in Hexadecimal).`,
  image: "output/nooutput.png",
}
,
{
  id: 19,
  title: "Factorial of a Given Number (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to find factorial of a given number using Keil software.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 
#include <stdio.h> 

void main() { 
  unsigned int i; 
  unsigned char num = 12;     // number for factorial 
  unsigned long factorial = 1; 

  for (i = 1; i <= num; i++) { 
    factorial = factorial * i; 
  } 

  P0 = factorial; 
  P1 = (factorial & 0xFF00) >> 8; 
  P2 = (factorial & 0xFF0000) >> 16; 
  P3 = (factorial & 0xFF000000) >> 24; 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, calculating the factorial of the given number.`,
  image: "output/nooutput.png",
}
,
{
  id: 20,
  title: "Addition of 16-bit Numbers (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to add an array of 16-bit numbers and store the 32-bit result in internal RAM using Keil software.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 

void main() { 
  unsigned int i; 
  unsigned int array[5] = {0x1111, 0x2222, 0x8888, 0x4444, 0xABCD}; 
  unsigned long sum = 0; 

  for (i = 0; i < 5; i++) { 
    sum = sum + array[i]; 
  } 

  P0 = sum & 0xFF; 
  P1 = (sum & 0xFF00) >> 8; 
  P2 = (sum & 0xFF0000) >> 16; 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, storing the 32-bit result in internal RAM.`,
  image: "output/nooutput.png",
}
,
{
  id: 21,
  title: "Display 'Hello World' Message (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to display “HELLO WORLD” message using Keil software.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 
#include <stdio.h> 

void main (void) { 
  SCON = 0x50;   // UART mode 1, 8-bit, enable receiver 
  TMOD = 0x20;   // Timer1, mode 2 auto-reload 
  TH1 = 0xFD;    // Baud rate 9600 
  TR1 = 1;       // Start Timer1 
  TI = 1;        // Transmit ready 

  while (1) { 
    printf("Hello World! \\n"); 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying "Hello World" message via UART.`,
  image: "output/nooutput.png",
}
,
{
  id: 22,
  title: "Hexadecimal to Decimal Conversion (Embedded C, Keil)",
  aim: `**Aim:** To write an Embedded C program to convert the hexadecimal data 0xCFh to decimal and display the digits on ports P0, P1, and P2.`,
  procedure: `**Software Required:**  
- Keil  

**Program:**  
\`\`\`c
#include <reg51.h> 

void main(void) { 
  unsigned char hexa = 0xCF; 
  unsigned char hundreds, tens, units; 

  units = hexa % 10; 
  tens = (hexa / 10) % 10; 
  hundreds = hexa / 100; 

  P0 = units; 
  P1 = tens; 
  P2 = hundreds; 

  while(1); 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, converting 0xCF to decimal and displaying digits on ports P0, P1, and P2.`,
  image: "output/nooutput.png",
}
,
{
  id: 23,
  title: "Study of ARM Processor",
  aim: `**Aim:** To study the architecture and working of an ARM processor (LPC2148).`,
  procedure: `**Apparatus/Component Required:**  
- ARM LPC2148 Development Kit  

**Theory (Summary):**  
ARM is a family of RISC-based processors requiring fewer transistors, thus offering low cost, power efficiency, and high performance. LPC2148 features:  
- Up to 512 KB on-chip Flash, 40 KB SRAM  
- In-System Programming (ISP/IAP)  
- Two 32-bit timers, PWM unit, Watchdog  
- USB 2.0 Full-speed  
- Two UARTs, I2C, SPI, ADC, DAC  
- Vectored Interrupt Controller  
- 3.3V operation, 5V tolerant I/O  

**Basic Requirements for LPC2148:**  
- Power Supply (3.3V, LM117 regulator)  
- Crystal Oscillator  
- Reset Circuit  
- UART, RTC crystal oscillator  

It also supports peripherals like LCD, Stepper Motor Interface, Relay Interface, EEPROM, and GPIO modules.
`,
  result: `**Result:** The ARM processor architecture and working have been successfully studied.`,
  image:"output/nooutput.png",
}
,
{
  id: 24,
  title: "Blinking LEDs Using Software Delay (LPC2148 Kit)",
  aim: `**Aim:** To write and execute a C program to blink LEDs using software delay routine in LPC2148 kit.`,
  procedure: `**Apparatus Required:**  
- Keil uVision5 Software  
- Philips Flash Programmer  
- LPC2148 Kit  

**Program:**  
\`\`\`c
#include "lpc214x.h" 

void delay(unsigned int k);   

void main(void) { 
  IODIR0 = 0xFFFFFFFF;   // Configure Port0 as output 
  PINSEL0 = 0;           // Port0 as GPIO 

  while(1) { 
    IOSET0 = 0x0000FF00;   // Set P0.15-P0.8 
    delay(1000); 
    IOCLR0 = 0x0000FF00;   // Clear P0.15-P0.8 
    delay(1000); 
  } 
} 

void delay(unsigned int k) { 
  unsigned int i, j; 
  for (j = 0; j < k; j++) 
    for (i = 0; i <= 800; i++); 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, blinking LEDs (P0.15–P0.8) in LPC2148 kit.`,
  image:"output/nooutput.png",
}
,
{
  id: 25,
  title: "Read Switch and Display on LEDs (LPC2148 Kit)",
  aim: `**Aim:** To write and execute a C program to read the switch and display the status on LEDs using LPC2148 kit.`,
  procedure: `**Apparatus Required:**  
- Keil uVision5 Software  
- Philips Flash Programmer  
- LPC2148 Kit  

**Program:**  
\`\`\`c
#include "lpc214x.h" 

int main(void) { 
  unsigned int sw_sts; 

  IODIR0 = 0x0000FF00;   // Configure Port0 for LED output 
  PINSEL0 = 0;           // Port0 as GPIO 

  while(1) { 
    sw_sts = IOPIN0; 
    IOSET0 = 0x0000FF00;   // Turn ON LEDs 
    IOCLR0 = sw_sts >> 8;  // Reflect switch status on LEDs 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying switch input on LEDs in LPC2148 kit.`,
  image: "output/nooutput.png",
}
,
{
  id: 26,
  title: "Display a Number in 7-Segment LED (LPC2148 Kit)",
  aim: `**Aim:** To write and execute a C program to display a number in 7-segment LED in LPC2148 kit.`,
  procedure: `**Apparatus Required:**  
- Keil uVision5 Software  
- Philips Flash Programmer  
- LPC2148 Kit  

**Program:**  
\`\`\`c
#include <LPC214X.H> 

#define DS3   1<<13  // P0.13 
#define DS4   1<<12  // P0.12 
#define SEG_CODE 0xFF<<16 // Segment data on P0.16–P0.23 

unsigned char const seg_dat[]={0x3F,0x06,0x5B,0x4F,0x66,0x6D,0x7D,0x07,0x7F,0x67}; 

void delayms(int n) { 
  int i,j; 
  for(i=0;i<n;i++) { 
    for(j=0;j<5035;j++) {;} 
  } 
} 

int main (void) { 
  unsigned char count; 

  PINSEL0 = 0; 
  PINSEL1 = 0; 
  IODIR0 = SEG_CODE | DS3 | DS4; 
  IOSET0 = SEG_CODE | DS3; // Disable DS3 
  IOCLR0 = DS4;            // Enable DS4 

  count = 0; 

  IOCLR0 = SEG_CODE; 
  IOSET0 = seg_dat[count]<<16; 

  while(1) { 
    delayms(1000); 
    count++; 
    if(count > 9) count = 0; 

    IOCLR0 = SEG_CODE; 
    IOSET0 = seg_dat[count]<<16; 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying numbers (0–9) on the 7-segment LED in LPC2148 kit.`,
  image: "output/nooutput.png",
}
,
{
  id: 27,
  title: "Serial Transmission and Reception Using UART (LPC2148 Kit)",
  aim: `**Aim:** To write and execute a C program for serial transmission and reception using on-chip UART in LPC2148 kit.`,
  procedure: `**Apparatus Required:**  
- Keil uVision5 Software  
- Philips Flash Programmer  
- LPC2148 Kit  

**Program:**  
\`\`\`c
#include <lpc214x.h> 

void UART0_Init(void) { 
  PLL0CON = 0; 
  PLL0FEED = 0xAA; 
  PLL0FEED = 0x55; 
  VPBDIV = 1; 
  PINSEL0 |= 0x5;     // Select UART0 RXD/TXD 
  U0FCR = 0;          // Disable FIFO 
  U0LCR = 0x83;       // 8-bit, enable divisor latch 
  U0DLL = 0x27;       // Baud 19200 @ PCLK=12MHz 
  U0DLM = 0; 
  U0LCR = 3;          // Disable divisor latch 
} 

void sout(unsigned char dat1) { 
  while(!(U0LSR & 0x20)); // Wait for Tx buffer empty  
  U0THR = dat1; 
} 

int main(void) { 
  int dat; 
  UART0_Init(); 

  while(1) { 
    if(U0LSR & 1) {           // Check if data received 
      dat = U0RBR;            // Read from UART 
      sout(dat);              // Echo back 
    } 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, enabling serial transmission and reception in LPC2148 kit.`,
  image: "output/nooutput.png",
}
,
{
  id: 28,
  title: "Access Internal ADC and Display Binary Output on LEDs (LPC2148 Kit)",
  aim: `**Aim:** To write and execute a C program for accessing an internal ADC and displaying the binary output on LEDs in LPC2148 kit.`,
  procedure: `**Apparatus Required:**  
- Keil uVision5 Software  
- Philips Flash Programmer  
- LPC2148 Kit  

**Program:**  
\`\`\`c
#include <LPC214X.H> 

#define LEDS  0xFF<<8   // LEDs on P0.8–P0.15 
#define AD0_1 1<<24 
#define CLK_DIV 1<<8 
#define PDN 1<<21 
#define SOC 1<<24 
#define BURST 1<<16 
#define DONE 1<<31 

void delay(unsigned int k) { 
  unsigned int i,j; 
  for (j=0;j<k;j++) 
    for(i=0;i<=800;i++); 
} 

void adc_init() { 
  unsigned long int ADC_CH; 
  ADC_CH = 0 | 1 << 1; // Channel AD0.1              
  AD0CR = SOC | PDN | CLK_DIV | ADC_CH | BURST;  
} 

unsigned int adc_read(unsigned char channel) { 
  unsigned int aval; 
  unsigned long int val; 

  if (channel == 1) val = AD0DR1; 
  else if (channel == 2) val = AD0DR2; 
  else if (channel == 3) val = AD0DR3; 

  val = val >> 6; 
  val = val & 0x3FF;  
  aval = val; 
  return aval; 
}  

int main(void) { 
  unsigned int tp1; 

  IODIR0 = LEDS; 
  PINSEL0 = 0; 
  PINSEL1 = 0 | AD0_1; 

  adc_init(); 

  while(1) {  
    tp1 = adc_read(1);     // Channel AD0.1 
    tp1 = tp1 >> 2;        // Adjust to 8-bit for LEDs 
    IOSET0 = LEDS;         // Turn OFF all LEDs 
    IOCLR0 = tp1 << 8;     // Show ADC value on LEDs 
    delay(1000); 
  } 
}
\`\`\`
`,
  result: `**Result:** The program has been successfully verified and executed, displaying the ADC output on LEDs in LPC2148 kit.`,
  image: "output/nooutput.png",
}
,


];

export default SAMPLE_DATA