# sonde-notify
A small app that sends a notification if a radiosonde lands near you through ntfy.sh.

## Configuration
To create an example configuration file(`config.json`), simply run the app (`node app.js`).
* `ntfyEndpoint`: The URL for your ntfy.sh's feed (self hosted instances should work as well)
* `lat`: Your latitude.
* `lon`: Your longitude.
* `distance`: Maximum distance from you in km that the app should notify you for.

## Launch
Simply run `node app.js`.

If you are running it through docker, make sure to create empty files names `config.json` and `history.txt`, otherwise docker will think these are folders.