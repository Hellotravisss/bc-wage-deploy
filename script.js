if (typeof shifts !== 'undefined') { console.log('shifts exists'); } else {
  
  // 存储所有班次信息
let shifts = [];

// 税收计算相关的常量
const TAX_BRACKETS_FEDERAL = [
    { threshold: 53359, rate: 0.15 },
    { threshold: 106717, rate: 0.205 },
    { threshold: 165430, rate: 0.26 },
    { threshold: 235675, rate: 0.29 },
    { threshold: Infinity, rate: 0.33 }
];

const TAX_BRACKETS_BC = [
    { threshold: 45654, rate: 0.0506 },
    { threshold: 91310, rate: 0.077 },
    { threshold: 104835, rate: 0.105 },
    { threshold: 127299, rate: 0.1229 },
    { threshold: 172602, rate: 0.147 },
    { threshold: 240716, rate: 0.168 },
    { threshold: Infinity, rate: 0.205 }
];

// CPP和EI费率
const CPP_RATE = 0.0595;
const CPP_MAX_CONTRIBUTION = 3754.45;
const EI_RATE = 0.0163;
const EI_MAX_CONTRIBUTION = 1002.45;

// 添加默认班次（两周）
function addDefaultSchedule() {
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
    const defaultStartTime = document.getElementById('defaultStartTime').value;
    const defaultEndTime = document.getElementById('defaultEndTime').value;
    const cycleStartDate = document.getElementById('cycleStartDate').value;
    
    if (!hourlyRate || !defaultStartTime || !defaultEndTime || !cycleStartDate) {
        alert('Please enter all required information (hourly rate, schedule times, and pay period start date)!');
        return;
    }

    // 获取选中的工作日
    const workDays = [];
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach((day, index) => {
        if (document.getElementById(day).checked) {
            workDays.push(index);
        }
    });

    if (workDays.length === 0) {
        alert('Please select at least one work day!');
        return;
    }

    // 清空现有的班次
    if (shifts.length > 0) {
        if (!confirm('This will clear existing shifts and add new ones. Continue?')) {
            return;
        }
        shifts = [];
    }

    // 从选定的起始日期开始
    const startDate = new Date(cycleStartDate);
    startDate.setHours(0, 0, 0, 0); // 确保时间部分为0

    // 添加两周的班次
    for (let day = 0; day < 14; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        // 获取当前日期是星期几 (0-6)
        const dayOfWeek = currentDate.getDay();
        
        // 检查当前日期是否是选中的工作日
        if (workDays.includes(dayOfWeek)) {
            const dateString = currentDate.toISOString().split('T')[0];
            const shift = calculateShiftHours(dateString, defaultStartTime, defaultEndTime);
            shift.hourlyRate = hourlyRate;
            shifts.push(shift);
        }
    }
    
    // 按日期排序
    shifts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 更新显示
    updateShiftsTable();
    calculatePay();
}

// 添加单个班次
function addShift() {
    const date = document.getElementById('workDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);

    // 验证输入
    if (!date || !startTime || !endTime || !hourlyRate) {
        alert('Please fill in all required fields!');
        return;
    }

    // 检查是否已存在相同日期的记录
    const existingShiftIndex = shifts.findIndex(shift => shift.date === date);
    if (existingShiftIndex !== -1) {
        if (confirm('A shift for this date already exists. Do you want to replace it?')) {
            shifts.splice(existingShiftIndex, 1);
        } else {
            return;
        }
    }

    // 计算工时
    const shift = calculateShiftHours(date, startTime, endTime);
    shift.hourlyRate = hourlyRate;
    shifts.push(shift);
    
    // 按日期排序
    shifts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 更新显示
    updateShiftsTable();
    calculatePay();

    // 清空时间输入框（保留时薪）
    document.getElementById('workDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

// 计算班次工时
function calculateShiftHours(date, startTime, endTime) {
    const startDateTime = new Date(`${date}T${startTime}`);
    let endDateTime = new Date(`${date}T${endTime}`);
    
    // 如果结束时间小于开始时间，假设是跨天的班次
    if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    // 计算工作时长（小时）
    const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    
    return {
        date: date,
        startTime: startTime,
        endTime: endTime,
        hours: hours
    };
}

// 更新班次表格
function updateShiftsTable() {
    const tbody = document.getElementById('shiftsTableBody');
    tbody.innerHTML = '';
    
    shifts.forEach((shift, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${shift.date}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td>${shift.hours.toFixed(2)}</td>
            <td>$${shift.hourlyRate.toFixed(2)}</td>
            <td>$${(shift.hours * shift.hourlyRate).toFixed(2)}</td>
            <td>
                <button onclick="deleteShift(${index})" class="btn btn-danger btn-sm">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 删除班次
function deleteShift(index) {
    if (confirm('Are you sure you want to delete this shift?')) {
        shifts.splice(index, 1);
        updateShiftsTable();
        calculatePay();
    }
}

// 计算工资和扣除项
function calculatePay() {
    let totalHours = 0;
    let totalPay = 0;
    
    // 计算总工时和总收入
    shifts.forEach(shift => {
        totalHours += shift.hours;
        totalPay += shift.hours * shift.hourlyRate;
    });
    
    // 计算年化收入（基于两周）
    const annualizedIncome = totalPay * 26;
    
    // 计算CPP缴纳
    const cppContribution = Math.min(annualizedIncome * CPP_RATE, CPP_MAX_CONTRIBUTION) / 26;
    
    // 计算EI缴纳
    const eiContribution = Math.min(annualizedIncome * EI_RATE, EI_MAX_CONTRIBUTION) / 26;
    
    // 计算联邦税
    const federalTax = calculateTaxForBrackets(annualizedIncome, TAX_BRACKETS_FEDERAL) / 26;
    
    // 计算BC省税
    const provincialTax = calculateTaxForBrackets(annualizedIncome, TAX_BRACKETS_BC) / 26;
    
    // 更新显示
    document.getElementById('totalHours').textContent = totalHours.toFixed(2);
    document.getElementById('totalPay').textContent = totalPay.toFixed(2);
    document.getElementById('cppContribution').textContent = cppContribution.toFixed(2);
    document.getElementById('eiContribution').textContent = eiContribution.toFixed(2);
    document.getElementById('federalTax').textContent = federalTax.toFixed(2);
    document.getElementById('provincialTax').textContent = provincialTax.toFixed(2);
    
    const totalDeductions = cppContribution + eiContribution + federalTax + provincialTax;
    document.getElementById('totalDeductions').textContent = totalDeductions.toFixed(2);
    document.getElementById('netPay').textContent = (totalPay - totalDeductions).toFixed(2);
}

// 计算累进税率
function calculateTaxForBrackets(income, brackets) {
    let tax = 0;
    let previousThreshold = 0;
    
    for (const bracket of brackets) {
        if (income > previousThreshold) {
            const taxableInThisBracket = Math.min(income - previousThreshold, bracket.threshold - previousThreshold);
            tax += taxableInThisBracket * bracket.rate;
        }
        previousThreshold = bracket.threshold;
        if (income <= bracket.threshold) break;
    }
    
    return tax;
}

// 当页面加载完成时设置默认日期
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    document.getElementById('workDate').valueAsDate = today;
    document.getElementById('cycleStartDate').valueAsDate = today;
});
  }