const express = require('express')
const mongodb = require('mongodb')
const multer = require('multer')
const fetch = require('node-fetch')
let path = require('path')
let Jimp = require('jimp');

// Connection String for MongoDB
const connection_string = encodeURI('mongodb://localhost:27017/')


// Path Setup
const base_path = process.cwd().split("\\").join("/")
const staging1_path = base_path + '/public/uploads/staging/resize/'
const staging2_path = base_path + '/public/uploads/staging/crop/'
const upload_path = base_path + '/public/uploads/'


// Init Router
const router = express.Router()


// Set Storage Engine
const storage = multer.diskStorage({
    destination: staging1_path,
    filename: function(req, file, cb){
        cb(null, 'image-' + Math.floor(Date.now()/1000) + path.extname(file.originalname))
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

    let images = await loadImage()
    let data = await images.find({},{ projection:{_id:1, path:1, tag:1}}).toArray()
    res.render('pages/upload',{
        data: data
    })
})


// Post Methods
router.post('/', async (req, res) => {
    upload_image(req, res, async (err) => {

        let filename = req.file.filename
        let tag = req.body.tag

        if(err){
            res.render('pages/upload', {
                msg: err
            })
        } else {
            await manipulate_image(filename)
            await insertImage(filename, tag)

            let images = await loadImage()
            let data = await images.find({},{ projection:{_id:1, path:1, tag:1}}).toArray()

            res.render('pages/upload',{
                msg: "Image Uploaded, Please note the image ID: " + filename,
                data: data
            })
        }
    })
})

router.post('/browse', async(req, res) => {
    let tag = req.body.tag

    if(tag.length > 0){
        let response = await (await fetch('http://localhost:3000/images/' + tag)).json()

        res.render('pages/upload',{
            data: response
        })
    }
    else {
        res.redirect('/upload/')
    }

})


/*
    Database Methods
*/
// Insert into Database
async function insertImage(filename, tag){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    let data = {
        _id : filename,
        path: upload_path + filename,
        tag : tag
    }

    client.db('air').collection("upload").insertOne(data, function(err, res) {
        if (err) throw err;
        console.log("Inserted Succesfully")
    });
}

// Load Image from Database
async function loadImage(){
    const client = await mongodb.MongoClient.connect(connection_string, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    return client.db('air').collection("upload")
}


/*
    Image Manipulation Methods
*/
async function manipulate_image(filename){

    // Stage1 Resize Image while maintaining aspect ratio
    const stage1 = await Jimp.read(staging1_path + filename)

    if(stage1.bitmap.width > stage1.bitmap.height) {
        await stage1.resize(800, Jimp.AUTO).write(staging2_path + filename)
    } else {
        await stage1.resize(Jimp.AUTO, 800).write(staging2_path + filename)
    }

    // Stage2 Crop and Compress Image
    const stage2 = await Jimp.read(staging2_path + filename)

    let crop_x = stage2.bitmap.width/2 - 150 // x coordinate of crop
    let crop_y = stage2.bitmap.height/2 - 150 // y coordinate of crop

    await stage2.crop(crop_x, crop_y, 300, 300).write(upload_path + filename)

}

module.exports = router