import * as userService from "../service/user.service.js";

// 1. POST /users
export async function createUser(req, res, next) {
  try {
    let avatar_url = null;
    if (req.file && req.file.path) {
      avatar_url = req.file.path; // Cloudinary devuelve el URL en .path
    }
    const userData = { ...req.body, avatar_url };
    const user = await userService.createUser(userData);
    if (user) {
      res.status(201).json({
          ok: true,
          message: "Usuario creado correctamente",
          data: user,
        });
    } else {
      res
        .status(400).json({
          ok: false,
          message: "No se pudo crear el usuario" 
      });
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ 
        ok: false, 
        message: "Email ya registrado" 
    });
    }
    next(err);
  }
}

// 2. GET /users
export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const { users, total } = await userService.listUsersPaginated(page, limit);

    const totalPages = Math.ceil(total / limit);

    if (users && users.length > 0) {
      res.status(200).json({
        ok: true,
        message: 'Usuarios encontrados',
        data: users,
        pagination: {
          page,
          perPage: limit,
          total,
          totalPages
        }
      });
    } else {
      res.status(404).json({ 
        ok: false, 
        message: 'No se encontraron usuarios' 
      });
    }
  } catch (err) {
    next(err);
  }
}

// 2. GET /users/:id
export async function getUserById(req, res, next) {
  try {
    const user = await userService.findUserById(req.params.id);
    if (user) {
      res.status(200).json({ 
        ok: true, 
        message: "Usuario encontrado", 
        data: user 
      });
    } else {
      res.status(404).json({ 
        ok: false, 
        message: "Usuario no encontrado" 
      });
    }
  } catch (err) {
    next(err);
  }
}

// 2. GET /users/email/:email
export async function getUserByEmail(req, res, next) {
  try {
    const user = await userService.findUserByEmail(req.params.email);
    if (user) {
      res.status(200).json({ 
        ok: true, 
        message: "Usuario encontrado", 
        data: user 
      });
    } else {
      res.status(404).json({ 
        ok: false, 
        message: "Usuario no encontrado" 
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. PUT /users/:id
export async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (user) {
      res.status(200).json({
          ok: true,
          message: "Usuario actualizado correctamente",
          data: user,
        });
    } else {
      res.status(404).json({ 
        ok: false, 
        message: "Usuario no encontrado o sin cambios" 
      });
    }
  } catch (err) {
    next(err);
  }
}

// 4. DELETE /users/:id
export async function deleteUser(req, res, next) {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (deleted) {
      res.status(200).json({ 
        ok: true, 
        message: "Usuario eliminado correctamente" 
      });
    } else {
      res.status(404).json({ 
        ok: false, 
        message: "Usuario no encontrado" 
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function unlinkGoogle(req, res) {
  // Suponiendo que usás req.user.id desde la sesión:
  try {
    const userId = req.user.id;
    const affected = await userService.unlinkGoogleAccount(userId);
    if (affected) {
      res.json({ ok: true, message: "Cuenta de Google desvinculada." });
    } else {
      res.status(404).json({ ok: false, error: "Usuario no encontrado o ya estaba desvinculado." });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error al desvincular Google" });
  }
}