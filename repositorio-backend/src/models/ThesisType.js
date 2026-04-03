import { DataTypes } from 'sequelize';

export function defineThesisType(sequelize) {
  return sequelize.define(
    'ThesisType',
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
      tableName: 'thesis_types',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}
