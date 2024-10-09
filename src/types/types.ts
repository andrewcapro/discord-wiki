import { ObjectId } from "mongodb";

export interface Post {
  _id: ObjectId;
  postTitle: string;
  author: string;
  sections: Array<{ title: string; body: string; imageURL: string }>;
  details: Array<{ title: string; body: string }>;
  imageURL: string;
  createdDate: Date;
  modifiedAuthor: string;
  modifiedDate: Date;
}
