const express = require('express');
const mongodb = require('mongodb');


// Init Router
const router = express.Router();


// Connection String for MongoDB
const connection_string = encodeURI('mongodb://localhost:27017/')


// Get Methods
router.get('/:tag', async (req, res) => {
    let tag = req.params.tag
    
    let images = await loadImage()

    res.send(await images.find({tag: tag},{ projection:{_id:1, path:1, tag:1}}).toArray())

})


// Load Image from Database
async function loadImage(){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    return client.db('air').collection("upload")
}

module.exports = router;