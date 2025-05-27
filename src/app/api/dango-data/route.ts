
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Member, Expense, Payment } from '@/types';

// Define the path to the data file
// __dirname is not available in ES modules with Next.js App Router, use process.cwd()
const dataDirectory = path.join(process.cwd(), 'src', 'data');
const dataFilePath = path.join(dataDirectory, 'dango-data.json');

interface AppData {
  members: Member[];
  expenses: Expense[];
  payments: Payment[];
}

// Helper function to read data from the file
async function readDataFromFile(): Promise<AppData> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true }); // Ensure directory exists
    const fileContents = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContents) as AppData;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default empty structure
      const defaultData: AppData = { members: [], expenses: [], payments: [] };
      // Optionally, create the file with default data
      await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    console.error('Error reading data file:', error);
    // In case of other errors, rethrow or return a structured error
    throw new Error('Could not read data from file.');
  }
}

// Helper function to write data to the file
async function writeDataToFile(data: AppData): Promise<void> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true }); // Ensure directory exists
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data to file:', error);
    throw new Error('Could not save data to file.');
  }
}

// GET handler to retrieve data
export async function GET() {
  try {
    const data = await readDataFromFile();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to retrieve data' }, { status: 500 });
  }
}

// POST handler to save data
export async function POST(request: Request) {
  try {
    const newData: AppData = await request.json();
    // Basic validation (can be more extensive)
    if (!newData || typeof newData.members === 'undefined' || typeof newData.expenses === 'undefined' || typeof newData.payments === 'undefined') {
      return NextResponse.json({ message: 'Invalid data format provided.' }, { status: 400 });
    }
    await writeDataToFile(newData);
    return NextResponse.json({ message: 'Data saved successfully.' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to save data' }, { status: 500 });
  }
}
