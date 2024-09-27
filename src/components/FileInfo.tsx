// src/components/FileInfo.tsx
import React from "react";
import { useStore } from "../store/useStore";

export const FileInfo: React.FC = () => {
  const { fileInfo } = useStore();

  return (
    <div dangerouslySetInnerHTML={{ __html: fileInfo }} className="mb-4"></div>
  );
};
