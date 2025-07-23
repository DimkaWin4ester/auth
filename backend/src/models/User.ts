import bcrypt from 'bcryptjs';
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IUser, IUserResponse } from '../types';

interface UserCreationAttributes extends Optional<IUser, 'id' | 'createdAt'> {}

export class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: number;
  public email!: string;
  public password!: string;
  public createdAt!: Date;

  public static async createUser(email: string, password: string): Promise<User> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return await User.create({
      email,
      password: hashedPassword,
    });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  public static async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public async updatePassword(newPassword: string): Promise<User> {
    this.password = await bcrypt.hash(newPassword, 12);
    return await this.save();
  }

  public override toJSON(): IUserResponse {
    const { password, ...userData } = this.get();
    return userData as IUserResponse;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: false,
    scopes: {
      withoutUsername: {
        attributes: { exclude: ['username'] },
      },
    },
  },
);
