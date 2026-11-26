import BlogDetailClient from "./BlogDetailClient";
import { fetchBlogSlugsForExport } from "@/utils/staticParams";

export async function generateStaticParams() {
  return fetchBlogSlugsForExport();
}

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}
