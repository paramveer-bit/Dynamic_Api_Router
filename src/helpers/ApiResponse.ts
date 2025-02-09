class ApiResponse {
    statusCode: string;
    data: JSON;
    message: string;
    success: boolean;

    constructor(statusCode: string, data: string, message = "Success") {
        this.statusCode = statusCode;
        this.data = JSON.parse(data);
        this.message = message;
        this.success = parseInt(statusCode) < 400;
    }
}

export default ApiResponse 