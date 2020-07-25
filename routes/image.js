const express = require('express')
const mongodb = require('mongodb')
const fs = require('fs');
let Jimp = require('jimp')

// Init Router
const router = express.Router()

// Connection String for MongoDB
const connection_string = encodeURI('mongodb://localhost:27017/')

// Path Setup
const upload_path = "C:/Users/soumy/Documents/GitHub/AIR-Internship/public/uploads/"
const resize_path = "C:/Users/soumy/Documents/GitHub/AIR-Internship/public/uploads/resize/"
const crop_path = "C:/Users/soumy/Documents/GitHub/AIR-Internship/public/uploads/crop/"

// Get Methods
router.get('/:id/resize', async (req, res) => {

    let height = req.query.height
    let width = req.query.width

    const images = await loadImage()
    
    if(await images.find({_id:upload_path + req.params.id},{ projection:{_id:1}}).toArray().length > 0){
        await resize_image(req.params.id, height, width)
        res.send(JSON.stringify({
            _id: resize_path + req.params.id,                    
        }))
    } else {
        res.send("Check Image Id")
    }

})

router.get('/:id/crop', async (req, res) => {
    let height = req.query.height
    let width = req.query.width

    const images = await loadImage()
    
    if(await images.find({_id:upload_path + req.params.id},{ projection:{_id:1}}).toArray().length > 0){
        await crop_image(req.params.id, height, width)
        res.send(JSON.stringify({
            _id: crop_path + req.params.id,                    
        }))
    } else {
        res.send("Check Image Id")
    }
})

// Put Methods
router.put('/:id', async (req, res) => {
    let tag = req.query.tag
    
    if(await updateImage(tag, req.params.id) == true){
        res.send("Tag Updated")
    } else {
        res.send("Check Image Id")
    }
})

// Delete Methods
router.delete('/:id', async (req, res) => {

    if(await deleteImage(req.params.id) == true){

        fs.unlink(upload_path + req.params.id, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + req.params.id)
        })

        res.send("Image Deleted")
    } else {
        res.send("Check Image Id")
    }
})

// Load Image from Database
async function loadImage(){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    return client.db('air').collection("upload")
}

// Update Image Tag
async function updateImage(tag, id){
    let flag = false

    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    await client.db('air').collection("upload").updateOne(
        {_id: id},
        {$set: {tag: tag}}
    ,function(err, res) {
        if (err) throw err

        if(res.result.nModified > 0){
            console.log("Document Updated")
        } else {
            console.log("Check Image Id")
        }
    })

}

// Delete Image from Database
async function deleteImage(id){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    client.db('air').collection("upload").deleteOne({ _id: id} ,function(err, res) {
        if (err) throw err
        console.log("Document Deleted")
    })
    return true
}

// Resize Image
async function resize_image(file_name, height, width){

    await Jimp.read(upload_path + file_name)
        .then(lenna => {
        return lenna
            .resize(parseInt(width), parseInt(height)) // resize
            .write(resize_path + file_name) // save
        })
        .catch(err => {
            console.error(err)
        })
}

// Crop Image
async function crop_image(file_name, height, width){

    await new Jimp(upload_path + file_name, function (err, image) {
        let w = image.bitmap.width //  width of the image
        let h = image.bitmap.height // height of the image

        let crop_x = w/2 - width/2 // x coordinate of crop
        let crop_y = h/2 - height/2 // y coordinate of crop

        Jimp.read(upload_path + file_name)
            .then(lenna => {
            return lenna
                .crop(crop_x, crop_y, parseInt(width), parseInt(height)) // resize
                .write(crop_path + file_name) // save
            })
            .catch(err => {
                console.error(err)
            })
    })
}

module.exports = router