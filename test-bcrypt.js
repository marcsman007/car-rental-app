const bcrypt = require('bcryptjs');

const storedHash = "$2a$10$YOvfNSIGOZlH5DkZfts5p..yClh9auKXj7JrzulF07xJFoFjqIaH6";
const enteredPassword = "YourPlainPassword"; // replace with the password you used during registration

bcrypt.compare(enteredPassword, storedHash, (err, result) => {
  if (err) {
    console.error("Error comparing passwords:", err);
  } else {
    console.log("Password match?", result); // true if it matches, false if not
  }
});
