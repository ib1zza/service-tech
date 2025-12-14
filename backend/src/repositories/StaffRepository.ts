import { DataSource, Repository } from "typeorm";
import { Staff } from "../entities/Staff";
import { Role } from "../entities/Role";

export class StaffRepository extends Repository<Staff> {
  constructor(private dataSource: DataSource) {
    super(Staff, dataSource.createEntityManager());
  }

  // Поиск сотрудника по логину с загрузкой роли
  async findByLogin(login: string): Promise<Staff | null> {
    return this.findOne({ where: { login_staff: login }, relations: ["role"] });
  }

  // Поиск сотрудника по ID с загрузкой роли
  async findByIdWithRole(id: number): Promise<Staff | null> {
    return this.findOne({ where: { id }, relations: ["role"] });
  }

  // Создание нового сотрудника
  async createStaff(
    login: string,
    password: string,
    plainPassword: string,
    fio: string,
    role: Role
  ): Promise<Staff> {
    const staff = this.create({
      login_staff: login,
      password,
      password_plain: plainPassword,
      fio_staff: fio,
      role,
    });
    return this.save(staff);
  }

  // Получение всех сотрудников с их обращениями
  async getStaffWithAppeals(): Promise<Staff[]> {
    return this.find({
      relations: ["opened_appeals", "closed_appeals"],
    });
  }

  // Удаление сотрудника по ID
  async removeStaff(staffId: number): Promise<void> {
    await this.delete(staffId);
  }

  // Редактирование данных сотрудника
  async editStaff(
    staffId: number,
    fio?: string,
    login?: string,
    password?: string
  ): Promise<void> {
    const updatedData: Record<string, string> = {};
    if (fio) updatedData["fio_staff"] = fio;
    if (login) updatedData["login_staff"] = login;
    if (password) updatedData["password"] = password;
    await this.update(staffId, updatedData);
  }
}
