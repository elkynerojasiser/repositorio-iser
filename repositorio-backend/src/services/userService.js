import { User, Role } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../utils/constants.js';

const includeRole = { model: Role, as: 'role', attributes: ['id', 'name'] };

export async function listUsers() {
  return User.findAll({
    include: [includeRole],
    order: [['id', 'ASC']],
  });
}

export async function getUserById(id) {
  const user = await User.findByPk(id, { include: [includeRole] });
  if (!user) throw new AppError('Usuario no encontrado.', 404);
  return user;
}

export async function createUser(data) {
  const { name, email, password, roleId, status = 'active' } = data;
  return User.create({ name, email, password, roleId, status });
}

export async function updateUser(id, data) {
  const user = await User.scope('withPassword').findByPk(id);
  if (!user) throw new AppError('Usuario no encontrado.', 404);
  const { name, email, password, roleId, status } = data;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password !== undefined && password !== '') user.password = password;
  if (roleId !== undefined) user.roleId = roleId;
  if (status !== undefined) user.status = status;
  await user.save();
  return User.findByPk(id, { include: [includeRole] });
}

export async function deleteUser(id, actorId) {
  if (Number(id) === Number(actorId)) {
    throw new AppError('No puede eliminar su propio usuario.', 400);
  }
  const user = await User.findByPk(id);
  if (!user) throw new AppError('Usuario no encontrado.', 404);
  await user.destroy();
}

export async function assertRoleExists(roleId) {
  const role = await Role.findByPk(roleId);
  if (!role) throw new AppError('Rol inválido.', 400);
}
