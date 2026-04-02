import { sequelize } from '../config/database.js';
import { defineRole } from './Role.js';
import { defineUser } from './User.js';
import { defineAcademicProgram } from './AcademicProgram.js';
import { defineThesisType } from './ThesisType.js';
import { defineResearchLine } from './ResearchLine.js';
import { defineKeyword } from './Keyword.js';
import { defineThesis } from './Thesis.js';
import { defineThesisKeyword } from './ThesisKeyword.js';

const Role = defineRole(sequelize);
const User = defineUser(sequelize);
const AcademicProgram = defineAcademicProgram(sequelize);
const ThesisType = defineThesisType(sequelize);
const ResearchLine = defineResearchLine(sequelize);
const Keyword = defineKeyword(sequelize);
const Thesis = defineThesis(sequelize);
const ThesisKeyword = defineThesisKeyword(sequelize);

Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

AcademicProgram.hasMany(Thesis, { foreignKey: 'program_id', as: 'theses' });
Thesis.belongsTo(AcademicProgram, { foreignKey: 'program_id', as: 'program' });

ThesisType.hasMany(Thesis, { foreignKey: 'type_id', as: 'theses' });
Thesis.belongsTo(ThesisType, { foreignKey: 'type_id', as: 'type' });

ResearchLine.hasMany(Thesis, { foreignKey: 'research_line_id', as: 'theses' });
Thesis.belongsTo(ResearchLine, { foreignKey: 'research_line_id', as: 'research_line' });

User.hasMany(Thesis, { foreignKey: 'user_id', as: 'theses' });
Thesis.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });

Thesis.belongsToMany(Keyword, {
  through: ThesisKeyword,
  foreignKey: 'thesis_id',
  otherKey: 'keyword_id',
  as: 'keywords',
});
Keyword.belongsToMany(Thesis, {
  through: ThesisKeyword,
  foreignKey: 'keyword_id',
  otherKey: 'thesis_id',
  as: 'theses',
});

export {
  sequelize,
  Role,
  User,
  AcademicProgram,
  ThesisType,
  ResearchLine,
  Keyword,
  Thesis,
  ThesisKeyword,
};
