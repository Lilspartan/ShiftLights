var iracing = require('node-irsdk-2021').getInstance()
const io =  require('socket.io-client');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const splashText = [
    "Connected to iRacing, Sending some cool numbers, just sit back and relax... well I mean, you should drive, but don't worry about this",
    "Woah, I found an iRacing instance running, I wonder if I can send these numbers... I CAN!!!",
    "iRacing: found. Numbers: sent. Quantum Strings: Parsed. Mainframe: Hacked",
    "Hey uhh, you're going pretty fast there, looks kinda unsafe? Are you sure you know what you're doing?",
    "Gabir Motors is not responsible for any injuries incurred during the usage of this product, including but not limited to: coughing, sneezing, uncontrollable laughter, an unending feeling of impending doom, lightheadedness, headaches, cramps in your left ankle, a broken femur, and death",
    "I heard Angus Speed Systems got into some legal trouble last month after the health inspector found where they get their food from (it wasn't pretty)",
    "This program has the Mike Racecar stamp of approval, at least I assume it does, I can't get him to stop racing for long enough to look at it...",
] 

const init = async (options) => {
    console.clear();
    console.log("Status: " + chalk.yellow("WAITING"));
    console.log("Waiting to go racing, when an iRacing instance is detected something cool will happen");
    console.log(`\n\n${chalk.bold("Your Link - add this as a browser source in your streaming tool of choice")}\n\n${chalk.underline("https://streaming.gabirmotors.com/overlay/shiftLights?id=" + options.id)}`)
    setTimeout(function() {
        console.log("\n\n" + chalk.magenta("If this is your first time running this program and it's having trouble connecting, try restarting"))
    }, 2000)

    const Streaming = io("https://streaming.gabirmotors.com")
    var lights = 0;

    var CarShiftInfo = {
        firstRPM: 100000,
        shiftRPM: 100000,
    }

    iracing.on('Connected', function (evt) {
        console.clear();
        console.log("Status: " + chalk.green("CONNECTED"));
        console.log(splashText[Math.floor(Math.random() * splashText.length)]);
        console.log(`\n\n${chalk.bold("Your Link")} - add this as a browser source in your streaming tool of choice\n\n${chalk.underline("https://streaming.gabirmotors.com/overlay/shiftLights?id=" + options.id)}`)
    })

    iracing.on('SessionInfo', function (evt) {
        CarShiftInfo["firstRPM"] = evt.data.DriverInfo.DriverCarSLFirstRPM;
        CarShiftInfo["shiftRPM"] = evt.data.DriverInfo.DriverCarSLShiftRPM;
    })

    iracing.on('Telemetry', function (evt) {
        RPM = Math.floor(evt.values.RPM)
        LightInterval = (CarShiftInfo.shiftRPM - CarShiftInfo.firstRPM) / 10;

        if (RPM > CarShiftInfo.firstRPM) lights = Math.floor(10 - ((CarShiftInfo.shiftRPM - RPM) / LightInterval));
        else lights = 1
    })

    iracing.on('Disconnected', function (evt) {
        console.clear();
        lights = 0;
        console.log("Status: " + chalk.red("DISCONNECTED"));
        console.log("Disconnected, waiting to go racing");
        console.log(`\n\n${chalk.bold("Your Link - add this as a browser source in your streaming tool of choice")}\n\n${chalk.underline("https://streaming.gabirmotors.com/overlay/shiftLights?id=" + options.id)}`)
    })

    setInterval(() => { 
        Streaming.emit("Shift_Lights", JSON.stringify({
            id: options.id,
            lights: lights
        }))
    }, options.updateInterval)
}

try {
    const optionsFile = fs.readFileSync('./options.json', "utf8")
    init(JSON.parse(optionsFile))
} catch (err) {
    console.clear();
    console.log("Status: " + chalk.yellow("SETUP"));
    console.log("Performing first time setup...");
    const options = {
        id: uuidv4(),
        updateInterval: 100
    }

    fs.writeFile('./options.json', JSON.stringify(options, null, 4), (err) => {
        if (err) console.log(err)
        else { 
            setTimeout(() => {
                console.clear()
                console.log("Status: " + chalk.green("SETUP DONE"));
                setTimeout(() => {
                    init(options)
                }, 2000)
            }, 1000)
        }
    })
}