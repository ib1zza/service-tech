import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Role } from "./Role";
import { Appeal } from "./Appeal";

// Сущность для таблицы сотрудников
@Entity("staffs")
export class Staff {
  // Автоинкрементный ID сотрудника
  @PrimaryGeneratedColumn()
  id: number;

  // Логин сотрудника (макс. 10 символов)
  @Column({ length: 10 })
  login_staff: string;

  // Хэш пароля
  @Column()
  password: string;

  // Пароль в открытом виде (не рекомендуется)
  @Column({ length: 10 })
  password_plain: string;

  // ФИО сотрудника (макс. 60 символов)
  @Column({ length: 60 })
  fio_staff: string;

  // Связь с ролью (многие сотрудники к одной роли)
  @ManyToOne(() => Role, (role) => role.staffs)
  role: Role;

  // Связь с заявками, которые сотрудник открыл
  @OneToMany(() => Appeal, (appeal) => appeal.fio_staff_open_id)
  opened_appeals: Appeal[];

  // Связь с заявками, которые сотрудник закрыл
  @OneToMany(() => Appeal, (appeal) => appeal.fio_staff_close_id)
  closed_appeals: Appeal[];
}
