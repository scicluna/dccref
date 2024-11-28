'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TableData } from '@/types/table';
import { kebabToTitle } from '@/utils/kebabtotitle';

export default function TablePage() {
  const params = useParams();
  const router = useRouter();

  const [tableData, setTableData] = useState<TableData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDice, setCurrentDice] = useState('');
  const [currentSubTable, setCurrentSubTable] = useState<string | null>(null);
  const [bonus, setBonus] = useState<number | string>(0);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  // Fetch JSON data dynamically based on the table parameter
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const { table } = params;
        if (!table) {
          router.push('/404'); // Redirect if the table parameter is missing
          return;
        }
  
        const res = await fetch(`${window.location.origin}/tables/${table}.json`);
        console.log('Fetch response:', res);
        if (!res.ok) {
          throw new Error('Table not found');
        }
  
        const data: TableData = await res.json();
        setTableData(data);
      } catch (error) {
        console.error('Failed to fetch table data:', error);
        router.push('/404'); // Redirect if there's an error
      }
    };
  
    fetchTableData();
  }, [params, router]);

  if (!tableData) {
    return <div className="text-gray-700">Loading...</div>;
  }

  // Parse roll range (e.g., "1-10") into min and max values
  const parseRollRange = (range: string) => {
    const [min, max] = range.replace('+', '').split('-').map(Number);
    return { min, max };
  };

  // Determine the row that matches the roll
  const getRowForRoll = (roll: number, rows: { roll: string; result: string }[]) => {
    for (const row of rows) {
      const { min, max } = parseRollRange(row.roll);
      if (!max && roll == min) {
        return row;
      }
      if (roll >= min && roll <= max) {
        return row;
      }
    }
    // If out of bounds, return first or last row
    if (roll < parseRollRange(rows[0].roll).min) return rows[0];
    if (roll > parseRollRange(rows[rows.length - 1].roll).max) return rows[rows.length - 1];
    return rows[rows.length - 1];
  };

  // Dice roll logic
  const rollDice = (dice: string, bonus: number) => {
    const [num, sides] = dice.split('d').map(Number);
    const roll = Array.from({ length: num })
      .map(() => Math.floor(Math.random() * sides) + 1)
      .reduce((acc, val) => acc + val, 0);
    return roll + bonus;
  };

  const openModal = (dice: string, subTableName: string) => {
    setCurrentDice(dice);
    setCurrentSubTable(subTableName);
    setBonus(0);
    setRollResult(null);
    setHighlightedRowId(null);
    setResultText(null);
    setModalOpen(true);
  };

  const executeRoll = () => {
    const result = rollDice(currentDice, typeof bonus === 'string' ? parseFloat(bonus) : bonus);
    setRollResult(result);

    // Highlight the appropriate row for the current subtable
    const rows = tableData.sub_tables.find(
      (table) => table.subtable_name === currentSubTable
    )?.table;

    if (rows && currentSubTable) {
      const row = getRowForRoll(result, Object.entries(rows).map(([roll, result]) => ({ roll, result })));
      setHighlightedRowId(row?.roll || null);
      setResultText(`Result: ${result}`);
    }

    // Automatically close modal after roll
    setModalOpen(false);
  };

  const getRollMin = (roll: string) => {
    const [min] = roll.split('-').map(Number);
    return min;
  };
  
  return (
    <div className="min-h-screen sm:w-[60%] w-full bg-gray-200 p-4 text-gray-700">
      <h1 className="text-3xl font-bold">{kebabToTitle(tableData.table_name)}</h1>
      <p className='font-bold text-sm p-2 italic'>{tableData.notes}</p>
      <p className='font-bold p-2 italic'>{tableData.general}</p>
      {tableData.sub_tables.map((subTable) => (
        <div key={subTable.subtable_name} className="mb-8 bg-white shadow rounded-lg p-4">
          <div className="flex sm:flex-row flex-col gap-4 items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{subTable.subtable_name}</h2>
            {currentSubTable === subTable.subtable_name && resultText && (
              <div className="text-lg font-bold text-blue-700">{resultText}</div>
            )}
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => openModal(subTable.dice_size, subTable.subtable_name)}
            >
              Roll {subTable.dice_size}
            </button>
          </div>
          <table className="w-full text-left table-fixed">
            <thead>
              <tr>
                <th className="px-4 py-2 w-1/4">Roll</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
            {Object.entries(subTable.table)
            .sort(([rollA], [rollB]) => getRollMin(rollA) - getRollMin(rollB)) // Sort rows based on the first number
            .map(([roll, result]) => (
              <tr
                key={roll}
                className={`border-t ${
                  currentSubTable === subTable.subtable_name && highlightedRowId === roll
                    ? 'bg-yellow-200'
                    : ''
                }`}
              >
                <td className="px-4 py-2 text-sm text-gray-500 w-1/4">{roll}</td>
                <td className="px-4 py-2 w-full break-words">{result}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ))}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Roll {currentDice}</h2>
            <div className="mt-4">
              <label className="block mb-2">Bonus:</label>
                <input
                  type="text" // Use text input to handle partial inputs like "-"
                  value={bonus === null ? '' : bonus} // Ensure null displays as an empty string
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty, "-", or valid numbers
                    if (value === '' || value === '-' || !isNaN(Number(value))) {
                      setBonus(value === '' || value === '-' ? value : parseFloat(value));
                    }
                  }}
                  onBlur={() => {
                    // Clean up: Convert "-" to 0 on blur
                    if (bonus === '-' as any) {
                      setBonus(0);
                    }
                  }}
                  className="border rounded p-2 w-full"
                />
              </div>
            <div className="flex mt-6 justify-between">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={executeRoll}
              >
                Roll
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
