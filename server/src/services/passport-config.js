const local_strategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initalize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        //return a user by email or null
        const user = getUserByEmail(email)

        if (user == null) {
            return done(null, false, {message: "No user with that email"})
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                //actually have an authenticated user
            } else {
                //password is incorrect
                return done(null, false, {message: 'Incorrect Password!'})
            }
        } catch(e) {
            return done(e)
        }

    }

    passport.use(
        new local_strategy({
        usernameField: 'email'
        //defaults the password
    }), authenticateUser
    );

    //stores the current session of the user
    passport.serializeUser((user, done) => {

    })

    //removes the user from its current session
    passport.deserializeUser((id, done) => {

    })
}

modules.export = initalize;