export function validateEmail(email: string) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (typeof email !== "string" || !pattern.test(email)) {
    return "Email is invalid";
  }
}

export function validatePassword(password: string) {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  // const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/;
  let specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/;
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  } else if (
    !uppercaseRegex.test(password) ||
    !lowercaseRegex.test(password) ||
    !numberRegex.test(password) ||
    !specialCharRegex.test(password)
  ) {
    return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
}
