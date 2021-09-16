import { Role } from "@/interfaces/role";
import { Service } from "./service";

export class UserService extends Service {
	constructor() {
		super()
	}
  
  static createUser(data: Record<string, any>) {
    return this.postJson(`users`, data)
  }

  static updateUser(id: number, data: Record<string, any>) {
    return this.putJson(`users/${id}`, data)
  }

  static activateUser(id: number) {
    return this.postJson(`users/${id}/activate`, {})
  }
  
  static deactivateUser(id: number) {
    return this.postJson(`users/${id}/deactivate`, {})
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

  static getAllUsers() {
    return this.getJson('users', { 'page_size': 100})
  }

  static getAllRoles() {
    return this.getJson('roles', { 'page_size': 100 })
  }

  static getUsers() {
    return super.getJson('users', { role: 'Superuser' })
  }
}
