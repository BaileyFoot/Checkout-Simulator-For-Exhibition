var serial;          // variable to hold an instance of the serialport library
var portName = 'COM3'; // fill in your serial port name here
var inData;                            // for incoming serial data
var outByte = 0; 

//these are some bits that the face detection thing needs  :)
let capture;
let capturewidth = 640;    
let captureheight = 480;
let faceapi;
let detections = [];


//this will house all the numbers in the barcode in a list format.
let barcode;
//This will keep track of what number in the barcode the user is trying to type in currently.
let positionInBarcode = 0; 


//this will keep track of the number of seconds that have passed.
let timer = 0;
//this will be a buffer timer for when the mp3 files can play.
let buffer = 0;


//this will keep track of the number of games played so far
//the game will end when this reaches 3!
let gameNumber = 0;
//keep track of how many you got right!
let gameScore = 0;


//make a list to keep track of the 'biggest' emotion in each frame captured.
//each element in this array will correspond to one of the seven emotions that the model tracks.
//in the order that they are listed in the 'emotions' list on line 11.
let mostCommonEmotionList = [0,0,0,0,0,0,0];
let allEmomtionList = [0,0,0,0,0,0,0];

//all of the possible emotions that can be picked.
let emotions = ["neutral","happy", "sad", "angry","fearful", "disgusted","surprised"];

//a list of all the posible messages you can get when you type the barcode correctly.
let wellDone = [
  "YOU'RE SUCH A CLEVER CLEVER GIRL",
  "YOU'RE SO GOOD AT THIS",
  "INCREDIBLE TALENT AND POISE",
  "A PROMOTION IS COMING YOUR WAY",
  "A DAZZLING FUTURE IN CUSTOMER SERVICE AWAITS YOU",
  "ASTOUNDING LEVELS OF ACCURACY"
];

let betweenGameDelay = 500;

function givePraise() {
  let x = int(random(6));
  return wellDone[x];
}

function wait(milisec) {
  x = 2;
  for(i=0; i<(milisec*1000);i++){
    x=x*x;
  }
}

function setup() {
  //make the canvas (defined size on lines 4-5).
  // frameRate(10);
  createCanvas(capturewidth, captureheight);
  
  //start capturing video from the webcam.
  capture = createCapture(VIDEO);
  capture.position(0,0);
  //hide the video from the canvas.
  capture.hide();

  serial = new p5.SerialPort();    // make a new instance of the serialport library
  serial.on('data', serialEvent);  // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  // serial.on('list', printList);       // set a callback function for the serialport list event
  // serial.list();                   // list the serial ports
  
  serial.open(portName);           // open a serial port

  //set the settings for the facial recognition model.
  const faceOptions = {withLandmarks: true, withExpressions: true, withDescriptors: false};
  //connect the model with our settings n shit...
  faceapi = ml5.faceApi(capture, faceOptions, faceReady);

  //this makes the first random barcode of length 10 (numbers) and logs it to the console.  
  barcode = randomBarcode(10);
  
  console.log(barcode);
  serial.write(barcodeForPrint(2) + "\n @");
  
}

//simple function to keep track of time, 
//this should be put in the draw function to log how long users take to complete tasks.
function keepTime() {
  if (frameCount % 60 == 0) { // if the frameCount is divisible by 60, then a second has passed.
    timer ++;
  } 
}

//this function will test if the key the user entered is the correct barcode number...
//tests one key at a time. 
function isKeyCorrect() {
  if(keyCode === ENTER) {
    barcode = randomBarcode(10);
    console.log(barcode);
    serial.write(barcodeForPrint(2) + "\n @");
    return;
  }
  if(key == barcode[positionInBarcode]) {
    console.log("correct!!!");
    positionInBarcode ++;

    if(positionInBarcode == barcode.length) {
      printScore("win");
      betweenGameDelay = 0;
    }}
    else {
      if(betweenGameDelay > 100) {
        betweenGameDelay = 0;
        printScore("loss");
      }
    } 
}


function randomBarcode(length) {
  let x  = [];
  for(i=0; i<length;i++) {
    append(x,int(random(0,9)));
  }
  return x;
}


//this function will cover all of the things that will be output to the printer...
function printScore(winOrLoss) {
    //need to get the top 3 most shown emotions.
  //

  if(winOrLoss == "win") {

    const audio = document.getElementById('audioPlayer');
    audio.src = ("Audio/Barcode scanner beep sound (sound effect).mp3");
    audio.play();

    gameScore++;
    console.log("Nice Work!")
    console.log(givePraise());
    console.log("That took You", str(timer), "Seconds to Complete!");

    serial.write("Nice Work!\n @");
    serial.write(givePraise() + "\n @");
    serial.write("That took You ");

    let timerForOutput = str(timer);
    serial.write(timerForOutput + "@");

    serial.write(" Seconds to Complete!\n @")


    //reset all the timers and counters
    //add one to the game counter
    //make a new barcode

    timer=0;
    positionInBarcode = 0;
    barcode = randomBarcode(10);
    gameNumber++;


    if(gameNumber == 3) {
      console.log("game FINISHED")
      console.log(gameScore);

      // console.log("add all the timers together (get full game length)");

      listEmotionFrequency();

      if(gameScore > 2) {
        serial.write("\n" + "YOU'RE HIRED!@" + "\n" )
        serial.write("---------- \n\n\n\n");
      } else {
        serial.write("\n" + "YOU'RE FIRED!@" + "\n")
        serial.write("---------- \n\n\n\n");
      }


    } else {
      console.log("Time for Another!\n @")
      console.log(barcode);

      serial.write("Time for Another!\n @");
      serial.write(barcodeForPrint(2) + "\n @");
      //MAKE NEW BARCODE
      
    }
  }
  if(winOrLoss == "loss") {
    console.log("Uh Oh!")
    console.log("That took You", timer, " Seconds & You still Failed  :(");

    serial.write("Uh Oh!\n @");
    // serial.write("That took You @");

    let timerForOutput = str(timer);
    // serial.write(timerForOutput + "@")

    serial.write("That took You " + timerForOutput + " seconds \n & you still FAILED :( \n @");

    // serial.write(" Seconds & You still Failed  :(\n @")

    //reset all the timers and counters
    //add one to the game counter
    //make a new barcode

    timer=0;
    positionInBarcode = 0;
    barcode = randomBarcode(10);
    gameNumber++;
    if(gameNumber == 3) {

      listEmotionFrequency();

      if(gameScore == 3) {
        serial.write("\n" + "YOU'RE HIRED!@" + "\n" )
        serial.write("---------- \n\n\n\n");
      } else {
        serial.write("\n" + "YOU'RE FIRED!@" + "\n")
        serial.write("---------- \n\n\n\n");
      }

    } else {
      console.log("I'm sure you will nail it this time!")
      console.log(barcode);
      serial.write("I'm sure you will nail \n it this Time!\n @");
      //serial.write(printer.println());
      serial.write(barcodeForPrint(2) + "\n @");
      //MAKE NEW BARCODE
    }
  }
}

function faceReady(){
  //run the model.
  faceapi.detect(gotFaces);
}

function gotFaces(error, result){
  if (error){
    console.log(error);
    return
  }
    detections = result;
    faceapi.detect(gotFaces);
   // console.log(detections);
}
  
const angAudio = [
  'Audio/keep that hidden.mp3',
  'Audio/be patient.mp3',
  'Audio/bottle that inside.mp3'
];

const conAudio = [
  'Audio/customer is always right.mp3',
  'Audio/you should know all the products.mp3',
  'Audio/can you check in the back.mp3'
];

function playAngRandom() {
  const randomIndex = Math.floor(Math.random() * 3);
  const audio = document.getElementById('audioPlayer');

  try {
    audio.src = angAudio[randomIndex];
    audio.play();
    
  //this should let us catch the errors so they don't print to console but it doesn't rn.
  //needs some way of not playing a sound if another one is already playing...
  }catch (err) {
  }
}

function playConRandom() {
  const randomIndex = Math.floor(Math.random() * 3);
  const audio = document.getElementById('audioPlayer');

  try {
    audio.src = conAudio[randomIndex];
    audio.play();
  }catch (err) {
  }
}


function listEmotionFrequency(){ //need a better name for this wtf.
  //for(i=0;i < emotions.length;i++) {
    let output = (emotions[i] + ": " + mostCommonEmotionList[i])

    console.log(output);  
 
    //WRITE SOMETHING ABOUT THIS BEING A BREAKDOWN OF UR EMOTIONS
    serial.write("---------- @");
    serial.write("EXPRESSED EMOTIONS: \n @");
    serial.write("Neutral:" + mostCommonEmotionList[0] + "@");
    serial.write("Happy:" + mostCommonEmotionList[1] + "@");
    serial.write("Sad:" + mostCommonEmotionList[2] + "@");
    serial.write("Angry:" + mostCommonEmotionList[3] + "@");
    serial.write("Fearful:" + mostCommonEmotionList[4] + "@");
    serial.write("Disgusted:" + mostCommonEmotionList[5] + "@");
    serial.write("Surprised:" + mostCommonEmotionList[6] + "@");
    serial.write("---------- @");


  //}
}


function overallMostCommonEmotion() {
  let mostCommonEmotion = findMostCommonEmotion(mostCommonEmotionList);
  //console.log(emotions[mostCommonEmotion]);
  return emotions[mostCommonEmotion];
}

function findMostCommonEmotion(numbers) {
  if (numbers.length === 0) {
      return -1;
  }

  var max = numbers[0];
  var maxIndex = 0;

  for (var i = 1; i < numbers.length; i++) {
      if (numbers[i] > max) {
          maxIndex = i;
          max = numbers[i];
      }
  }

  return maxIndex;
}


// OLD

// function barcodeForPrint() {
//   //send a special string to the arduino so it knows to output the barcode lines.
//   // serial.write("\n");
  
//   //I wanted to use this * as a code, allowing arduino to print a barcode everytime I pass it this character.
//   //serial.write(42);
//   serial.write("*");

//   let output = "";
//   for(i=0; i < barcode.length;i++) {
//     output = output + " " + str(barcode[i]);
//   }

//   return output;
// }


function barcodeForPrint(gameNum) {
  let output = "";
  for (i = 0; i < barcode.length; i++) {
    output = output + " " + str(barcode[i]);
  }
  //going to need to pass a number that will determine if the arduino looks for the barcode indicator first or later on.
  if(gameNum > 1) {
    output = ("<" + output + " >" + "\n");
  }
  else {
    //change this to : to output after the win or lose messsage.
    output = ("<" + output + " >" + "\n");
  }
  return output;
}


//this is for the lights that indicate how far through the game you are.
function setLights(){
  if(gameNumber == 1) {
    //put only first light on!
  } else if (gameNumber == 2) {
    //put first two lights on
  } else if (gameNumber == 3) {
    //put all lights on!
  }
}

function draw() {
  
  background(200);
  
  capture.loadPixels();
  
  push();
  fill('green');
      if(detections.length>0){
        for (i=0; i<detections.length; i ++){
          var points = detections[i].landmarks.positions;

          for (j=0; j<points.length; j ++){
           circle( points[j]._x,points[j]._y, 5);
            }
          
          var neutralLevel = detections[i].expressions.neutral;
          var happyLevel = detections[i].expressions.happy;
          var sadLevel = detections[i].expressions.sad;
          var angryLevel = detections[i].expressions.angry;
          var fearfulLevel = detections[i].expressions.fearful;
          var disgustedLevel = detections[i].expressions.disgusted;
          var surprisedLevel = detections[i].expressions.surprised;
          
          push();
          // console.log(detections[0].expressions);
          var biggest_emotion = "neutral";

          for (k = 0; k<emotions.length; k++) {
          
            var thisemotion = emotions[k];
            
            var outputEmotion = thisemotion + "  " + str(thisemotionlevel)
            // console.log(outputEmotion)
            

            var thisemotionlevel= detections[i].expressions[thisemotion];
             
            //FOR PANEL SAYING LEVELS
           // text(thisemotion + " value: " + thisemotionlevel,40,30 + 30 * k );
               
            rect(40, 30 + 30 * k, thisemotionlevel * 100,10 );
            
            if(thisemotionlevel > detections[i].expressions[biggest_emotion]){
              biggest_emotion = thisemotion;
            }
          }
          
          //console.log('applicant', i, 'emotes', biggest_emotion);
         
          }    




      //I should put all of these in a loop.
      //for the ammount of elements in the dictionary (or however many emotions there are)

      buffer++;
      if(buffer > 100) {
        if (biggest_emotion==="angry") {
          playAngRandom();
          buffer = 0;
   
          mostCommonEmotionList[3] ++;
         
         } else if (biggest_emotion==="disgusted") {
          playAngRandom();
          buffer = 0;
   
          mostCommonEmotionList[5] ++;
   
         } else if (biggest_emotion==="surprised") {
           playConRandom();
           buffer = 0;
   
           mostCommonEmotionList[6] ++;
   
         } else if (biggest_emotion==="fearful") {
          playConRandom();
          buffer = 0;
   
          mostCommonEmotionList[4] ++;
   
         } else if (biggest_emotion==="sad") {
           playConRandom();
           buffer = 0;
   
           mostCommonEmotionList[2] ++;
          
         } else if (biggest_emotion==="happy") {
           playAngRandom();
          buffer = 0;
   
          mostCommonEmotionList[1]++;
   
         } else if (biggest_emotion==="neutral") {
          playAngRandom();
          buffer = 0;
         mostCommonEmotionList[0]++;
         }
      }
      
      //now I just need to find a way to figure out which item out of this list is the biggest number,
      //this tells me what emotion is most expressed throughout the program running.
      //if mostCommonEmotionList[x] is the biggest then emotions[x] is the most expressed emotion!
      
      //so these two lines will always give you the most expressed emotion! yippie!

      // let mostCommonEmotion = findMostCommonEmotion(mostCommonEmotionList);
      // console.log(emotions[mostCommonEmotion]);

      //this keeps track of the number of secs since game started
      keepTime();
      betweenGameDelay++;
      //console.log(betweenGameDelay);
  }
}

function keyPressed() {
  if(gameNumber < 3) {
    isKeyCorrect();
  }


  //if key == enter then gameNumber = 0
  //this should reset the game and give a new barcode for them to type out...
  if(keyCode === ENTER) {
    gameNumber = 0;
  }

}

function serialEvent() {
  // read a byte from the serial port:
  var inByte = serial.read();
  // store it in a global variable:
  inData = inByte;
}
 
function serialError(err) {
  println('Something went wrong with the serial port. ' + eHrr);
}
