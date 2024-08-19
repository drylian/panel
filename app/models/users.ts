import { Model, DataTypes } from "denodb";

export default class User extends Model {
  static table = "users";
  static timestamps = true;

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
  };
}
