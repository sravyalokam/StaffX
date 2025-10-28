export interface CandidatesResponse {
  total: number;
  page: number;
  page_size: number;
  items: CandidatesItem[];
}

export interface CandidatesItem {
  id: string;
  name: string;
  email: string;
  resource_type: string; 
  status: string;       
  total_experience: string;
  location: string;
  is_active: boolean;
  job_id: string;
  client_name: string;
  job_title: string;
  rounds_count: number;
}

export interface CandidateDocumentUpload {
  filename: string;
  filetype: string;
  filedata: string; 
}
