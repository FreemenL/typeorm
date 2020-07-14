import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from "typeorm";

export default class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn({comment:"更新时间"})
  updated_time: Date;

  @CreateDateColumn({comment:"创建时间"})
  createdDate: Date;
}
