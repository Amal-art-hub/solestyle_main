import fs from "fs";

import path from "path";

import { fileURLToPath } from "url";


const __filename=fileURLToPath(import.meta.url);


const __dirname=path.dirname(__filename);


// Since you are using "ES Modules" (using import instead of require),
//  Node.js doesn't automatically know where the file is. 
// These two lines are the standard way to find your current folder.

const logsDir=path.join(__dirname,"../logs");
// Go up one folder from 'utils/' and look for a folder called 'logs'.

const logFile=path.join(logsDir,"access.log");
// Inside that 'logs' folder, we want to talk to a file named 'access.log'.


if(!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir);
}
// "!fs.existsSync" means "If this folder does NOT exist..."
// "...then create the folder (Make Directory) right now."


export const logToFile=(message)=>{
    const timestamp=new Date().toLocaleString();


    const logEntry=`[${timestamp}] ${message}\n`;

fs.appendFileSync(logFile,logEntry);

console.log(logEntry.trim());
};

