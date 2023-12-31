class Response<T = {}> {
  message: string;
  type: string;
  data?: T; // Making data property optional
  status: number;
  constructor(message: string, status = 200, type = "", data?: T) {
    this.message = message;
    this.type = type;
    this.data = data;
    this.status = status;
  }
}
export default Response;
