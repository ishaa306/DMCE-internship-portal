const fs = require('fs'); 
const file = 'c:/Users/Isha Jogmarge/OneDrive/Documents/Projects/Placement Portal/Development/internship-backend/src/routes/student.js'; 
let content = fs.readFileSync(file, 'utf8'); 
content = content.replace(/const studentId = getStudentId\(user\);/g, "const studentId = c.get('studentId');"); 
fs.writeFileSync(file, content);
