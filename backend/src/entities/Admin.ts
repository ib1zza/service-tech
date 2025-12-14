import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Role } from "./Role";

// Объявление сущности (таблицы) "admins" в базе данных
@Entity("admins")
export class Admin {
  // Автоматически генерируемый первичный ключ
  @PrimaryGeneratedColumn()
  id: number;

  // Логин администратора с ограничением длины (макс. 10 символов)
  @Column({ length: 10 })
  login_admin: string;

  // Пароль администратора (без ограничения длины)
  @Column()
  password: string;
  // Ограничение длины - 10 символов
  @Column({ length: 10 })
  password_plain: string;

  // ФИО администратора (макс. 60 символов)
  @Column({ length: 60 })
  fio_admin: string;

  // Номер телефона (макс. 12 символов)
  @Column({ length: 12 })
  phone_number_admin: string;

  // ID Telegram (может быть null, макс. 200 символов)
  @Column({ length: 200, nullable: true })
  telegram_id: string;

  // Связь многие-к-одному с сущностью Role
  // Один Role может быть у многих Admin
  @ManyToOne(() => Role, (role) => role.admins)
  role: Role;
}
