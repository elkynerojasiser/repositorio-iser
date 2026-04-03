import { DataTypes } from 'sequelize';

export function defineThesisChunk(sequelize) {
  return sequelize.define(
    'ThesisChunk',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      thesisId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'thesis_id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      embedding: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reservado para embeddings (JSON o texto); búsqueda vectorial futura',
      },
    },
    {
      tableName: 'thesis_chunks',
    }
  );
}
