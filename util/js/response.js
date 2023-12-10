class Response {
  constructor(message, status = 200, type = "", data = {}) {
    this.message = message;
    this.type = type;
    this.data = data;
    this.status = status;
  }
}

export default Response;
