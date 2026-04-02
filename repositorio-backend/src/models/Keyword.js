import { DataTypes } from 'sequelize';

export function defineKeyword(sequelize) {
  return sequelize.define(
    'Keyword',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'keywords',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}
