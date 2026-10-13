import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Connection string is not defind");
}

if (!process.env.Google_Client_Id) {
  throw new Error(
    "Google_Client_Id is not defined in the environment variables.",
  );
}
if (!process.env.Google_Client_Secret) {
  throw new Error(
    "Google_Client_Secret is not defined in the environment variables.",
  );
}
if (!process.env.Google_Refresh_Token) {
  throw new Error(
    "Google_Refresh_Token is not defined in the environment variables.",
  );
}
if (!process.env.Google_User) {
  throw new Error("Google_User is not defined in the environment variables.");
}
if (!process.env.JWT_SECRET) {
  throw new Error("jwt secret key is not define");
}
if (!process.env.PORT) {
  throw new Error("jwt secret key is not define");
}
let config = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  googleClientId: process.env.Google_Client_Id,
  googleClientSecret: process.env.Google_Client_Secret,
  googleRefreshToken: process.env.Google_Refresh_Token,
  googleUser: process.env.Google_User,
  jwtsecret: process.env.JWT_SECRET,
};

export default config;
