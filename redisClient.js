import axios from 'axios';
import ioredis from 'ioredis';
import 'dotenv/config'

async function getGitHubData(searchKey) {

    // Connecting to Redis Cloud using ioredis node.js client.
    const client = ioredis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });

    client.on('error', (err) => {
        console.error("Redis Client error:", err);
    });
    
    await client.on('connect',  () => {
        console.log("Connected to Redis Cloud.")
    });

    // Check if the search result exists in redis cache.
    const keyExists = await client.exists(searchKey);
    if(keyExists === 1) {
        // If search results exist in redis then directly send them to client.
        console.log("Redis:", searchKey, 'key exists.');
        return await client.get(searchKey);
    }
    else {
        /*
            If search results don't exist in redis then
            make a call to GitHub api for retrieving the data.
        */
        console.log(`Redis: '${searchKey}' key does not exist.\nAxios: Requesting GitHub API for User Data....`);
        const processedData = await axios.get('https://api.github.com/search/users', {
            params: {
                q: searchKey
            }
        }).then((res) => {
            // If data received, then process it followed by returning it for caching and sending.
            if(res.status === 200)
                return processSearchData(res.data);
        }).catch(err => {
            console.error(err);
            return -1;
        });


        // Updating the cache by adding the processed search results for 7200s (= 2 hours).
        await client.setex(searchKey, 7200, JSON.stringify(processedData));
        console.log(`Redis: Caching Data for '${searchKey}' key.`);
        return processedData;
    }
}

async function clearRedisCache() {
    const client = ioredis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });

    client.on('error', (err) => {
        console.error("Redis Client error:", err);
    });
    
    await client.on('connect',  () => {
        console.log("Connected to Redis Cloud.")
    });

    client.flushall((err, success) => {
        console.log("Redis flush status:", (success === 'OK') ? "success." : "failed.");
        return success;
    });
    
}

const processSearchData = (data) => {
    if(data === -1)
        return -1;
    
    let tempList = [];
    for(let i in data.items) {
        tempList[i] = {
            avatar_url: data.items[i].avatar_url,
            login: data.items[i].login,
            html_url: data.items[i].html_url
        }
    }
    return tempList;
}

export {getGitHubData, clearRedisCache};