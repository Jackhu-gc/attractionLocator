var express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
var router = express.Router();

/** Get attractions based on location from Google API **/
router.get('/', function (req, res, next) {
    if (!req.query.latlong || !req.query) {
        res.status(400).send({"error": "oops! it looks like you're missing the query parm"});
    }

    const options = triposoAPI(req.query.latlong);
    const url = `https://${options.hostname}${options.path}`;

    /**fetch data from url with location query**/
    axios.get(url)
        .then((response) => {
            return response.data;
        })
        .then(data => {

            /**Separate different returns based on whether there is image**/
            let results = data.results.map(info => {

                if (info.images.length !== 0) {

                    return ({
                        name: info.name,
                        latlong: [info.coordinates.latitude, info.coordinates.longitude],
                        description: info.snippet,
                        thumbnail: info.images[0].sizes.thumbnail.url,
                        distanceToPin: info.distance
                    })
                } else {
                    return ({
                        name: info.name,
                        latlong: [info.coordinates.latitude, info.coordinates.longitude],
                        description: info.snippet,
                        distanceToPin: info.distance
                    })
                }
            })

            res.json({
                'results': results,
                'total': results.length
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send({"error": "something went wrong querying attractions"});
        })

});

/**Params**/
const queryValues = {
    tagLabels: 'topattractions',
    orderBy: 'distance',
    //maybe add count
    count: '20',
    radiusInMeters: '20000'
};

/**triposo url formatting**/
function triposoAPI(latlong) {
    const options = {
        hostname: 'www.triposo.com',
        //what is this port doing here?
        port: 443,
        path: '/api/20181213/poi.json?'
    };

    const prams = 'tag_labels=' + queryValues.tagLabels
        + '&order_by=' + queryValues.orderBy + '&count=' + queryValues.count
        + '&fields=snippet,coordinates,name,images' + '&distance=<'
        + queryValues.radiusInMeters + '&annotate=distance:' + latlong
        + '&account=' + process.env.ACCOUNT + '&token=' + process.env.TOKEN;
    options.path += prams;

    return options;
}

module.exports = router;
