import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import mongoose from 'mongoose';

// Define a TypeScript interface for the employee data


// Create Mongoose model
export const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

// Function to fetch and store employee data
export async function fetchAndStoreEmployees(): Promise<void> {
    try {
        await Employee.deleteMany({});
        // Fetch the XML data from the API
        const response = await axios.get('https://erp.dca.org.sa/WebService/ListEmployees.asmx/ListInfo?auth_key=DCA@987654321&Facility_ID=1');
        const xmlData = response.data;

        // Parse the XML to JSON
        const parser = new XMLParser();
        const jsonData = parser.parse(xmlData);

        // Clean up the data: remove unnecessary metadata
        const employeeData = jsonData.anyType;
        const data = JSON.parse(employeeData)
        // console.log(typeof data);
        // console.log(data);


        // Insert each employee into the MongoDB collection
        // console.log("Looping through employee data:", employeeData.length);
        // console.log(employeeData[0], employeeData[1], employeeData[2]);
        // console.log(typeof employeeData);

        for (const employee of data) {
            // Ensure the employee data matches the schema


            const newEmployee = new Employee({ Emp_ID: employee.Emp_ID, Emlpoyee_Name: employee.English_name });
            await newEmployee.save();
            // console.log(`Inserted employee with ID: ${employee.Emp_ID}`);
        }

        console.log('All employee data has been saved to MongoDB.');
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    } finally {
        // Close the database connection if required
        // await mongoose.disconnect();
    }
}
