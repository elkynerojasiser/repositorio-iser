import { AppError } from '../utils/AppError.js';

/**
 * CRUD genérico para entidades de clasificación (nombre único).
 * @param {import('sequelize').ModelCtor} Model
 * @param {string} notFoundLabel
 */
export function buildClassificationService(Model, notFoundLabel) {
  return {
    async list() {
      return Model.findAll({ order: [['name', 'ASC']] });
    },

    async getById(id) {
      const row = await Model.findByPk(id);
      if (!row) {
        throw new AppError(`${notFoundLabel} no encontrado.`, 404);
      }
      return row;
    },

    async create({ name }) {
      return Model.create({ name: name.trim() });
    },

    async update(id, { name }) {
      const row = await Model.findByPk(id);
      if (!row) {
        throw new AppError(`${notFoundLabel} no encontrado.`, 404);
      }
      if (name !== undefined) {
        row.name = name.trim();
      }
      await row.save();
      return row;
    },

    async remove(id) {
      const row = await Model.findByPk(id);
      if (!row) {
        throw new AppError(`${notFoundLabel} no encontrado.`, 404);
      }
      await row.destroy();
    },
  };
}
