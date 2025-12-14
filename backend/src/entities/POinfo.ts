import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Сущность для таблицы POinfo (вероятно, справочная информация)
@Entity("POinfo")
export class POinfo {
  // Автоинкрементный идентификатор
  @PrimaryGeneratedColumn()
  id: number;

  // Текстовая информация (макс. 255 символов)
  @Column({ length: 255 })
  TextInfo: string;
}
