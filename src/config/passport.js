// src/config/passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import * as userService from "../service/user.service.js";

// =======================
// Estrategia Local (usuario y contraseña)
// =======================
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Campo usado para el usuario (email)
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Buscar usuario por email
        const user = await userService.findUserByEmailWithHash(email);
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        // Comparar contraseña
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        // Eliminar el hash antes de guardar en sesión
        const { password_hash, ...userWithoutHash } = user;
        return done(null, userWithoutHash);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// =======================
// Estrategia Google OAuth2
// =======================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // 👈 desde .env
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const debug = (...a) => {
          if (process.env.NODE_ENV !== "production") console.log(...a);
        };

        debug("===> Perfil recibido de Google:", profile);

        // 1) Buscar por google_id
        let user = await userService.findUserByGoogleId(profile.id);
        debug("¿Existe user por google_id?:", user);

        if (!user) {
          // 2) Buscar por email
          const email = profile.emails?.[0]?.value;
          user = await userService.findUserByEmail(email);
          debug("¿Existe user por email?:", user);

          if (user) {
            debug("Actualizando google_id del usuario existente...");
            await userService.updateUserGoogle(user.id, { google_id: profile.id });
            user = await userService.findUserById(user.id);
          } else {
            debug("Creando usuario nuevo por Google...");
            user = await userService.createUserGoogle({
              name: profile.name.givenName,
              last_name: profile.name.familyName,
              email,
              avatar_url: profile.photos?.[0]?.value,
              google_id: profile.id,
            });
          }
        }

        debug("Usuario retornado a Passport:", user);
        return done(null, user);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error en GoogleStrategy:", err);
        }
        return done(err, null);
      }
    }
  )
);

// =======================
// Serialización y deserialización de usuario
// =======================
// Guarda el ID en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Recupera el usuario por ID al recibir una petición
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findUserById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
