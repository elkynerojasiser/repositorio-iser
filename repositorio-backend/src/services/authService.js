import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, Role } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../utils/constants.js';

function signToken(userId, roleName) {
  return jwt.sign({ sub: userId, role: roleName }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export async function register({ name, email, password }) {
  const publicRole = await Role.findOne({ where: { name: ROLES.PUBLIC } });
  if (!publicRole) {
    throw new AppError('Rol público no configurado. Ejecute el seed de la base de datos.', 500);
  }
  const user = await User.create({
    name,
    email,
    password,
    roleId: publicRole.id,
    status: 'active',
  });
  const safe = await User.findByPk(user.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
  const token = signToken(user.id, ROLES.PUBLIC);
  return { user: safe.get({ plain: true }), token };
}

export async function login({ email, password }) {
  const user = await User.scope('withPassword').findOne({
    where: { email },
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
  });
  if (!user || user.status !== 'active') {
    throw new AppError('Credenciales inválidas.', 401);
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new AppError('Credenciales inválidas.', 401);
  }
  const roleName = user.role?.name || ROLES.PUBLIC;
  const token = signToken(user.id, roleName);
  const json = user.get({ plain: true });
  delete json.password;
  return { user: json, token };
}
