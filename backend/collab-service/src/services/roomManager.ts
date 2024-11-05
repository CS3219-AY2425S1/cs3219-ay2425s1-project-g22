import redis from "../redisClient";
import { randomUUID } from "crypto";
import { QuestionDetails } from "../types";
import Room from "../models/room";

class RoomManager {
  private roomIdToRoomsKey = 'roomIdToRooms';
  private usersToRoomsKey = 'usersToRooms';

  // Create a room with two users and question details
  public async createRoom(
    users: [string, string],
    question: QuestionDetails,
    language: string
  ): Promise<string> {
    // Check if any of the users are already in a room
    const user1Room = await redis.hget(this.usersToRoomsKey, users[0]);
    const user2Room = await redis.hget(this.usersToRoomsKey, users[1]);
    if (user1Room || user2Room) {
      throw new Error(`User ${user1Room ? users[0] : users[1]} is already in a room`);
    }

    const roomId = randomUUID();
    const room = new Room(users, question, language);

    await redis.hset(this.roomIdToRoomsKey, roomId, JSON.stringify(room));
    await redis.hset(this.usersToRoomsKey, users[0], roomId);
    await redis.hset(this.usersToRoomsKey, users[1], roomId);

    console.log('Room created:', roomId);

    return roomId;
  }

  // Remove a room by roomId
  public async removeRoom(roomId: string): Promise<void> {
    const roomData = await redis.hget(this.roomIdToRoomsKey, roomId);
    if (!roomData) {
      console.log('Room does not exist');
      return;
    } 

    const room: Room = JSON.parse(roomData);
    for (const user of room.users) {
      await redis.hdel(this.usersToRoomsKey, user);
    }
    await redis.hdel(this.roomIdToRoomsKey, roomId);
  }

  // Get the other user in the room
  public async getOtherUser(username: string): Promise<string> {
    const roomId = await redis.hget(this.usersToRoomsKey, username);
    if (!roomId) {
      throw new Error('User not in a room');
    }

    const roomData = await redis.hget(this.roomIdToRoomsKey, roomId);
    if (!roomData) {
      throw new Error('Room does not exist');
    }

    const room: Room = JSON.parse(roomData);
    if (room.users[0] === username) {
      return room.users[1];
    } else if (room.users[1] === username) {
      return room.users[0];
    } else {
      throw new Error('User not in the room');
    }
  }

  // Update the code in the room
  public async updateCode(roomId: string, code: string): Promise<void> {
    const roomData = await redis.hget(this.roomIdToRoomsKey, roomId);
    if (!roomData) {
      throw new Error('Room does not exist');
    }

    const room: Room = JSON.parse(roomData);
    room.code = code;
    await redis.hset(this.roomIdToRoomsKey, roomId, JSON.stringify(room));
  }

  // Get roomId from username
  public async getRoomId(username: string): Promise<string | null> {
    return await redis.hget(this.usersToRoomsKey, username);
  }

  // Get room details by roomId
  public async getRoom(roomId: string): Promise<Room | null> {
    const roomData = await redis.hget(this.roomIdToRoomsKey, roomId);
    if (!roomData) {
      return null;
    }

    return JSON.parse(roomData);
  }
}

export const roomManager = new RoomManager();