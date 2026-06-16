export interface GenerateImageRequest {
  prompt: string;
  style:
    | "modern"
    | "minimalist"
    | "industrial"
    | "traditional"
    | "contemporary";
  width?: number;
  height?: number;
}

export interface GenerateImageResponse {
  id: string;
  prompt: string;
  style: string;
  filename: string;
  imageUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface ApiError {
  error: string;
  status: number;
}
