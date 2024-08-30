//! New Class for Custom Error 
export class AppError extends Error {
  constructor(message,statuScode){
    super(message)
    this.statuScode = statuScode;
  }
}