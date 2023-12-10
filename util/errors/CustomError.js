class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "Error";
    this.statusCode = code;
    this.name = this.constructor.name;
  }
}
export { CustomError };
