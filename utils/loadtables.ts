import { TableData } from '@/types/table';

// Determine base URL based on environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Running in the browser
    return '';
  }
  // Running on the server
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Load all table data dynamically using the API route
export const loadTables = async (): Promise<
  Array<{
    table: string;
    subTable: string;
    roll: string;
    result: string;
  }>
> => {
  const allTables: Array<{
    table: string;
    subTable: string;
    roll: string;
    result: string;
  }> = [];

  try {
    // Fetch the list of JSON files from the API route
    const baseURL = getBaseURL();
    const res = await fetch(`${baseURL}/api/tables`);
    if (!res.ok) {
      throw new Error('Failed to fetch table list');
    }

    const tableFiles: string[] = await res.json();

    // Fetch and parse each table file
    for (const file of tableFiles) {
      try {
        const tableRes = await fetch(`${baseURL}/tables/${file}`);
        if (!tableRes.ok) {
          throw new Error(`Failed to fetch ${file}`);
        }

        const tableData: TableData = await tableRes.json();

        // Process table data
        tableData.sub_tables.forEach((subTable) => {
          Object.entries(subTable.table).forEach(([roll, result]) => {
            allTables.push({
              table: tableData.table_name,
              subTable: subTable.subtable_name,
              roll,
              result,
            });
          });
        });
      } catch (error) {
        console.error(`Error loading table data from ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching table list:', error);
  }

  return allTables;
};
