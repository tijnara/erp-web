// Script to hash a password for inserting into the database
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'j1138';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('\n=== Password Hash ===');
  console.log('Original password:', password);
  console.log('Hashed password:', hash);
  console.log('\n=== SQL Update Query ===');
  console.log(`UPDATE users SET user_password = '${hash}' WHERE user_email = 'aranjitarchita@gmail.com';`);
  console.log('\nCopy the hashed password above and update it in Supabase Dashboard.');
});

