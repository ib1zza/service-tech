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
    role: Role,
    phone_number_staff: string | null,
    email: string | null,
  ): Promise<Staff> {
    const staff = this.create({
      login_staff: login,
      password,
      password_plain: plainPassword,
      fio_staff: fio,
      role,
      phone_number_staff,
      email,
    } as any);
    return this.save(staff) as any;
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
    passwordHash?: string,
    passwordPlain?: string,
    phone_number_staff?: string | null,
    email?: string | null,
  ): Promise<void> {
    const updatedData: Record<string, string> = {};
    if (fio) updatedData["fio_staff"] = fio;
    if (login) updatedData["login_staff"] = login;
    if (passwordHash) updatedData["password"] = passwordHash;
    if (passwordPlain) updatedData["password_plain"] = passwordPlain;
    if (phone_number_staff)
      updatedData["phone_number_staff"] = phone_number_staff;
    if (email) updatedData["email"] = email;

    await this.update(staffId, updatedData);
  }

  // Поиск администратора по номеру телефона
  async getStaffByPhone(phone: string): Promise<Staff | null> {
    return this.findOne({
      where: { phone_number_staff: phone },
      relations: ["role"],
    });
  }
}
