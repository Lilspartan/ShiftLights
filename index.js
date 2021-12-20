var iracing = require('node-irsdk-2021').getInstance()
const io =  require('socket.io-client');
const chalk = require('chalk');

const Streaming = io("https://streaming.gabirmotors.com")

var CarShiftInfo = {
    firstRPM: 100000,
    shiftRPM: 100000,
}

iracing.on('Connected', function (evt) {
    console.log("Status: " + chalk.green("CONNECTED"));
    console.log("Connected to iRacing, Sending some cool numbers, just sit back and relax... well I mean, you should drive, but don't worry about this");
})

iracing.on('SessionInfo', function (evt) {
    CarShiftInfo["firstRPM"] = evt.data.DriverInfo.DriverCarSLFirstRPM;
    CarShiftInfo["shiftRPM"] = evt.data.DriverInfo.DriverCarSLShiftRPM;
})

var lights = 0;

iracing.on('Telemetry', function (evt) {
    RPM = Math.floor(evt.values.RPM)
    LightInterval = (CarShiftInfo.shiftRPM - CarShiftInfo.firstRPM) / 10;

    if (RPM > CarShiftInfo.firstRPM) lights = Math.floor(10 - ((CarShiftInfo.shiftRPM - RPM) / LightInterval));
    else lights = 1
})

iracing.on('Disconnected', function (evt) {
    console.clear();
    console.log("Status: " + chalk.red("DISCONNECTED"));
    console.log("Disconnected, waiting to go racing");
})

setInterval(() => { 
    Streaming.emit("Shift_Lights", lights)
}, 100)

console.clear();
console.log("Status: " + chalk.yellow("WAITING"));
console.log("Waiting to go racing, when an iRacing instance is detected something cool will happen");