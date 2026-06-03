process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.CREDENTIAL_ENCRYPTION_KEY ||= Buffer.alloc(32, 7).toString("base64");
