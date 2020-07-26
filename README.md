# AIR-Internship

A minimal RESTful Image Manipulation API Server to manipulate images based on api requests.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites

What things you need to install the software and how to install them

```
1.NodeJs
2.MongoDB
```


### Installing

A step by step series of examples that tell you how to get a development env running

Clone the repository
Open your terminal/cmd and type the following command. (Make sure git is installed in your system)
```
git clone https://github.com/soumyasudipta/AIR-Internship.git
```
Go to the AIR-Internship Folder and check if all the files exists.

Open NodeJS command prompt and go to the folder where the cloned repository exists.
Go Inside AIR-Internship and type the following command.
```
npm install
```
After all the dependencies has been installed. 
Open MongoDB Shell and create a new database called "air". 

After the database has been created go to the previous command prompt and type:
```
node index.js
```
Now the setup is complete and the server has started.


## Running the tests

### Website

It is a simple web UI where all the REST API operations can be done very easily.
Individual operation available in the web UI carries out API requests to the server and displays output. 
```
localhost:3000/upload
```

Supported REST API methods.
### POST /upload - 
This method accepts an image and a tag. The image has to be resized to 800 x 800 in pixels (at least one
of the height or width has to be 800px, the other has to be less than or equal to 800px) while maintaining the aspect ratio.
Crop the image such that a bounding box of 300 x 300 (pixels) is applied to the absolute center of the image. Compress
the image to fit within 500 KB, it is recommended to store the image in 72 PPI JPEG. Save the uploaded image and return
the ID generated. This can be in HTML in the page itself or a JSON encoded output.
NOTE: If you are using a form in a browser to upload the image, print an appropriate message requesting the user to
save the returned ID as it'll be used in subsequent requests.

### GET supports the following operations:
```
localhost:3000/image/:id/resize?height={value}&width={value} - returns a resized image with appropriate dimensions.

localhost:3000/image/:id/crop?height={value}&width={value} - returns a cropped image with appropriate dimensions.

localhost:3000/images/:tag - returns a list of images having the specified tag
```

### PUT 
``` 
localhost:3000/image/:id?tag={new-tag} - Updates the tag of the specified image to new-tag.
```
### DELETE 
```
localhost:3000/image/:id - Deletes the specified image from the database.
```
