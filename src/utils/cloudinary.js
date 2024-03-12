import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response =  await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
       }) 
       // file has been uploaded successfull
       console.log("File has been uploaded on cloudinary successfully", response.url);
       return response;
    } catch (error) {
        // remove the locally saved file as the upload operation failed
        fs.unlinkSync(localFilePath)
        return null;
    }

}

export {uploadOnCloudinary}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });
