export type Page = "dashboard" | "import" | "browse" | "settings" | "users";

export type ViewMode = "grid" | "list";

export interface Artwork {
  id: string;
  museumId: string;
  externalId: string;
  title: string;
  artist: string | null;
  year: number | null;
  description: string | null;
  imageUrl: string | null;
  additionalImages: string[];
  aiKeywords: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;

  department?: string;
  culture?: string;
  medium?: string;
  classification?: string;
  isPublished?: boolean;
  aiEnriched?: boolean;

  metadata?: {
    objectID: number;
    department: string;
    title: string;
    culture: string;
    period: string;
    artistDisplayName: string;
    artistDisplayBio: string;
    artistNationality: string;
    objectDate: string;
    objectBeginDate: number;
    objectEndDate: number;
    medium: string;
    dimensions: string;
    classification: string;
    objectURL: string;
    primaryImage: string;
    additionalImages: string[];
    isPublicDomain: boolean;
    tags: Array<{ term: string; AAT_URL: string; Wikidata_URL: string }>;
    [key: string]: any;
  };
}

export interface Department {
  departmentId: number;
  displayName: string;
}
