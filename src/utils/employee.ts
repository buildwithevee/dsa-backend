import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import mongoose from 'mongoose';

// Define a TypeScript interface for the employee data
interface EmployeeData {
    Emp_ID: string;
    English_name: string;
}

// Create Mongoose model
export const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

// Function to fetch and store employee data
export async function fetchAndStoreEmployees(): Promise<void> {
    try {
        // Clear the existing collection
        await Employee.deleteMany({});

        // Fetch the XML data from the API
        const response = await axios.get<string>(
            'https://erp.dca.org.sa/WebService/ListEmployees.asmx/ListInfo?auth_key=DCA@987654321&Facility_ID=1',
            { responseType: 'text' } // Ensure the response is treated as text
        );
        const xmlData: string = response.data;

        // Parse the XML to JSON
        const parser = new XMLParser();
        const jsonData = parser.parse(xmlData);

        // Extract employee data
        const employeeData = jsonData.anyType;

        // If `employeeData` is already a JSON object, no need to parse further
        const employees: EmployeeData[] =
            typeof employeeData === 'string' ? JSON.parse(employeeData) : employeeData;

        // Insert each employee into the MongoDB collection
        for (const employee of employees) {
            const newEmployee = new Employee({
                Emp_ID: employee.Emp_ID,
                Emlpoyee_Name: employee.English_name,
            });
            await newEmployee.save();
        }

        console.log('All employee data has been saved to MongoDB.');
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}
