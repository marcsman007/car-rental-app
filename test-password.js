const bcrypt = require('bcryptjs');

// Replace this with the password you want to test
const plainPassword = "MySecret123";

(async () => {
  // Generate hash
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed password:", hash);

  // Test password against the hash
  const isMatch = await bcrypt.compare(plainPassword, hash);
  console.log("Password match?", isMatch);
})();
