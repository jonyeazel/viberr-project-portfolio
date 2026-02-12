import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("billing-workflow");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
