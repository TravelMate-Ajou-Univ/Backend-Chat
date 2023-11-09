export class setInitDTO {
  nickname: string;
  room: {
    roomId: string;
    roomName: string;
  };
}

export class chatRoomListDTO {
  roomId: string;
  roomName: string;
  cheifId: string | null;
}
