import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Address } from './entities/address.entity';
import { AppealMessage } from './entities/appeal-message.entity';
import { Appeal } from './entities/appeal.entity';
import { BannedItem } from './entities/banned-item.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { HomeStat } from './entities/home-stat.entity';
import { Notification } from './entities/notification.entity';
import { ParcelStatusHistory } from './entities/parcel-status-history.entity';
import { Parcel } from './entities/parcel.entity';
import { Post } from './entities/post.entity';
import { ShipmentRequest } from './entities/shipment-request.entity';
import { SitePage } from './entities/site-page.entity';
import { SupportInfo } from './entities/support-info.entity';
import { UserAddress } from './entities/user-address.entity';
import { User } from './entities/user.entity';

config();

export const entities = [
  User,
  Parcel,
  Address,
  BannedItem,
  SupportInfo,
  Post,
  SitePage,
  HomeStat,
  ParcelStatusHistory,
  UserAddress,
  ShipmentRequest,
  Appeal,
  AppealMessage,
  DocumentRequest,
  Notification,
];

export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'parcel_bot',
    password: process.env.POSTGRES_PASSWORD ?? 'change_me',
    database: process.env.POSTGRES_DB ?? 'parcel_bot',
    entities,
    migrations: [`${__dirname}/migrations/*.{ts,js}`],
    synchronize: false,
    logging: false,
  };
}

const AppDataSource = new DataSource(buildDataSourceOptions());

export default AppDataSource;
