import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json(users);
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});

export const create = asyncHandler(async (req, res) => {
  await userService.assertRoleExists(req.body.roleId);
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const update = asyncHandler(async (req, res) => {
  if (req.body.roleId != null) {
    await userService.assertRoleExists(req.body.roleId);
  }
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  res.status(204).send();
});
