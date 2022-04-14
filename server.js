const app = require('express')();
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT | 3030;

app.use(cors());

app.post('/api/search/:username', (request, response) => {
    console.log(request.params);

    axios.get('https://api.github.com/search/users', {
        params: {
            q: request.params.username
        }
    }).then((res) => {
        console.log(res.data);
        response.set('Content-Type', 'application/json');
        response.send(JSON.stringify(res.data));
        response.end();
    }).catch(err => console.error(err));
});

app.listen(PORT, () => {
    console.log(`Listening @ http://localhost:${PORT}`);
});