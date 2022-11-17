
// require('dotenv').config();
const fs = require("fs");
const {https,axios} = require('axios');
const Web3 = require('web3');
const hre = require("hardhat");
const { env } = require("process");
const { ethers } = require("hardhat");

let contractAddress;

console.log("1")
//intialize Web3 with the Url of our environment as a variable
// const web3 = Web3( Web3.providers.HttpProvider(process.env.RPC));
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
//get contract address and abi file path from env vars
const contractAbi = process.env.ABI;
//initialize contract variable
console.log("3")
async function deployOracle(){
    console.log("2")
    const Oracle = await hre.ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy();
    console.log(oracle.address,"Oracle address")
    
    await oracle.deployed();
    const contractAddress = oracle.address;
    console.log(contractAddress,"contractAddress")
}

deployOracle().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

var contract =   ethers.getContractAt(contractAbi, contractAddress);
//simple function for calling API with lat and long, returning temp from JSON(see included doc link in article)
function callAPI(){ 
    let prices = axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`,{price : {}})
        .then(res => {
            return res.data.main.price;
  })
  .catch(err => {
    return "ERROR"
  });
}
var price = callAPI();
console.log(price,"prices")

//While loop until program is canceled to continue to receive events
while(true){
    //initialize a contract listener for emmisions of the "Job" event, see web3.js for docs
    contract("NewJob", (jobId) => {
        //use lat and lon to call API
        var price = callAPI();
        if(price != "ERROR"){
            //send data to updateWeather function on blockchain if temp is received
            contract.methods.updatePrice(price, jobId).send();
        }
    })
}