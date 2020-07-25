const express = require('express')
const mongodb = require('mongodb')
const fs = require('fs');
let path = require('path')
let Jimp = require('jimp')


// Init Router
const router = express.Router()


// Connection String for MongoDB
const connection_string = encodeURI('mongodb://localhost:27017/')


// Path Setup
const base_path = process.cwd().split("\\").join("/")
const upload_path = base_path + '/public/uploads/'
const resize_path = base_path + '/public/uploads/resize/'
const crop_path = base_path + '/public/uploads/crop/'


// Get Methods
router.get('/:id/resize', async (req, res) => {

    let height = req.query.height
    let width = req.query.width
    let id = req.params.id

    const images = await loadImage()

    if((await images.find({ _id:id },{_id:1}).toArray()).length > 0){
        await resize_image(id, height, width)
        res.send(JSON.stringify({
            resizep_image_path: resize_path + id,                    
        }))
    } else {
        res.send("Check Image Id")
    }

})

router.get('/:id/crop', async (req, res) => {
    let height = req.query.height
    let width = req.query.width
    let id = req.params.id

    const images = await loadImage()
    
    if((await images.find({ _id:id },{ projection:{ _id:1 }}).toArray()).length > 0){
        await crop_image(id, height, width)
        res.send(JSON.stringify({
            crop_image_path: crop_path + id,                    
        }))
    } else {
        res.send("Check Image Id")
    }
})


// Put Methods
router.put('/:id', async (req, res) => {
    let tag = req.query.tag
    let id = req.params.id
    
    const images = await loadImage()

    if((await images.find({ _id:id },{ projection:{ _id:1 }}).toArray()).length > 0){
        await updateImage(tag, id)
        res.send("Tag Updated")
    } else {
        res.send("Check Image Id")
    }

})


// Delete Methods
router.delete('/:id', async (req, res) => {

    let id = req.params.id
    
    const images = await loadImage()

    if((await images.find({ _id:id },{ projection:{ _id:1 }}).toArray()).length > 0){
        await deleteImage(id)
        fs.unlink(upload_path + id, (err) => {
            if (err) throw err;
            console.log('Successfully deleted image ' + id)
        })
        res.send("Image Deleted")
    } else {
        res.send("Check Image Id")
    }

})


/*
    Database Methods
*/
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
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    await client.db('air').collection("upload").updateOne(
        {_id: id},
        {$set: {tag: tag}}
    , function(err, res) {
        if (err) throw err

        if(res.result.nModified > 0){
            console.log("Document Updated")
        } else {
            console.log("Same Tagname")
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


/*
    Image Manipulation Methods
*/
// Resize Image
async function resize_image(filename, height, width){
    await Jimp.read(upload_path + filename)
        .then(file => {
        return file
            .resize(parseInt(width), parseInt(height)) // resize
            .write(resize_path + filename) // save
        })
        .catch(err => {
            console.error(err)
        })
}

// Crop Image
async function crop_image(filename, height, width){
    await new Jimp(upload_path + filename , function (err, image) {
        let w = image.bitmap.width //  width of the image
        let h = image.bitmap.height // height of the image

        let crop_x = w/2 - width/2 // x coordinate of crop
        let crop_y = h/2 - height/2 // y coordinate of crop

        Jimp.read(upload_path + filename)
            .then(file => {
            return file
                .crop(crop_x, crop_y, parseInt(width), parseInt(height)) // resize
                .write(crop_path + filename) // save
            })
            .catch(err => {
                console.error(err)
            })
    })
}

module.exports = router