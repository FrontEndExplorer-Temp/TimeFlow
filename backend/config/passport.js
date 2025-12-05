import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/userModel.js';

// Web Strategy
console.log('Google Web Strategy Config:', { clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing', clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing' });
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        'google-web',
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/users/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        isVerified: true,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
}

// Android Strategy
if (process.env.GOOGLE_ANDROID_CLIENT_ID && process.env.GOOGLE_ANDROID_CLIENT_SECRET) {
    passport.use(
        'google-android',
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_ANDROID_CLIENT_ID,
                clientSecret: process.env.GOOGLE_ANDROID_CLIENT_SECRET,
                callbackURL: '/api/users/auth/google/android/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        isVerified: true,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: '/api/users/auth/github/callback',
                scope: ['user:email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                    if (!email) {
                        return done(new Error("No email found in GitHub profile"), null);
                    }

                    let user = await User.findOne({ email: email });

                    if (user) {
                        if (!user.githubId) {
                            user.githubId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    user = await User.create({
                        name: profile.displayName || profile.username,
                        email: email,
                        githubId: profile.id,
                        isVerified: true,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
} else {
    console.warn('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing. GitHub OAuth disabled.');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;