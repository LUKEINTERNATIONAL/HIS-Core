import { Role } from "@/interfaces/role";
import { Service } from "./service";

export class UserService extends Service {
	constructor() {
		super()
	}
	static isAdmin() {
    const roles = super.getUserRoles().filter(
        (role: Role) => {
          return role.role.match(/super|admin/i);
        }
      );
      return roles.length > 0;
	}
  static isNurse() {
    const roles = super.getUserRoles().filter(
        (role: Role) => {
          return role.role.match(/Nurse/i);
        }
      );
      return roles.length > 0;
	}

  static getUsers() {
    return super.getJson('users', { role: 'Superuser' })
  }
}
