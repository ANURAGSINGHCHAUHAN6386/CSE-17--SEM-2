let employees = [];

function addEmployee() {

    let name = document.getElementById("Name").value;
    let id = document.getElementById("empId").value;
    let salary = parseFloat(document.getElementById("Salary").value);
    let dept = document.getElementById("Dept").value;

    if(name === "" || id === "" || isNaN(salary) || dept === ""){
        alert("Please fill all fields");
        return;
    }

    let emp = {
        name: name,
        id: id,
        salary: salary,
        dept: dept
    };

    employees.push(emp);

    document.getElementById("output").innerHTML = "Employee Added Successfully";

    document.getElementById("Name").value = "";
    document.getElementById("empId").value = "";
    document.getElementById("Salary").value = "";
    document.getElementById("Dept").value = "";
}

function displayAll(){

    let text = "<h3>All Employees</h3>";

    employees.forEach(function(emp){
        text += `
        Name: ${emp.name} |
        ID: ${emp.id} |
        Salary: ${emp.salary} |
        Dept: ${emp.dept}
        <br>
        `;
    });

    document.getElementById("output").innerHTML = text;
}

function filterSalary(){

    let text = "<h3>Employees with Salary > 50000</h3>";

    let result = employees.filter(emp => emp.salary > 50000);

    result.forEach(function(emp){
        text += `
        Name: ${emp.name} |
        ID: ${emp.id} |
        Salary: ${emp.salary} |
        Dept: ${emp.dept}
        <br>
        `;
    });

    document.getElementById("output").innerHTML = text;
}

function totalSalary(){

    let total = employees.reduce((sum, emp) => sum + emp.salary, 0);

    document.getElementById("output").innerHTML = 
    "<h3>Total Salary: " + total + "</h3>";
}

function averageSalary(){

    if(employees.length === 0){
        document.getElementById("output").innerHTML = "No employees";
        return;
    }

    let total = employees.reduce((sum, emp) => sum + emp.salary, 0);
    let avg = total / employees.length;

    document.getElementById("output").innerHTML = 
    "<h3>Average Salary: " + avg.toFixed(2) + "</h3>";
}

function countByDept(){

    let deptCount = {};

    employees.forEach(emp => {

        if(deptCount[emp.dept]){
            deptCount[emp.dept]++;
        } else {
            deptCount[emp.dept] = 1;
        }

    });

    let text = "<h3>Employees Count by Department</h3>";

    for(let dept in deptCount){
        text += dept + " : " + deptCount[dept] + "<br>";
    }

    document.getElementById("output").innerHTML = text;
}