import SpecialityDetailClient from "./SpecialityDetailClient";
import { fetchSpecialitySlugsForExport } from "@/utils/staticParams";

export async function generateStaticParams() {
  return fetchSpecialitySlugsForExport();
}

export default function DynamicSpecialityPage() {
  return <SpecialityDetailClient />;
}
