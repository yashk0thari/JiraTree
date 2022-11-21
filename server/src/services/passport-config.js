const local_strategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initalize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        //return a user by email or null
        console.log(email)
        const user = await getUserByEmail(email)

        if (user == null) {
            return done(null, false, {message: "No user with that email"})
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                //actually have an authenticated user
                return done(null, user)
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
    }, authenticateUser), 
    );

    //format: done(error, user-data)

    passport.serializeUser((user, done) => {
        done(null,user.user_uid)
    })

    passport.deserializeUser(async (id, done) => {
        return done(null, await getUserById(id))
    })
}

module.exports = initalize;