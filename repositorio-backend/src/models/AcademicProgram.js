import { DataTypes } from 'sequelize';

export function defineAcademicProgram(sequelize) {
  return sequelize.define(
    'AcademicProgram',
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
      tableName: 'academic_programs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}
