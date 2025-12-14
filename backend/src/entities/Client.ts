import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Role } from "./Role";
import { Appeal } from "./Appeal";

// Сущность для таблицы клиентов
@Entity("clients")
export class Client {
  // Уникальный идентификатор
  @PrimaryGeneratedColumn()
  id: number;

  // Логин клиента (макс. 10 символов)
  @Column({ length: 10 })
  login_client: string;

  // Хэш пароля
  @Column()
  password_hash: string;

  // Пароль в открытом виде (небезопасно)
  @Column({ length: 10 })
  password_plain: string;

  // Номер телефона (макс. 12 символов)
  @Column({ length: 12 })
  phone_number_client: string;

  // Название компании (макс. 50 символов)
  @Column({ length: 50 })
  company_name: string;

  // ID в Telegram (необязательное поле)
  @Column({ length: 200, nullable: true })
  telegram_id: string;

  // Связь с ролью (многие клиенты к одной роли)
  @ManyToOne(() => Role, (role) => role.clients)
  role: Role;

  // Связь с обращениями (один клиент - много обращений)
  @OneToMany(() => Appeal, (appeal) => appeal.company_name_id)
  appeals: Appeal[];
}
