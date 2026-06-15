import { DataTypes } from 'sequelize';

export function defineThesis(sequelize) {
  return sequelize.define(
    'Thesis',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      abstract: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      year: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      programId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'program_id',
      },
      typeId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'type_id',
      },
      researchLineId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'research_line_id',
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path',
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
    },
    {
      tableName: 'thesis',
    }
  );
}
