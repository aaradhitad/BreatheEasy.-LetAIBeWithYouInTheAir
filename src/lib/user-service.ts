import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  healthConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  _id?: ObjectId;
  username: string;
  email: string;
  healthConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('breatheair');
    return db.collection('users');
  }

  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await this.getCollection();
    
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(user);
    user._id = result.insertedId;
    
    return user;
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  static async findUserByUsername(username: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ username });
  }

  static async findUserByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
  }

  static async updateUser(userId: ObjectId, updates: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: userId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteUser(userId: ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({ _id: userId });
    return result.deletedCount > 0;
  }

  static async getAllUsers(): Promise<UserWithoutPassword[]> {
    const collection = await this.getCollection();
    
    return collection.find(
      {}, 
      { projection: { password: 0 } }
    ).toArray();
  }
}
