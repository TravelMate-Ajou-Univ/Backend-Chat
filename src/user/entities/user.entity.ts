export class UserEntity {
  id: number;
  nickname: string | null;
  provider: string;
  providerId: string;
  profileImageId: number | null;
  createdAt: Date;
  updatedAt: Date;
  profileImageUrl: string | null;
}
