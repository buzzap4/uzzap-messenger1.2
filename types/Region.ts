export interface Region {
  id: string;
  name: string;
  provinces: Province[];
}

export interface Province {
  id: string;
  name: string;
  chatrooms?: Chatroom[]; // Make chatrooms an array
}

export interface Chatroom {
  id: string;
  name: string;
}
