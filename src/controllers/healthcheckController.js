import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async(req, res)=> {
// if(!req || !res){
//     throw new ApiError(500, "Server is down")
// } 
 return res
 .status(200)
 .json(new ApiResponse(
    200, 
    {},
    "Server is up and running"
    )
 )
})

export {healthCheck}