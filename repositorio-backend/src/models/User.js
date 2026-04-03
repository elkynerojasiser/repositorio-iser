import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function defineUser(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'role_id',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password') && user.password) {
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
          }
        },
      },
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {},
      },
    }
  );

  User.prototype.comparePassword = async function comparePassword(plain) {
    return bcrypt.compare(plain, this.password);
  };

  return User;
}
