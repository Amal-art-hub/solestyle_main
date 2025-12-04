const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        // 2️⃣ Check if a user exists with the same email
        const email = profile.emails[0].value;
        let existingEmailUser = await User.findOne({ email });

        if (existingEmailUser) {
          // Attach googleId if email already exists
          existingEmailUser.googleId = profile.id;
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        // 3️⃣ Create new user
        const newUser = new User({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          isVerified: true,
        });

        await newUser.save();
        return done(null, newUser);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});
