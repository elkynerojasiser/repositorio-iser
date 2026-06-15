import { DataTypes } from 'sequelize';

export function defineResearchLine(sequelize) {
  return sequelize.define(
    'ResearchLine',
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
      tableName: 'research_lines',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}
