const BASE_URL = 'http://localhost:5000/api';

async function runMockTestSuite() {
    console.log("==================================================================");
    console.log("🏛️  EduVera Comprehensive Multi-Tier Mock Test Suite");
    console.log("==================================================================\n");

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ [FAIL] ${name}`);
            console.error(`   Error: ${err.message}`);
            failed++;
        }
    }

    // 1. Platform Top Administrator Lead Login
    await test("1.1 Platform Top Administrator (ADMIN / Master Admin)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorityId: 'ADMIN',
                password: 'admin123',
                channel: 'central'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || !data.isMaster || (data.id !== 'ADMIN' && data.authorityId !== 'ADMIN')) {
            throw new Error(`Unexpected admin payload: ${JSON.stringify(data)}`);
        }
    });

    await test("1.2 Platform Administrator Desk Operator (OP-ADMIN-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorityId: 'ADMIN',
                operatorId: 'OP-ADMIN-01',
                password: 'admin123',
                channel: 'central'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.operatorId !== 'OP-ADMIN-01') {
            throw new Error(`Unexpected admin operator payload: ${JSON.stringify(data)}`);
        }
    });

    // 2. Central Ministry & State Education Departments
    await test("2.1 Central Ministry: MOE (Ministry of Education) + Operator (OP-MOE-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorityId: 'MOE',
                operatorId: 'OP-MOE-01',
                password: 'admin123',
                channel: 'central'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.tier !== 'central') {
            throw new Error(`Unexpected MOE payload: ${JSON.stringify(data)}`);
        }
    });

    await test("2.2 State Department: UP-MOE (Uttar Pradesh Directorate) + Operator (OP-UP-MOE)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stateId: 'UP-MOE',
                operatorId: 'OP-UP-MOE',
                password: 'admin123',
                channel: 'state'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.tier !== 'state') {
            throw new Error(`Unexpected UP-MOE payload: ${JSON.stringify(data)}`);
        }
    });

    // 3. Secondary Examination Boards (CBSE & UP Board)
    await test("3.1 Central Board: CBSE + Operator (OP-CBSE-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boardId: 'CBSE',
                operatorId: 'OP-CBSE-01',
                password: 'admin123',
                channel: 'board'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.tier !== 'board') {
            throw new Error(`Unexpected CBSE payload: ${JSON.stringify(data)}`);
        }
    });

    await test("3.2 State Board: UP Board (UP-BOARD) + Operator (OP-UPBOARD-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boardId: 'UP-BOARD',
                operatorId: 'OP-UPBOARD-01',
                password: 'admin123',
                channel: 'board'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.tier !== 'board') {
            throw new Error(`Unexpected UP-BOARD payload: ${JSON.stringify(data)}`);
        }
    });

    // 4. Schools Associated with CBSE & UP Board
    await test("4.1 CBSE School: DPS Noida (SCH-CBSE-01) + Operator (OP-DPS-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                institutionId: 'SCH-CBSE-01',
                operatorId: 'OP-DPS-01',
                password: 'admin123',
                channel: 'school'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.schoolId !== 'SCH-CBSE-01') {
            throw new Error(`Unexpected DPS Noida payload: ${JSON.stringify(data)}`);
        }
    });

    await test("4.2 UP Board School: GIC Lucknow (SCH-UP-01) + Operator (OP-GIC-LKO)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                institutionId: 'SCH-UP-01',
                operatorId: 'OP-GIC-LKO',
                password: 'admin123',
                channel: 'school'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.schoolId !== 'SCH-UP-01') {
            throw new Error(`Unexpected GIC Lucknow payload: ${JSON.stringify(data)}`);
        }
    });

    // 5. Higher Education Institutions (IIT Delhi & Delhi University)
    await test("5.1 Apex Institute: IIT Delhi (IIT-DELHI) + Operator (OP-IITD-01)", async () => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                institutionId: 'IIT-DELHI',
                operatorId: 'OP-IITD-01',
                password: 'admin123',
                channel: 'university'
            })
        });
        const data = await res.json();
        if (res.status !== 200 || data.schoolId !== 'IIT-DELHI') {
            throw new Error(`Unexpected IIT Delhi payload: ${JSON.stringify(data)}`);
        }
    });

    // 6. Complete 10-Student Education Ladder Verification
    const studentsToTest = [
        { name: "Aarav Verma (Class 5 - UP Board)", id: "AARAV052015", aadhaar: "111122223333", expectedClass: "Class 5" },
        { name: "Ananya Patel (Class 6 - CBSE)", id: "ANANYA062014", aadhaar: "222233334444", expectedClass: "Class 6" },
        { name: "Rohan Gupta (Class 7 - CBSE)", id: "ROHAN072013", aadhaar: "333344445555", expectedClass: "Class 7" },
        { name: "Sneha Sen (Class 9 - CBSE)", id: "SNEHA092011", aadhaar: "444455556666", expectedClass: "Class 9" },
        { name: "Rahul Sharma (Class 10 - CBSE Active)", id: "RAHUL052010", aadhaar: "548921047890", expectedClass: "Class 10" },
        { name: "Arjun Kapoor (Class 10 - UP Board TC Discharged)", id: "ARJUN032009", aadhaar: "876543210987", expectedStatus: "Transferred" },
        { name: "Vikramaditya Rao (Class 11 - CBSE Science)", id: "VIKRAM112008", aadhaar: "555566667777", expectedClass: "Class 11" },
        { name: "Priya Sharma (Class 12 - CBSE Commerce)", id: "PRIYA122007", aadhaar: "666677778888", expectedClass: "Class 12" },
        { name: "Kabir Mehta (B.Tech 2nd Year - DU Undergrad)", id: "KABIR2022CS", aadhaar: "777788889999", expectedStatus: "Active" },
        { name: "Devansh Saxena (IIT Delhi B.Tech Graduate, 9.42 CGPA)", id: "DEVANSH-IITD-2024", aadhaar: "999900001111", expectedClass: "B.Tech Graduated (Class of 2024)" }
    ];

    for (const [idx, s] of studentsToTest.entries()) {
        await test(`6.${idx + 1} Student Citizen Login: ${s.name}`, async () => {
            const res = await fetch(`${BASE_URL}/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: s.id,
                    aadhaarNumber: s.aadhaar
                })
            });
            const data = await res.json();
            if (res.status !== 200 || data.role !== 'student') {
                throw new Error(`Login failed for ${s.name}: ${JSON.stringify(data)}`);
            }
            if (s.expectedStatus && data.status !== s.expectedStatus) {
                throw new Error(`Expected status ${s.expectedStatus}, got ${data.status}`);
            }
            if (s.expectedClass && data.currentClass !== s.expectedClass) {
                throw new Error(`Expected class ${s.expectedClass}, got ${data.currentClass}`);
            }
        });
    }

    // 7. Statutory Dropout Radar & Transfer Integrity
    await test("7.1 State Dropout Radar: Detecting 30+ Day Floating TC (Arjun Kapoor)", async () => {
        const res = await fetch(`${BASE_URL}/stats/dropout-alarms`);
        const data = await res.json();
        const alarms = Array.isArray(data) ? data : (data.alarms || []);
        if (res.status !== 200 || alarms.length === 0) {
            throw new Error("No floating TC dropout alarms detected");
        }
    });

    await test("7.2 Anti-Ghost Lock: Validating Transfer-In Eligibility", async () => {
        const resActive = await fetch(`${BASE_URL}/students/RAHUL052010/eligibility`);
        const dataActive = await resActive.json();
        if (dataActive.eligible !== false) {
            throw new Error("Active student should NOT be eligible for transfer-in without TC");
        }

        const resTC = await fetch(`${BASE_URL}/students/ARJUN032009/eligibility`);
        const dataTC = await resTC.json();
        if (dataTC.eligible !== true) {
            throw new Error("TC Discharged student SHOULD be eligible for transfer-in");
        }
    });

    console.log("\n==================================================================");
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests`);
    console.log("==================================================================");
}

runMockTestSuite();
