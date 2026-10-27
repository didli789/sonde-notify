import fs from 'fs/promises'

const exampleConfig = {
    'ntfyEndpoint': 'https://ntfy.sh/example-topic',
    'lat': 0,
    'lon': 0,
    'distance': 25
}

let configData;

const createConfigFile = async () => {
    await fs.writeFile('./config.json', JSON.stringify(exampleConfig, null, 4))
    console.log(`'config.json' wasn't found, so an example file was created. Please fill the settings before running again.`)
    process.exit(1)
}

const validateConfig = async () => {
    let valid = true
    try {
        new URL(configData.ntfyEndpoint);
    } catch (e) {
        console.log(`Error: config.ntfyEndpoint isn't a valid URL.`)
        valid = false
    }
    if (typeof configData.lat != 'number') {
        console.log(`Error: config.lat isn't a number.`)
        valid = false
    }
    if (typeof configData.lon != 'number') {
        console.log(`Error: config.lon isn't a number.`)
        valid = false
    }
    if (typeof configData.distance != 'number') {
        console.log(`Error: config.distance isn't a number.`)
        valid = false
    }
    if (!valid) process.exit(2)
}
try {
    const configFile = await fs.readFile('./config.json');
    if (configFile.toString() == '') await createConfigFile();
    configData = JSON.parse(configFile.toString())
    await validateConfig();
} catch (e) {
    if (e.code == 'ENOENT') await createConfigFile();
    else console.log(e)
}

export default configData