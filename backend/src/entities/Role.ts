import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Admin } from "./Admin";
import { Client } from "./Client";
import { Staff } from "./Staff";

// Сущность для таблицы ролей пользователей
@Entity("roles")
export class Role {
  // Уникальный идентификатор роли
  @PrimaryGeneratedColumn()
  id: number;

  // Название роли (макс. 6 символов): 'admin', 'staff', 'client'
  @Column({ length: 6 })
  role: string;

  // Связь один-ко-многим с администраторами
  @OneToMany(() => Admin, (admin) => admin.role)
  admins: Admin[];

  // Связь один-ко-многим с клиентами
  @OneToMany(() => Client, (client) => client.role)
  clients: Client[];

  // Связь один-ко-многим с персоналом
  @OneToMany(() => Staff, (staff) => staff.role)
  staffs: Staff[];
}
