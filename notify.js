import axios from 'axios'
import config from './config.js'


const sendMessage = async (sonde, location) => {
    const body = `${sonde.manufacturer} ${sonde.subtype} Sonde ${sonde.serial} Landed at:
${location}`;
    await axios.post(`${config.ntfyEndpoint}`, body, {
        headers: {
            Title: `Sonde Landed in the area!`,
            Click: `https://sondehub.org/${sonde.serial}`
        }
    })
}

export {
    sendMessage
}