import express from 'express';
import cors from 'cors';
import 'dotenv/config'

import getGitHubData from './redisClient.js';

const app = express();

const PORT = 3030;



// Solving the CORS issue for local development.
app.use(cors());

// Accept a POST request from client with the '/api/search' endpoint.
app.post('/api/search/:username', (request, response) => {
    console.log(request.params);

    getGitHubData(request.params.username)
    .then((resData) => { 
        console.log("resData:", resData)
        response.set('Content-Type', 'application/json');
        if(resData !== -1) {
            response.send(resData);
            response.end();
        }
        else {
            response.send(
                JSON.stringify(
                    {
                        errorCode: -1,
                        error: "Could not retrieve data from GitHub."
                    }
                )
            );
            response.end();
        }
    });
});

const setRedisData = () => {
    client.set(searchKey, processSearchData(res.data))
    
}

// Accept a POST request from client with the '/api/clear-cache' endpoint.
// app.post('/api/clear-cache');

app.listen(PORT, () => {
    console.log(`Listening @ http://localhost:${PORT}`);
});