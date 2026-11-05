import mqtt from 'mqtt';
import axios from 'axios';
import fs from 'fs/promises'
import { randomBytes } from 'node:crypto'
import config from './config.js'
import { getDistanceFromLatLonInKm, findCoords } from './geo.js'
import { sendMessage } from './notify.js'
import process from 'process'

const historyFile = await fs.open('./history.txt', 'a+')
const history = (await historyFile.read()).buffer.toString('utf-8').split('\n')

const mqttEndpoint = (await axios.get('https://api.v2.sondehub.org/sondes/websocket')).data;
const clientId = `sonde-notifier-${Buffer.from(randomBytes(16)).toString('hex')}`;
const client = mqtt.connect(mqttEndpoint, {
    clientId: clientId
});

const maxAltHistory = {};

client.on("connect", () => {
    console.log('Connected to MTQQ..')
    client.subscribe("sondes/#", (err) => {
        if (!err) {
            console.log(`subscribed to sondes/# as ${clientId}`)
        } else console.log(err)
    });
});

client.on("message", async (topic, message) => {
    const sonde = JSON.parse(message.toString())
    if (maxAltHistory[sonde.serial] == undefined || maxAltHistory[sonde.serial] < sonde.alt) maxAltHistory[sonde.serial] = sonde.alt;
    if (getDistanceFromLatLonInKm(config.lat, config.lon, sonde.lat, sonde.lon) < config.distance) {
        if (history.includes(sonde.serial)) return
        if ((sonde.alt < 350 && sonde.vel_v < 1.0) && maxAltHistory[sonde.serial] > 1500
            || (sonde.alt < 600) && (new Date().getTime() - new Date(sonde.time_received).getTime()) > 1800000) {
            history.push(sonde.serial)
            const location = await findCoords([sonde.lat, sonde.lon])
            console.log(`FOUND SONDE! SERIAL: ${sonde.serial} LOC: ${location}`)
            sendMessage(sonde, location);
            await historyFile.appendFile(`${sonde.serial}\n`)
        }
    }
});

process.on('SIGINT', async () => {
    console.log('Closing...')
    client.end();
    historyFile.close();
    process.exit(0);
})