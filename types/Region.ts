export interface Region {
  id: string;
  name: string;
  provinces: Province[];
}

export interface Province {
  id: string;
  name: string;
  chatrooms: Chatroom[];
}

export interface Chatroom {
  id: string;
  name: string;
}
