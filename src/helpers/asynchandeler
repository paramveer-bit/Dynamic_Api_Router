const asyncHandler = (reqHandler: any) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err))
    }

}


export default asyncHandler

// const asyncHandler = (fun) => async (req,res,next) =>{
// try {
//     await fun(req,res,next)
// } catch (error) {
//     res.status(arr.code || 500).json({
//         success : false,
//         message : error.message
//     })
// }
// }