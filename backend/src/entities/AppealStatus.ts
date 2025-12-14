import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Appeal } from "./Appeal";

// Объявление сущности (таблицы) "appeal_status" для хранения статусов обращений
@Entity("appeal_status")
export class AppealStatus {
  // Автоматически генерируемый первичный ключ
  @PrimaryGeneratedColumn()
  id: number;

  // Название статуса (ограничение 15 символов)
  // Примеры значений: 'new', 'in_progress', 'ready', 'cancel'
  @Column({ length: 15 })
  st: string;

  // Связь один-ко-многим с сущностью Appeal
  // Один статус может быть у многих обращений
  @OneToMany(() => Appeal, (appeal) => appeal.status)
  appeals: Appeal[];
}
