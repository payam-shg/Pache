
import fs from 'fs/promises';
import path from 'path';
import type { PacheData, PacheGroup } from '@/types';

const dataDirectory = path.join(process.cwd(), 'src', 'data');
const dataFilePath = path.join(dataDirectory, 'dango-data.json');

export async function readPacheData(): Promise<PacheData> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true });
    const fileContents = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContents) as PacheData;
    // Ensure paches array exists
    if (!data.paches) {
      return { paches: [] };
    }
    return data;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const defaultData: PacheData = { paches: [] };
      await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    console.error('Error reading pache data file:', error);
    throw new Error('Could not read pache data from file.');
  }
}

export async function writePacheData(data: PacheData): Promise<void> {
  try {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing pache data to file:', error);
    throw new Error('Could not save pache data to file.');
  }
}
