// API Configuration
const API_URL = "http://127.0.0.1:8000/calculate-qpa";

// Application State
let courses = [];
let draggedElement = null;
let draggedIndex = null;

// DOM Elements
const coursesContainer = document.getElementById('coursesContainer');
const addCourseBtn = document.getElementById('addCourseBtn');
const methodBtn = document.getElementById('methodBtn');
const resourcesBtn = document.getElementById('resourcesBtn');
const methodPanel = document.getElementById('methodPanel');
const resourcesPanel = document.getElementById('resourcesPanel');
const qpaValue = document.getElementById('qpaValue');
const gpaValue = document.getElementById('gpaValue');
const totalUnitsValue = document.getElementById('totalUnitsValue');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadCoursesFromStorage();
    renderCourses();
    setupEventListeners();
    calculateQPA();
});

// Event Listeners Setup
function setupEventListeners() {
    // Add Course Button
    addCourseBtn.addEventListener('click', addNewCourse);

    // Dropdown Menu Buttons
    methodBtn.addEventListener('click', () => toggleDropdown('method'));
    resourcesBtn.addEventListener('click', () => toggleDropdown('resources'));
    document.getElementById('resourcesInfo').addEventListener('click', () => toggleDropdown('resources'));

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!methodBtn.contains(e.target) && !methodPanel.contains(e.target) &&
            !resourcesBtn.contains(e.target) && !resourcesPanel.contains(e.target) &&
            !document.getElementById('resourcesInfo').contains(e.target)) {
            closeAllDropdowns();
        }
    });
}

// Course Management Functions
function addNewCourse() {
    const newCourse = {
        id: Date.now(),
        code: '',
        units: 12,
        grade: 'A',
        active: true
    };
    
    courses.push(newCourse);
    renderCourses();
    saveCoursesToStorage();
    calculateQPA();
    
    // Focus on the new course code input
    const newRow = coursesContainer.lastElementChild;
    if (newRow) {
        const codeInput = newRow.querySelector('.course-code');
        if (codeInput) {
            codeInput.focus();
        }
    }
}

function deleteCourse(courseId) {
    courses = courses.filter(course => course.id !== courseId);
    renderCourses();
    saveCoursesToStorage();
    calculateQPA();
}

function toggleCourseActive(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.active = !course.active;
        renderCourses();
        saveCoursesToStorage();
        calculateQPA();
    }
}

function updateCourseCode(courseId, newCode) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.code = newCode;
        saveCoursesToStorage();
    }
}

function updateCourseUnits(courseId, delta) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const newUnits = Math.max(0, course.units + delta);
        course.units = newUnits;
        // Update the input field directly if it exists and is not focused
        const row = document.querySelector(`[data-course-id="${courseId}"]`);
        if (row) {
            const unitsInput = row.querySelector('.units-value');
            if (unitsInput && document.activeElement !== unitsInput) {
                unitsInput.value = `${newUnits} Units`;
            }
        } else {
            // If row not found, re-render
            renderCourses();
        }
        saveCoursesToStorage();
        calculateQPA();
    }
}

function updateCourseGrade(courseId, newGrade) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.grade = newGrade;
        saveCoursesToStorage();
        calculateQPA();
    }
}

// Render Functions
function renderCourses() {
    if (courses.length === 0) {
        coursesContainer.innerHTML = '<div class="empty-state">No courses added yet. Click ADD to get started.</div>';
        return;
    }

    coursesContainer.innerHTML = '';
    courses.forEach((course, index) => {
        const courseRow = createCourseRow(course, index);
        coursesContainer.appendChild(courseRow);
    });
}

function createCourseRow(course, index) {
    const row = document.createElement('div');
    row.className = 'course-row';
    row.draggable = true;
    row.dataset.courseId = course.id;
    row.dataset.index = index;

    // Toggle Button
    const toggle = document.createElement('button');
    toggle.className = `course-toggle ${course.active ? '' : 'inactive'}`;
    toggle.addEventListener('click', () => toggleCourseActive(course.id));
    row.appendChild(toggle);

    // Course Code Input
    const codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.className = 'course-code';
    codeInput.value = course.code || '';
    codeInput.placeholder = 'Code';
    codeInput.addEventListener('input', (e) => updateCourseCode(course.id, e.target.value));
    codeInput.addEventListener('blur', () => renderCourses());
    row.appendChild(codeInput);

    // Units Control
    const unitsControl = document.createElement('div');
    unitsControl.className = 'units-control';
    
    const minusBtn = document.createElement('button');
    minusBtn.className = 'units-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => updateCourseUnits(course.id, -1));
    unitsControl.appendChild(minusBtn);

    const unitsValue = document.createElement('input');
    unitsValue.type = 'text';
    unitsValue.className = 'units-value';
    unitsValue.value = `${course.units} Units`;
    unitsValue.readOnly = false;
    
    // When focused, show only the number
    unitsValue.addEventListener('focus', (e) => {
        e.target.value = course.units.toString();
        e.target.select();
    });
    
    // When input changes, validate and update
    unitsValue.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') value = '0';
        e.target.value = value;
    });
    
    // When blur, format with "Units" suffix
    unitsValue.addEventListener('blur', (e) => {
        let value = parseInt(e.target.value) || 0;
        value = Math.max(0, value); // Ensure non-negative
        e.target.value = `${value} Units`;
        
        // Update course units if changed
        if (value !== course.units) {
            const oldUnits = course.units;
            course.units = value;
            saveCoursesToStorage();
            calculateQPA();
        }
    });
    
    // Handle Enter key
    unitsValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    });
    
    unitsControl.appendChild(unitsValue);

    const plusBtn = document.createElement('button');
    plusBtn.className = 'units-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => updateCourseUnits(course.id, 1));
    unitsControl.appendChild(plusBtn);

    row.appendChild(unitsControl);

    // Grade Dropdown
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade-select';
    const grades = ['A', 'B', 'C', 'D'];
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        if (grade === course.grade) {
            option.selected = true;
        }
        gradeSelect.appendChild(option);
    });
    gradeSelect.addEventListener('change', (e) => updateCourseGrade(course.id, e.target.value));
    row.appendChild(gradeSelect);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.addEventListener('click', () => deleteCourse(course.id));
    row.appendChild(deleteBtn);

    // Drag Handle
    const dragHandle = document.createElement('button');
    dragHandle.className = 'action-btn drag-handle';
    dragHandle.setAttribute('draggable', 'false');
    row.appendChild(dragHandle);

    // Drag and Drop Events
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    return row;
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    // Store the dragged course ID
    e.dataTransfer.setData('courseId', this.dataset.courseId);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    
    const afterElement = getDragAfterElement(coursesContainer, e.clientY);
    
    if (afterElement == null) {
        coursesContainer.appendChild(dragging);
    } else {
        coursesContainer.insertBefore(dragging, afterElement);
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    const draggedCourseId = parseInt(e.dataTransfer.getData('courseId'));
    const allRows = Array.from(coursesContainer.querySelectorAll('.course-row'));
    const targetRow = this;
    const newIndex = allRows.indexOf(targetRow);
    
    if (draggedCourseId && newIndex !== -1) {
        const draggedCourse = courses.find(c => c.id === draggedCourseId);
        if (draggedCourse) {
            courses = courses.filter(c => c.id !== draggedCourseId);
            courses.splice(newIndex, 0, draggedCourse);
            renderCourses();
            saveCoursesToStorage();
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
    draggedIndex = null;
    
    // Reset any visual changes
    const allRows = coursesContainer.querySelectorAll('.course-row');
    allRows.forEach(row => row.classList.remove('dragging'));
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.course-row:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Dropdown Menu Functions
function toggleDropdown(type) {
    const isMethodActive = methodPanel.classList.contains('active');
    const isResourcesActive = resourcesPanel.classList.contains('active');
    
    if (type === 'method') {
        if (isMethodActive) {
            methodPanel.classList.remove('active');
            methodBtn.classList.remove('active');
        } else {
            resourcesPanel.classList.remove('active');
            resourcesBtn.classList.remove('active');
            methodPanel.classList.add('active');
            methodBtn.classList.add('active');
        }
    } else if (type === 'resources') {
        if (isResourcesActive) {
            resourcesPanel.classList.remove('active');
            resourcesBtn.classList.remove('active');
        } else {
            methodPanel.classList.remove('active');
            methodBtn.classList.remove('active');
            resourcesPanel.classList.add('active');
            resourcesBtn.classList.add('active');
        }
    }
}

function closeAllDropdowns() {
    methodPanel.classList.remove('active');
    resourcesPanel.classList.remove('active');
    methodBtn.classList.remove('active');
    resourcesBtn.classList.remove('active');
}

// QPA Calculation Functions
async function calculateQPA() {
    // Filter active courses only
    const activeCourses = courses.filter(c => c.active);
    
    if (activeCourses.length === 0) {
        updateDisplay(0, 0, 0);
        return;
    }

    // Prepare data for API
    const grades = activeCourses.map(course => [course.units, course.grade]);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grades: grades })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Update display with API response
        updateDisplay(
            data.QPA || data.qpa || 0,
            data.GPA || data.gpa || 0,
            data.totalUnits || data.total_units || 0
        );
    } catch (error) {
        console.error('Error calculating QPA:', error);
        // Fallback to local calculation if API fails
        const fallbackResult = calculateQPALocal(activeCourses);
        updateDisplay(fallbackResult.qpa, fallbackResult.gpa, fallbackResult.totalUnits);
    }
}

function calculateQPALocal(activeCourses) {
    // Grade to quality points mapping for CMU
    const gradePoints = {
        'A': 4.0,
        'B': 3.0,
        'C': 2.0,
        'D': 1.0
    };

    let totalQualityPoints = 0;
    let totalUnits = 0;

    activeCourses.forEach(course => {
        const qualityPoints = gradePoints[course.grade] || 0;
        totalQualityPoints += qualityPoints * course.units;
        totalUnits += course.units;
    });

    const qpa = totalUnits > 0 ? totalQualityPoints / totalUnits : 0;
    const gpa = qpa; // For CMU, QPA and GPA are the same

    return {
        qpa: parseFloat(qpa.toFixed(2)),
        gpa: parseFloat(gpa.toFixed(2)),
        totalUnits: totalUnits
    };
}

function updateDisplay(qpa, gpa, totalUnits) {
    qpaValue.textContent = qpa.toFixed(2);
    gpaValue.textContent = gpa.toFixed(2);
    totalUnitsValue.textContent = totalUnits;
}

// LocalStorage Functions
function saveCoursesToStorage() {
    try {
        localStorage.setItem('cmuQpaCourses', JSON.stringify(courses));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadCoursesFromStorage() {
    try {
        const saved = localStorage.getItem('cmuQpaCourses');
        if (saved) {
            courses = JSON.parse(saved);
            // Validate and ensure all courses have required properties
            courses = courses.map(course => ({
                id: course.id || Date.now() + Math.random(),
                code: course.code || '',
                units: course.units || 12,
                grade: course.grade || 'A',
                active: course.active !== undefined ? course.active : true
            }));
        } else {
            // Initialize with two default courses
            courses = [
                {
                    id: Date.now(),
                    code: 'Code',
                    units: 12,
                    grade: 'A',
                    active: true
                },
                {
                    id: Date.now() + 1,
                    code: '21-127',
                    units: 12,
                    grade: 'A',
                    active: true
                }
            ];
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        // Initialize with default courses on error
        courses = [
            {
                id: Date.now(),
                code: 'Code',
                units: 12,
                grade: 'A',
                active: true
            },
            {
                id: Date.now() + 1,
                code: 'Code',
                units: 12,
                grade: 'A',
                active: true
            }
        ];
    }
}