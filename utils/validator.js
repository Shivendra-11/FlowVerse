const validator = require("validator");

const validate = (data) => {

  // Allowed fields check
  const allowedFields = ["firstName", "lastName", "emailId", "password"];
  const dataFields = allowedFields.every((k) => Object.keys(data).includes(k));

  if (!dataFields) {
    throw new Error("Invalid fields in data");
  }

  // Email validation
  if (!validator.isEmail(data.emailId)) {
    throw new Error("Invalid email format");
  }

  // Password validation
  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Password is not strong enough");
  }

  // First name length
  if (data.firstName.length < 2 || data.firstName.length > 20) {
    throw new Error("First name must be between 2 and 20 characters");
  }

  // Last name length
  if (data.lastName.length < 2 || data.lastName.length > 20) {
    throw new Error("Last name must be between 2 and 20 characters");
  }

  return true; 
};

module.exports = validate;
