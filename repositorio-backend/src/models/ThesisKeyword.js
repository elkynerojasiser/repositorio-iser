import { DataTypes } from 'sequelize';

export function defineThesisKeyword(sequelize) {
  return sequelize.define(
    'ThesisKeyword',
    {
      thesisId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        field: 'thesis_id',
      },
      keywordId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        field: 'keyword_id',
      },
    },
    {
      tableName: 'thesis_keywords',
      timestamps: false,
    }
  );
}
