
require('dotenv').config();
const hre = require("hardhat");
const fs = require("fs");
const https = require('axios');
const Web3 = require('web3');
const hre = require("hardhat");


//intialize Web3 with the Url of our environment as a variable
const web3 = Web3(new Web3.providers.HttpProvider(process.env.RPC));
//get contract address and abi file path from env vars
const contractAbi = JSON.parse(fs.readFileSync(process.env.ABI)).abi;
//initialize contract variable
var contract =  new Web3.eth.Contract(contractAbi, contractAddress);

const Oracle = await hre.ethers.getContractFactory("Oracle");
const oracle = await Oracle.deploy();
console.log(oracle.address,"Oracle address")

await oracle.deployed();
const contractAddress = oracle.address;

//simple function for calling API with lat and long, returning temp from JSON(see included doc link in article)
function callAPI(lat, long){ 
    axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`)
        .then(res => {
            return res.data.main.temp;
  })
  .catch(err => {
    return "ERROR"
  });
}

//While loop until program is canceled to continue to receive events
while(true){
    //initialize a contract listener for emmisions of the "NewJob" event, see web3.js for docs
    contract.on("NewJob", (lat, lon, jobId) => {
        //use lat and lon to call API
        var temp = callAPI(lat, lon);
        if(temp != "ERROR"){
            //send data to updateWeather function on blockchain if temp is received
            contract.methods.updateWeather(temp, jobId).send();
        }
    })
}