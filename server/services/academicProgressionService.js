const Student = require('../models/Student');

const K12_CLASSES = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
];

/**
 * Returns academic session metadata for any date based on statutory 1 April rollover.
 * In India, the academic session runs from April 1 to March 31.
 * e.g. Nov 2026 -> '2026-2027', session started 1 April 2026, next rollover 1 April 2027.
 * e.g. Feb 2026 -> '2025-2026', session started 1 April 2025, next rollover 1 April 2026.
 */
const getAcademicSession = (date = new Date()) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed: 3 = April

    let startYear, endYear;
    let sessionStartDate, nextRolloverDate, lastRolloverDate;

    if (month >= 3) {
        // Current date is between April 1 and December 31
        startYear = year;
        endYear = year + 1;
        sessionStartDate = new Date(year, 3, 1);
        lastRolloverDate = new Date(year, 3, 1);
        nextRolloverDate = new Date(year + 1, 3, 1);
    } else {
        // Current date is between January 1 and March 31
        startYear = year - 1;
        endYear = year;
        sessionStartDate = new Date(year - 1, 3, 1);
        lastRolloverDate = new Date(year - 1, 3, 1);
        nextRolloverDate = new Date(year, 3, 1);
    }

    return {
        sessionString: `${startYear}-${endYear}`,
        startYear,
        endYear,
        sessionStartDate,
        lastRolloverDate,
        nextRolloverDate
    };
};

/**
 * Get index of class standard (0 to 11)
 */
const getClassIndex = (className) => {
    if (!className) return -1;
    const clean = String(className).trim();
    // Match 'Class 10', '10', 'Class 10th'
    const numMatch = clean.match(/\d+/);
    if (!numMatch) return -1;
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= 12) {
        return num - 1;
    }
    return -1;
};

/**
 * Get previous standard (e.g. 'Class 11' -> 'Class 10')
 */
const getPreviousClass = (className) => {
    const idx = getClassIndex(className);
    if (idx > 0) {
        return K12_CLASSES[idx - 1];
    }
    return null;
};

/**
 * Get next standard (e.g. 'Class 10' -> 'Class 11')
 */
const getNextClass = (className) => {
    const idx = getClassIndex(className);
    if (idx >= 0 && idx < 11) {
        return K12_CLASSES[idx + 1];
    }
    if (idx === 11) {
        return 'Class 12 Passed (Alumni)';
    }
    return null;
};

/**
 * Calculate and synchronize a student's automatic academic class progression
 * based on the statutory 1 April rollover calendar.
 * 
 * Logic:
 * - K-12 students advance 1 class every 1 April until Class 12.
 * - Concluded academic sessions before current April 1 are archived as "Previous Class".
 * - Marksheets from concluded sessions are tagged with the specific previous class level.
 * 
 * @param {Object} student - Mongoose Student document
 * @param {boolean} [save=true] - Whether to save changes to MongoDB
 */
const syncStudentAcademicProgression = async (student, save = true) => {
    if (!student || student.academicLevel !== 'school' || student.status === 'Passed') {
        return student;
    }

    const currentSessionInfo = getAcademicSession(new Date());
    const currentSession = currentSessionInfo.sessionString;
    const currentSessionStartYear = currentSessionInfo.startYear;

    let classIndex = getClassIndex(student.currentClass);
    if (classIndex === -1) {
        return student; // Not a recognized K-12 standard
    }

    // Determine reference academic session for current recorded class
    let refSessionStartYear = null;
    let refClass = K12_CLASSES[classIndex];

    if (student.currentAcademicSession) {
        const parts = student.currentAcademicSession.split('-');
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed)) refSessionStartYear = parsed;
    }

    // Fallback: Check marks academicYear (e.g. '2024-2025' for Class 10)
    if (!refSessionStartYear && student.marks && student.marks.length > 0) {
        const markYears = student.marks
            .map(m => m.academicYear)
            .filter(Boolean)
            .map(yr => parseInt(String(yr).split('-')[0], 10))
            .filter(n => !isNaN(n));
        
        if (markYears.length > 0) {
            // Latest marksheet session represents the class in which exams were completed
            refSessionStartYear = Math.max(...markYears);
        }
    }

    // Fallback: Check joinedYear or admissionYear
    if (!refSessionStartYear) {
        const activeHist = student.history?.find(h => h.leftYear === 'Present') || student.history?.[0];
        const histYr = activeHist ? parseInt(activeHist.joinedYear, 10) : null;
        refSessionStartYear = student.admissionYear || histYr || (new Date(student.createdAt || Date.now()).getFullYear());
    }

    // Calculate how many 1st-April rollovers have occurred since that session
    const sessionsElapsed = Math.max(0, currentSessionStartYear - refSessionStartYear);

    // If already in sync for the current session
    const isAlreadyCurrent = student.currentAcademicSession === currentSession;

    let targetIndex = classIndex;
    let updated = false;

    if (!isAlreadyCurrent && sessionsElapsed > 0) {
        targetIndex = Math.min(12, classIndex + sessionsElapsed);
        updated = true;
    }

    // Previous class determination
    let prevClass = student.previousClass;
    if (targetIndex > 0) {
        prevClass = K12_CLASSES[Math.min(targetIndex - 1, 11)];
    }

    let newClass = student.currentClass;
    if (targetIndex >= 12) {
        newClass = 'Class 12 Passed (Alumni)';
        student.status = 'Passed';
        student.qualification = 'Class 12 Passed';
        student.currentClass = newClass;
        student.course = 'Higher Secondary Examination (Class 12 Passed)';
    } else {
        newClass = K12_CLASSES[targetIndex];
        student.currentClass = newClass;
        student.qualification = newClass;
        student.course = `Standard Schooling (${newClass})`;
        if (['Class 11', 'Class 12'].includes(newClass)) {
            student.courseType = 'Senior Secondary';
        }
    }

    student.previousClass = prevClass;
    student.currentAcademicSession = currentSession;
    student.lastPromotionDate = currentSessionInfo.lastRolloverDate;
    student.nextPromotionDate = currentSessionInfo.nextRolloverDate;

    // Tag marksheet entries with class standard and previous class flag
    if (student.marks && student.marks.length > 0) {
        student.marks.forEach(m => {
            const mYear = m.academicYear ? parseInt(m.academicYear.split('-')[0], 10) : null;
            if (mYear !== null) {
                if (mYear < currentSessionStartYear) {
                    m.isPreviousClass = true;
                    // Map marks from concluded session to previous class standard
                    if (!m.classLevel) {
                        const offset = currentSessionStartYear - mYear;
                        const mClassIdx = Math.max(0, targetIndex - offset);
                        m.classLevel = K12_CLASSES[mClassIdx] || prevClass;
                    }
                } else {
                    m.isPreviousClass = false;
                    m.classLevel = newClass;
                }
            } else {
                m.isPreviousClass = true;
                m.classLevel = prevClass;
            }
        });
    }

    // Ensure promotion history record
    if (updated) {
        if (!student.promotionHistory) student.promotionHistory = [];
        const alreadyLogged = student.promotionHistory.some(p => p.academicSession === currentSession);
        if (!alreadyLogged) {
            student.promotionHistory.push({
                fromClass: refClass,
                toClass: newClass,
                academicSession: currentSession,
                promotedAt: new Date(),
                note: `Automatic annual class promotion executed on 1 April statutory session rollover (${currentSession}).`
            });
        }

        // Update active history record
        if (student.history && student.history.length > 0) {
            const activeHist = student.history.find(h => h.leftYear === 'Present');
            if (activeHist) {
                activeHist.lastClass = newClass;
                activeHist.lastCourse = student.course;
            }
        }
    }

    if (save && typeof student.save === 'function') {
        await student.save();
    }

    return student;
};

/**
 * Batch auto-promotion job for all active K-12 students
 */
const autoPromoteAllStudents = async () => {
    const students = await Student.find({
        academicLevel: 'school',
        status: { $ne: 'Passed' }
    });

    let promotedCount = 0;
    const results = [];

    for (const student of students) {
        const oldClass = student.currentClass;
        await syncStudentAcademicProgression(student, true);
        if (student.currentClass !== oldClass) {
            promotedCount++;
            results.push({
                id: student.uniqueId,
                name: student.name,
                from: oldClass,
                to: student.currentClass,
                previousClass: student.previousClass,
                session: student.currentAcademicSession
            });
        }
    }

    return {
        totalEvaluated: students.length,
        promotedCount,
        results
    };
};

module.exports = {
    K12_CLASSES,
    getAcademicSession,
    getClassIndex,
    getPreviousClass,
    getNextClass,
    syncStudentAcademicProgression,
    autoPromoteAllStudents
};
