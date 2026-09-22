import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISEOFields {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuredImage: string;
  imageAlt: string;
  category: string;
  keywords: string[];
  tags: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: "draft" | "published";
  seo: ISEOFields;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  imageAlt: string;
  category: string;
  keywords: string[];
  tags: string[];
  author: string;
  content: string;
  status: "draft" | "published";
  seo: ISEOFields;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGallery extends Document {
  title: string;
  image: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  imageAlt: string;
  category: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: "project" | "blog" | "gallery";
  createdAt: Date;
  updatedAt: Date;
}

export interface ISEOPageSettings extends Document {
  page: string;
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
  updatedAt: Date;
}

const seoSubSchema = new Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  canonical: { type: String, default: "" },
  ogTitle: { type: String, default: "" },
  ogDescription: { type: String, default: "" },
  ogImage: { type: String, default: "" },
  robots: { type: String, default: "index, follow" },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
}, { timestamps: true });

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String, required: true },
  imageAlt: { type: String, required: true },
  category: { type: String, required: true, index: true },
  keywords: [String],
  tags: [String],
  techStack: [String],
  liveUrl: { type: String },
  githubUrl: { type: String },
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  seo: { type: seoSubSchema, default: () => ({}) },
  publishedAt: { type: Date },
}, { timestamps: true });

const BlogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  excerpt: { type: String, required: true },
  featuredImage: { type: String, required: true },
  imageAlt: { type: String, required: true },
  category: { type: String, required: true, index: true },
  keywords: [String],
  tags: [String],
  author: { type: String, default: "Avdhesh Kumar" },
  content: { type: String, required: true },
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  seo: { type: seoSubSchema, default: () => ({}) },
  publishedAt: { type: Date },
}, { timestamps: true });

const GallerySchema = new Schema<IGallery>({
  title: { type: String, required: true },
  image: { type: String, required: true },
  public_id: { type: String },
  width: { type: Number },
  height: { type: Number },
  format: { type: String },
  imageAlt: { type: String, required: true },
  category: { type: String, required: true, index: true },
  status: { type: String, enum: ["draft", "published"], default: "published", index: true },
}, { timestamps: true });

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, lowercase: true },
  type: { type: String, enum: ["project", "blog", "gallery"], required: true, index: true },
}, { timestamps: true });

CategorySchema.index({ slug: 1, type: 1 }, { unique: true });

const SEOPageSettingsSchema = new Schema<ISEOPageSettings>({
  page: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  canonical: { type: String },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  robots: { type: String, default: "index, follow" },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Project = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
export const Gallery = mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export const SEOPageSettings = mongoose.models.SEOPageSettings || mongoose.model<ISEOPageSettings>("SEOPageSettings", SEOPageSettingsSchema);
