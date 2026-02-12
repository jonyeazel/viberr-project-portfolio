import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("compliance");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
