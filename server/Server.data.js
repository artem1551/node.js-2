const fs = require('fs');
const state = [];
const directory = './files/';
const crypto = require('crypto-js');
const path = require("path");


function statusBody (request, response) {
    const result = {};
    result.count = state.length;

    const sumAllArrays = state.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.length;
    }, 0);

    const flattedArray = state.flat();
    const sumNumArray = flattedArray.reduce((acc, cur) => {
        return acc + Number(cur);
    }, 0);

    let unique = flattedArray.filter((val, index, a) => a.indexOf(val) === index); 

    result.arithmeticMean = sumNumArray / sumAllArrays
    result.valuesTotalLength = sumAllArrays;
    result.uniqueValues = unique;

    response.send(result);
};

function updateBody (request, response) {
    let bodyResult = request.body.values;
    const encrypted = crypto.AES.encrypt(JSON.stringify(bodyResult), "Hello-world");
    const date = new Date();
    state.push(bodyResult);

    fs.appendFile(`./files/${date.getTime()}.txt`, encrypted.toString(), (err) => {
        if (err) {
            console.log(err);
        }
    });

    response.send(state);
};

function getDataFile(req, res) {
    const bodyFromFile = {}
    console.log('start')
    
    fs.readdir(directory, (err, files) => {
        console.log('readdirSync');
        files.forEach(file => {
            let filepath = directory + file;
            fs.readFile(filepath, "utf8", (err, data) => {
                console.log('readFileSync')
                let name = path.parse(filepath).name;
                if (err) {
                    console.log(err)
                };
                let date = (new Date(+name)).toString();
                let code = crypto.AES.decrypt(data, "Hello-world");
                let decrypted = code.toString(crypto.enc.Utf8);
                bodyFromFile[date] = decrypted;
            });
        });

    });

    // console.log(bodyFromFile);
    res.send(bodyFromFile)
};


module.exports = {
    statusBody,
    updateBody,
    getDataFile,
};