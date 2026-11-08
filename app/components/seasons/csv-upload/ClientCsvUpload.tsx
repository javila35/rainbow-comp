"use client";

import { useRouter } from "next/navigation";
import CompactCsvUpload from "./CompactCsvUpload";

interface ClientCsvUploadProps {
  seasonId: number;
}

export default function ClientCsvUpload({ seasonId }: ClientCsvUploadProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Refresh the page data
    router.refresh();
  };

  return (
    <CompactCsvUpload 
      seasonId={seasonId} 
      onUploadComplete={handleUploadComplete} 
    />
  );
}
