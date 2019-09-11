var express = require('express');
var router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

/* GET users listing. */
router.get('/', function (req, res, next) {
    let lat = req.query.lat;
    let long = req.query.long;

    const options = zomatoAPI(lat, long);
    const url = `https://${options.hostname}${options.path}`;

    axios.get(url, {headers: {'user-key': process.env.ZOMATO_KEY}})
        .then((response) => {
            return response.data;
        })
        .then(data => {
            let results = data.restaurants.map(info => {
                return ({
                    name: info.restaurant.name,
                    address: info.restaurant.location.address,
                    latlongRest: [info.restaurant.location.latitude,info.restaurant.location.longitude],
                    cuisines: info.restaurant.cuisines,
                    cost: info.restaurant.average_cost_for_two
                })
            })

            res.json({
                'results': results,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send({"error": "something went wrong querying attractions"});
        })
});

const queryValues = {
    count: '20',
    radiusInMeters: '20000'
};


function zomatoAPI(lat, long) {
    const options = {
        hostname: 'developers.zomato.com',
        //what is this port doing here?
        port: 443,
        path: '/api/v2.1/search?'
    };

    const prams = 'lat=' + lat + '&lon=' + long
        + '&radius=' + queryValues.radiusInMeters + '&count=' + queryValues.count
        + '&sort=real_distance&order=asc';
    options.path += prams;

    return options;
}

module.exports = router;
