class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "Error";
    this.code = code;
  }
}
export { CustomError };
