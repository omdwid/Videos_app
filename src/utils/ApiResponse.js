class ApiResponse {
  constructor(statusCode, data,  message) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = this.statusCode < 400;
  }
}

export { ApiResponse };