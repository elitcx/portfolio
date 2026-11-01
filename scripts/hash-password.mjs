// Prints the value for the ADMIN_PASSWORD_HASH environment variable.
// The password comes from a prompt, not an argument, so it stays out of shell
// history. Paste the printed hash into Vercel, never the password.
//
// Run with: npm run admin:hash
import { createInterface } from 'node:readline/promises';

import { hashPassword } from '../api/_lib/password.js';

const MIN_LENGTH = 16;

const prompt = createInterface({ input: process.stdin, output: process.stderr });
const password = await prompt.question(`Password (at least ${MIN_LENGTH} characters): `);
prompt.close();

if (password.length < MIN_LENGTH) {
  console.error(`Too short. Use a long random password from a password manager.`);
  process.exit(1);
}

console.log(await hashPassword(password));
