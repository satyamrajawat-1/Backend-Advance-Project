class ApiResponse{
    constructor(statusCode,data,message = "success"){
        this.data = data
        this.statusCode = statusCode
        this.message = message
    }
}

export {ApiResponse}