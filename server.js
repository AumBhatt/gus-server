const app = require('express')();
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT | 3030;

// Solving the CORS issue for local development.
app.use(cors());

// Accept a POST request from client with the '/api/search' endpoint.
app.post('/api/search/:username', (request, response) => {
    console.log(request.params);

    /*
        Making a GET request using axios to GitHub api for fetching user data with
        'username' as the search parameter from the parameters received from POST request.
    */
    axios.get('https://api.github.com/search/users', {
        params: {
            q: request.params.username
        }
    }).then((res) => {
        console.log(res.data);

        response.set('Content-Type', 'application/json');
        // Sending only the user data from GitHub as the response [removing unecessary information].
        response.send(JSON.stringify(res.data));
        response.end();
    }).catch(err => console.error(err));
});

// Accept a POST request from client with the '/api/clear-cache' endpoint.
// app.post('/api/clear-cache');

app.listen(PORT, () => {
    console.log(`Listening @ http://localhost:${PORT}`);
});