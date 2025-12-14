import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { AppealStatus } from "./AppealStatus";
import { Client } from "./Client";
import { Staff } from "./Staff";

// Объявление сущности (таблицы) "appeals" для хранения обращений
@Entity("appeals")
export class Appeal {
  // Автоматически генерируемый первичный ключ
  @PrimaryGeneratedColumn()
  id: number;

  // Тип механизма (ограничение 25 символов)
  @Column({ length: 25 })
  mechanism: string;

  // Описание проблемы (ограничение 256 символов)
  @Column({ length: 256 })
  problem: string;

  // ФИО клиента (ограничение 60 символов)
  @Column({ length: 60 })
  fio_client: string;

  // Связь многие-к-одному со статусом обращения
  // Один статус может быть у многих обращений
  @ManyToOne(() => AppealStatus, (status) => status.appeals)
  status: AppealStatus;

  // Дата начала обращения
  @Column()
  date_start: Date;

  // Дополнительное описание обращения (может быть null)
  @Column({ length: 256, nullable: true })
  appeal_desc: string;

  // Дата закрытия обращения (может быть null)
  @Column({ nullable: true })
  date_close: Date;

  // --- Связи с другими сущностями ---

  // Сотрудник, закрывший обращение (может быть null)
  // Связь с сущностью Staff через коллекцию closed_appeals
  @ManyToOne(() => Staff, (staff) => staff.closed_appeals, { nullable: true })
  fio_staff_close_id: Staff;

  // Сотрудник, открывший обращение (может быть null)
  // Связь с сущностью Staff через коллекцию opened_appeals
  @ManyToOne(() => Staff, (staff) => staff.opened_appeals, { nullable: true })
  fio_staff_open_id: Staff;

  // Клиент (компания), связанный с обращением (может быть null)
  // Связь с сущностью Client через коллекцию appeals
  @ManyToOne(() => Client, (client) => client.appeals, { nullable: true })
  company_name_id: Client;

  // ФИО сотрудника (дублирующее поле, 60 символов, может быть null)
  @Column({ length: 60, nullable: true })
  fio_staff: string;
}
