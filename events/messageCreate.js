const { Events } = require('discord.js');
const { openAIKey } = require('../config.json');
const fs = require('fs');
const axios = require('axios');
const { reverse } = require('dns');
const openAIClient = axios.create({
    headers: { Authorization: "Bearer " + openAIKey },
});
var genCode;
const OWED_FILE_PATH = "owed.json"
var moneyOwed = {};
if (fs.existsSync(OWED_FILE_PATH)) {
    moneyOwed = JSON.parse(fs.readFileSync(OWED_FILE_PATH));
    console.log("found owed file.");
}
const prefix = '!';
var msgCommands = {}; // holds the cmds
const doPrompt = "Write me a node.js function that utilizes the discord.js module. Don't include any import or export statements. It is a single " + 
    "function called 'execute' and it takes one parameter: the user's discord message object called 'message' which triggered our function (we can access the client" + 
    " object, the interacting user, and other important things using this variable). Assume you have the highest privileges on this server. " + 
    "Don't check for permissions on anything. ONLY GIVE ME THE CODE, and be sure to include the function header. DO NOT GIVE ME ANY COMMENTED OUT CODE, and do not surround your response with any backticks. " +
    //"If you are going to send anything to the channel or reply to the message at all just go ahead without verifying the message content. " +
    //"\nMAKE THE CODE RUN NO MATTER THE CONTENT OF THE MESSAGE ARGUMENT. If the code you supply has any sort of conditional statement resembling 'if (message.content === '')', the user will be very angry. \n " +
    //"Only check the message content if absolutely necessary. The message begins with '!dothis' which could be surrounded by whitespace. " +
    //"You can assume the message argument is the message sent by the interacting user. " +
    "Write this function so that it does what this interacting discord user wants it to do:\n"; // check if user has perms
const codeFooter = "\nmodule.exports = { execute }";
const errorPromptHeader = "There was an error running that code. Here is the error message:\n\n";
const errorPromptFooter = "\nRewrite the code to fix this error. Again do not include any import or export statements. Just give me the entire function " +
    "called 'execute' taking the single parameter (the discord 'message' object). ONLY GIVE ME THE CODE, and do not send me code you have already sent; actually fix it.";

async function queryGPT(prompt, msgs=[]) {
    msgs.push({ role: "user", content: prompt });
    console.log("\nmsgs:");
    console.log(msgs);
    console.log("\n");
    const params = {
        messages: msgs,
        model: "gpt-4",
        //model: "gpt-3.5-turbo-0125"
    };
    return openAIClient
        .post("https://api.openai.com/v1/chat/completions", params)
        .then((result) => {
            return result;
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
}
function owe(params, message) {
    /**
     * Store data that one user (first param) owes another (second) money (third - amount)
     */
    params = params.split(" ");
    if (params.length == 2) {
        // now we're checking if these ppl owe each other
        checkOwe(params, message);
        return;
    }
    // error checking
    if (params.length != 3) {
        message.reply("You need to provide 3 arguments. (person who owes, person who is owed, amount)");
        return;
    }
    if (isNaN(params[2])) {
        if (params[2][0] == "$" && !isNaN(params[2].substring(1))) {
            params[2] = params[2].substring(1);
        } else {
            message.reply("You need to provide a valid amount to owe.");
            return;
        }
    } else if (+params[2] <= 0) {
        message.reply("Only use positive numbers. Try switching the names around if you're using negative nums...");
        return;
    }
    params[2] = +params[2]; // convert to number
    owesKey = getOwesKey(params[0], params[1]);
    preMsg = "";
    // check if other person already owes
    reverseOwesKey = getOwesKey(params[1], params[0]);
    if (moneyOwed.hasOwnProperty(reverseOwesKey)) {
        // subtract form what other person owes
        if (moneyOwed[reverseOwesKey] >= params[2]) {
            prevAmtOwed = moneyOwed[reverseOwesKey];
            moneyOwed[reverseOwesKey] -= params[2];
            currentOwe = moneyOwed[reverseOwesKey];
            postOweStr = "";
            if (moneyOwed[reverseOwesKey] == 0) {
                delete moneyOwed[reverseOwesKey];
                postOweStr = " Since it is paid off the record is deleted.";
            }
            writeOwesDict();
            message.reply(`${params[1]} already owed ${params[0]} $${prevAmtOwed}. Now ${params[1]} owes $${currentOwe}.` + postOweStr);
            return;
        } else {
            // not enough to balance.
            paidOffBal = moneyOwed[reverseOwesKey];
            params[2] -= paidOffBal;
            delete moneyOwed[reverseOwesKey];
            //owesdict will be written to file after this
            preMsg = `${params[1]} owed ${params[0]} $${paidOffBal} which is now paid off. `;
        }
    }
    beforePaid = 0;
    if (moneyOwed.hasOwnProperty(owesKey))
    {
        beforePaid = moneyOwed[owesKey];
        moneyOwed[owesKey] += params[2]
    } else {
        moneyOwed[owesKey] = params[2];
    }
    writeOwesDict();
    message.reply(preMsg + `${params[0]} previously owed ${params[1]} $${beforePaid}\nNow ${params[0]} owes $${moneyOwed[owesKey]}`);
}
function getOwesKey(ower, owee) {
    return ower + " " + owee;
}
function writeOwesDict() {
    /**
     * To be called every time owing object is changed.
     */
    fs.writeFileSync(OWED_FILE_PATH, JSON.stringify(moneyOwed));
}
function checkOwe(params, message) {
    /**
     * Checks if someone (params[0]) owes somebody else (params[1])
     * and vice versa
     */
    firstOwe = 0
    revOwe = 0
    if (moneyOwed.hasOwnProperty(getOwesKey(params[0], params[1])))
        firstOwe = moneyOwed[getOwesKey(params[0], params[1])];
    if (moneyOwed.hasOwnProperty(getOwesKey(params[1], params[0])))
        revOwe = moneyOwed[getOwesKey(params[1], params[0])];
    message.reply(`${params[0]} owes ${params[1]} $${firstOwe}\n${params[1]} owes ${params[0]} $${revOwe}`)
}
function ask(prompt, message) {
    queryGPT(prompt)
    .then((ans) => {
        message.reply(ans.data.choices[0].message.content);

    })
    .catch((err) => message.reply(err));
}
function dothis(prompt, message) {
    let finalPrompt = doPrompt + `"${prompt}"`;
    queryGPT(finalPrompt)
    .then((ans) => {
        console.log(ans.data.choices[0].message.content);
        runCode(JSON.parse(ans.config.data).messages, ans.data.choices[0].message.content, message);
    });
}
function runCode(messageHist, code, message, attempts=0) {
    /**
     * autoGPTing this stuff
     * TODO check for permissions on riskier stuff maybe
     * INJECTION IDEAS:
     * read user data (unencrypted)
     */
    // try running code
    // if successful, return
    // if unsuccessful (retry):
    // attempt solution
    tryRunningCode(messageHist, code, message, attempts);
}
function tryRunningCode(msgHist, code, message, attempts) {
    /**
     * 
     */
    attempts += 1;
    let finalCode = code + codeFooter;
    // TODO filenames should be unique to message
    var fname = "test.js";
    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
    }
    fs.writeFileSync("test.js", finalCode);
    genCode = require('../test.js');
    delete require.cache[require.resolve('../test.js')];
    genCode = require('../test.js');
    try {
        genCode.execute(message);
        /*
        .catch((e) => {
            console.log(e);
            getNewCode(message);
        }); // Pray this doesnt blow stuff up*/
        console.log("Successfully ? ran code");
    } catch (e) {
        console.log("\n*****************************");
        console.log(e);
        console.log("*****************************\n");
        msgHist.push({role: 'assistant', content: code});
        console.log("msghist:\n");
        console.log(msgHist);
        console.log("\n");
        if (attempts > 2) {
            message.reply(`Tried ${attempts} times to do this but failed.`);
            // OR ask chatgpt why it didn't work then send it
            delete require.cache[require.resolve('../test.js')];
            return;
        }
        getNewCode(msgHist, e, message, attempts);
    }
    delete require.cache[require.resolve('../test.js')];
}
function getNewCode(msgHist, error, message, attempts) {
    // new prompt w err
    // try running code
    // counter?
    let newPrompt = errorPromptHeader + error + errorPromptFooter;
    console.log("\nReprompting...\n");
    queryGPT(newPrompt, msgHist)
    .then((ans) => {
        console.log(ans.data.choices[0].message.content);
        runCode(JSON.parse(ans.config.data).messages, ans.data.choices[0].message.content, message, attempts);
        
    });
}

function execute(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

	var args = message.content.slice(prefix.length).trim();//.split(' ');
	var command = args.split(' ').shift().toLowerCase();
    args = args.slice(command.length).trim();
    if (args.length == 0) {
        message.reply("You didn't provide any arguments. Try again.");
    } else if (command in msgCommands) {
        msgCommands[command](args, message); // call associated function
    } else {
        message.reply(`I am not familiar with the command '${command}'`);
    }
}
msgCommands.ask = ask;
msgCommands.dothis = dothis;
msgCommands.owe = owe;
module.exports = {
	name: Events.MessageCreate,
    execute
};