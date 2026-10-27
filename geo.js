import axios from 'axios'

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

let tryAfter = false;

const findCoords = async (coords) => {
    if (!Array.isArray(coords) || coords.length != 2 || !coords.every(x => typeof x == 'number')) {
        throw new Error(`'coords' must be [Number,Number]`);
    }
    await new Promise(r => setTimeout(r, 1000)); // sleep for 1s
    if (tryAfter != false && tryAfter - Date.now() > 0) {
        console.log(`Address blocked by rate limiter. Time left: ${tryAfter - Date.now()}`)
        return `somewhere, but we can't find where because we are blocked from accessing OSM`
    }
    let data;
    try {
        data = (await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json`, {
            headers: {
                'User-Agent': 'Sonde-Notifier v0.1'
            }
        })).data
    } catch (e) {
        if (!e.response) {
            console.log(e.message)
            return `somewhere, but we had a problem finding where: ${e.message}`
        }
        if (e.response.status == 429) {
            tryAfter = Date.now() + (10 * 60 * 1000)
            console.log('Too many requests to OSM API. Stopping Addresses for 10 minutes')
            return 'somewhere, but we just got blocked from the OSM API..'
        }
        console.log(`ERROR: ${JSON.stringify(e.response.data.error)}`)
        return `somewhere, but we had an error parsing it: ${e.response.data.error.message}`
    }
    if (data.error == 'Unable to geocode') {
        return 'the middle of nowhere'
    }
    return data.display_name
}

export {
    getDistanceFromLatLonInKm,
    deg2rad,
    findCoords
}