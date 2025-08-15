import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: string | ObjectId;
  username: string;
  email: string;
  password: string;
  healthConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  _id?: string | ObjectId;
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

  // Helper function to convert MongoDB document to plain object
  private static toPlainObject(doc: any): any {
    if (!doc) return null;
    
    return {
      _id: doc._id?.toString() || doc._id,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      healthConditions: doc.healthConditions,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,

    };
  }

  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await this.getCollection();
    
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(user);
    const createdUser: User = {
      ...user,
      _id: result.insertedId
    };
    
    return this.toPlainObject(createdUser);
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return user ? this.toPlainObject(user) : null;
  }

  static async findUserByUsername(username: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ username });
    return user ? this.toPlainObject(user) : null;
  }

  static async findUserByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    return user ? this.toPlainObject(user) : null;
  }

  static async updateUser(userId: string | ObjectId, updates: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteUser(userId: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async getAllUsers(): Promise<UserWithoutPassword[]> {
    const collection = await this.getCollection();
    
    const users = await collection.find(
      {}, 
      { projection: { password: 0 } }
    ).toArray();
    
    return users.map(user => this.toPlainObject(user));
  }


}
