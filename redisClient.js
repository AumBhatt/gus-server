import axios from 'axios';
import ioredis from 'ioredis';
import 'dotenv/config'

async function getGitHubData(searchKey) {

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


    const keyExists = await client.exists(searchKey);
    if(keyExists === 1) {
        console.log(searchKey, 'key exists.');
        return await client.get(searchKey);
    }
    else {
        console.log(searchKey, 'does not exist.\nRequesting GitHub for Data....');
        const processedData = await axios.get('https://api.github.com/search/users', {
            params: {
                q: searchKey
            }
        }).then((res) => {
            if(res.status === 200)
                return processSearchData(res.data);
        }).catch(err => {
            console.error(err);
            return -1;
        });

        await client.set(searchKey, JSON.stringify(processedData));
        console.log('Caching Data...');
        return processedData;
    }
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

export default getGitHubData;