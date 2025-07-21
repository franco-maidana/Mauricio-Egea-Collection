import bcrypt from 'bcrypt';
import * as userModel from '../models/user.model.js';

// Quitar campos sensibles del usuario antes de enviar al cliente
export function cleanUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

// Listar todos los usuarios
export async function listUsers() {
  const users = await userModel.getAllUsers();
  return users.map(cleanUser);
}

// Listar todos los usuarios paginados
export async function listUsersPaginated(page = 1, limit = 5) {
  const paged = await userModel.getAllUsersPaginated(page, limit);
  return {
    users: paged.users.map(cleanUser),
    total: paged.total
  };
}

// Buscar usuario por ID
export async function findUserById(id) {
  const user = await userModel.getUserById(id);
  return cleanUser(user);
}

// Buscar usuario por email
export async function findUserByEmail(email) {
  const user = await userModel.getUserByEmail(email);
  return cleanUser(user);
}

// Crear usuario (hashea el password)
export async function createUser({ name, last_name, email, password, avatar_url }) {
  const password_hash = await bcrypt.hash(password, 10);
  const userId = await userModel.createUser({ name, last_name, email, password_hash, avatar_url });
  return findUserById(userId);
}

// Actualizar usuario (solo los campos no vacíos)
export async function updateUser(id, data) {
  // Si viene password y no está vacío, hasheamos
  if (data.password && data.password.trim() !== "") {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  // Llama a updateUser del modelo, que ya filtra campos no vacíos
  const affected = await userModel.updateUser(id, data);
  if (!affected) return null;
  return findUserById(id);
}

// Eliminar usuario
export async function deleteUser(id) {
  return userModel.deleteUser(id);
}

export async function findUserByEmailWithHash(email) {
  return await userModel.getUserByEmail(email);
}

// Buscar usuario por Google ID
export async function findUserByGoogleId(googleId) {
  const user = await userModel.getUserByGoogleId(googleId);
  return cleanUser(user);
}

// Crear usuario (con o sin password, adaptable para Google)
export async function createUserGoogle({ name, last_name, email, avatar_url, google_id }) {
  const userId = await userModel.createUserGoogle({ name, last_name, email, avatar_url, google_id });
  return findUserById(userId);
}

export async function updateUserGoogle(id, data) {
  // Solo permite actualizar el campo google_id (y avatar si querés)
  const affected = await userModel.updateUserGoogle(id, data);
  if (!affected) return null;
  return findUserById(id);
}

// ...
export async function unlinkGoogleAccount(userId) {
  return userModel.unlinkGoogleAccount(userId);
}