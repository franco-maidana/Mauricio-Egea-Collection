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
      callbackURL: "http://localhost:8080/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("===> Perfil recibido de Google:", profile);

        // 1. Buscar por google_id
        let user = await userService.findUserByGoogleId(profile.id);
        console.log("¿Existe user por google_id?:", user);

        if (!user) {
          // 2. Si no existe, buscar por email
          user = await userService.findUserByEmail(profile.emails?.[0]?.value);
          console.log("¿Existe user por email?:", user);

          if (user) {
            // 2a. Si existe por email, asociar google_id SOLO usando updateUserGoogle
            console.log(
              "Actualizando google_id del usuario existente SOLO con updateUserGoogle..."
            );
            await userService.updateUserGoogle(user.id, {
              google_id: profile.id,
            });
            // Volvemos a buscar el user actualizado
            user = await userService.findUserById(user.id);
          } else {
            // 3. Si no existe por email, crear nuevo usuario
            console.log("Creando usuario nuevo por Google...");
            user = await userService.createUserGoogle({
              name: profile.name.givenName,
              last_name: profile.name.familyName,
              email: profile.emails?.[0]?.value,
              avatar_url: profile.photos?.[0]?.value,
              google_id: profile.id,
            });
          }
        }

        // Confirmamos el user final
        console.log("Usuario retornado a Passport:", user);

        return done(null, user);
      } catch (err) {
        console.error("Error en GoogleStrategy:", err);
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
