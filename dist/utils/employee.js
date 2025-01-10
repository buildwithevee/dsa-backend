"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
exports.fetchAndStoreEmployees = fetchAndStoreEmployees;
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
const mongoose_1 = __importDefault(require("mongoose"));
// Create Mongoose model
exports.Employee = mongoose_1.default.model('Employee', new mongoose_1.default.Schema({}, { strict: false }));
// Function to fetch and store employee data
function fetchAndStoreEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clear the existing collection
            yield exports.Employee.deleteMany({});
            // Fetch the XML data from the API
            const response = yield axios_1.default.get('https://erp.dca.org.sa/WebService/ListEmployees.asmx/ListInfo?auth_key=DCA@987654321&Facility_ID=1', { responseType: 'text' } // Ensure the response is treated as text
            );
            const xmlData = response.data;
            // Parse the XML to JSON
            const parser = new fast_xml_parser_1.XMLParser();
            const jsonData = parser.parse(xmlData);
            // Extract employee data
            const employeeData = jsonData.anyType;
            // If `employeeData` is already a JSON object, no need to parse further
            const employees = typeof employeeData === 'string' ? JSON.parse(employeeData) : employeeData;
            // Insert each employee into the MongoDB collection
            for (const employee of employees) {
                const newEmployee = new exports.Employee({
                    Emp_ID: employee.Emp_ID,
                    Emlpoyee_Name: employee.English_name,
                });
                yield newEmployee.save();
            }
            console.log('All employee data has been saved to MongoDB.');
        }
        catch (error) {
            console.error('Error fetching or saving data:', error);
        }
    });
}
