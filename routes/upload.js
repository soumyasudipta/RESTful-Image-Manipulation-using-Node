const express = require('express')
const mongodb = require('mongodb')
const multer = require('multer')
let path = require('path')
let Jimp = require('jimp');

// Connection String for MongoDB
const connection_string = encodeURI('mongodb://localhost:27017/')

// Path Setup
const staging_upload_path = "C:/Users/soumy/Documents/GitHub/AIR-Internship/public/uploads/staging/"
const upload_path = "C:/Users/soumy/Documents/GitHub/AIR-Internship/public/uploads/"

// Init Router
const router = express.Router()

// Set Storage Engine
const storage = multer.diskStorage({
    destination: staging_upload_path,
    filename: function(req, file, cb){
        cb(null, 'image-' + Date.now() + path.extname(file.originalname))
    }
})

// Init Upload
const upload_image = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        // Allowed Extensions
        const filetypes = /jpeg|jpg|png/
        // Check Extension
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        // Check Mime
        const mimetype = filetypes.test(file.mimetype)

        if(mimetype && extname){
            return cb(null, true)
        } else {
            cb('Error: Only images allowed to upload')
        }
    }
}).single('uploadimage')

// Get Methods
router.get('/', async (req, res) => {

    res.render('pages/upload')

})

// Post Methods
router.post('/', async (req, res) => {

    upload_image(req, res, (err) => {
        if(err){
            res.render('pages/upload', {
                msg: err
            })
        } else {
            insertImage("upload", req.file.filename, req.body.tag)
            change_image(req.file.filename)
            res.send(JSON.stringify({
                _id: req.file.filename,
                path: upload_path + req.file.filename,
                tag: req.body.tag                      
            }))
        }
    })
    
})

// Insert image into mongodb
async function insertImage(collection, filename, tag){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    let data = {
        _id : filename,
        path: upload_path + filename,
        tag : tag
    }

    client.db('air').collection(collection).insertOne(data, function(err, res) {
        if (err) throw err;
        console.log("Inserted Succesfully")
    });
}

// Change image according to said dimensions
async function change_image(filename){

    // Resize Image
    await new Jimp(staging_upload_path + filename, function (err, image) {
        let w = image.bitmap.width //  width of the image
        let h = image.bitmap.height // height of the image

        if(w > h){
            Jimp.read(staging_upload_path + filename, (err, lenna) => {
                if (err) throw err
                lenna
                    .resize(800, Jimp.AUTO) // resize
                    .write(staging_upload_path + filename) // save
                })
        } else {
            Jimp.read(staging_upload_path + filename, (err, lenna) => {
                if (err) throw err
                lenna
                    .resize(Jimp.AUTO, 800) // resize
                    .write(staging_upload_path + filename) // save
                })
        }
    })

    // Crop and Compress
    await new Jimp(staging_upload_path + filename, function (err, image) {
        let w = image.bitmap.width //  width of the image
        let h = image.bitmap.height // height of the image

        let crop_x = w/2 - 300/2 // x coordinate of crop
        let crop_y = h/2 - 300/2 // y coordinate of crop


        Jimp.read(staging_upload_path + filename)
            .then(lenna => {
            return lenna
                .crop(crop_x, crop_y, 300, 300) // resize
                .quality(75) // compress
                .write(upload_path + filename) // save
            })
            .catch(err => {
                console.error(err)
            })
    
    })
}

module.exports = router