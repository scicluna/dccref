export interface SubTable {
    subtable_name: string;
    dice_size: string;
    table: Record<string, string>; // Maps roll ranges (e.g., "1-10") to results
  }
  
  export interface TableData {
    table_name: string;
    notes: string;
    general: string;
    sub_tables: SubTable[];
  }
  