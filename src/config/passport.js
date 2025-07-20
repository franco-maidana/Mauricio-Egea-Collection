// src/config/passport.js
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import * as userService from '../service/user.service.js';

// Estrategia local: login con email y password
passport.use(new LocalStrategy(
  {
    usernameField: 'email',    // Cambia "username" por "email"
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Buscamos el usuario incluyendo el hash
      const user = await userService.findUserByEmailWithHash(email);
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      // Comparamos la contraseña
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      // Quitamos el hash para no exponerlo en la sesión
      const { password_hash, ...userWithoutHash } = user;
      return done(null, userWithoutHash);
    } catch (err) {
      return done(err);
    }
  }
));

// Serializa el usuario: guarda solo el ID en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializa el usuario: obtiene usuario desde el ID de la sesión
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
