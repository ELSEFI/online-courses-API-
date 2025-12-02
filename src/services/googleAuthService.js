const { OAuth2Client } = require("google-auth-library");
try {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  exports.verifyGoogleToken = async (token) => {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      name: payload.name,
      email: payload.email,
      profileImage: payload.picture,
      googleId: payload.sub,
    };
  };
} catch (error) {
  console.error(error);
  throw new Error("Invalid or Expired Google Token");
}
