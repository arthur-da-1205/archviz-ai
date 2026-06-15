// API Request/Response types

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
  imageUrl: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  status: number;
}
