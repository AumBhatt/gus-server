import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'
import 'dotenv/config';

import {getGitHubData, clearRedisCache} from './redisClient.js';

const app = express();

const PORT = process.env.PORT || 3030;


// Solving the CORS issue for local development.
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
    My initial idea was to pass username to be searched as a parameter in 
    url, then extract parameter from request url and pass it to the getGitHubData.
*/
// Accept a POST request from client with the '/api/search' endpoint.
app.post('/api/search', (request, response) => {

    console.log("Client Connected: /api/search");
    const requestBody = request.body;
    let errorMessage;

    if(requestBody.constructor === Object && Object.keys(requestBody).length === 0) {
        errorMessage = "request body missing";
        response.statusCode = 421;
        response.set('Content-Type', 'application/json');
        response.send(
            JSON.stringify({
                errorCode: -2,
                error: errorMessage
            })
        );
        response.end();
        console.log("Request error:", errorMessage);
    }
    else if(requestBody.searchType === 'users' && requestBody.searchText)
        getGitHubData(requestBody.searchText)
        .then((resData) => { 
            // console.log("resData:", resData)
            response.statusCode = 200;
            response.set('Content-Type', 'application/json');
            if(resData !== -1) {
                response.send(resData);
                response.end();
                console.log("Express: Response sent.");
            }
            else {
                errorMessage = "Could not retrieve data from GitHub.";
                response.statusCode = 422;
                    response.send(
                        JSON.stringify(
                        {
                            errorCode: -1,
                            error: "Could not retrieve data from GitHub."
                        }
                    )
                );
                response.end();
                console.log("Request error:", errorMessage);
            }
        });
    else {
        errorMessage = "searchType or searchText keys missing in body of request.";
        response.statusCode = 423;
        response.set('Content-Type', 'application/json');
        response.send(
            JSON.stringify({
                errorCode: -3,
                error: "searchType or searchText keys missing in body of request."
            })
        );
        response.end();
        console.log("Request error:", errorMessage);
    }
});

// Accept a POST request from client with the '/api/clear-cache' endpoint.
// The response is in plain/text as much information is
app.post('/api/clear-cache', (request, response) => {
    
    console.log("Client Connected: /api/clear-cache");

    response.set('Content-Type', 'application/json');
    clearRedisCache()
    .then(() => {
        response.statusCode = 207;
        response.send(
            JSON.stringify({
                flushStatus: 'success',
                error: null
            })
        );
        response.end();
    })
    .catch(err => {
        console.error("Redis Flush Error", err);
        response.statusCode = 424;
        response.send(
            JSON.stringify({
                flushStatus: 'failed',
                error: err
            })
        );
        response.end();
    });
});

app.listen(PORT, () => {
    console.log(`Listening @ http://localhost:${PORT}`);
});