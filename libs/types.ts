export interface GenerateImageRequest {
  prompt: string;
  style:
    | "modern"
    | "minimalist"
    | "industrial"
    | "traditional"
    | "contemporary";
}

export interface GenerateImageResponse {
  id: string;
  prompt: string;
  style: string;
  filename: string;
  imageUrl: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  status: number;
}
