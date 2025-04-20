// 全局变量
let shifts = [];

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
    startDate.setHours(0, 0, 0, 0);

    // 添加两周的班次
    for (let day = 0; day < 14; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        const dayOfWeek = currentDate.getDay();
        
        if (workDays.includes(dayOfWeek)) {
            const dateString = currentDate.toISOString().split('T')[0];
            const shift = calculateShiftHours(dateString, defaultStartTime, defaultEndTime);
            shift.hourlyRate = hourlyRate;
            shifts.push(shift);
        }
    }
    
    shifts.sort((a, b) => new Date(a.date) - new Date(b.date));
    updateShiftsTable();
    calculatePay();
}

// 添加单个班次
function addShift() {
    const date = document.getElementById('workDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);

    if (!date || !startTime || !endTime || !hourlyRate) {
        alert('Please fill in all required fields!');
        return;
    }

    const existingShiftIndex = shifts.findIndex(shift => shift.date === date);
    if (existingShiftIndex !== -1) {
        if (confirm('A shift for this date already exists. Do you want to replace it?')) {
            shifts.splice(existingShiftIndex, 1);
        } else {
            return;
        }
    }

    const shift = calculateShiftHours(date, startTime, endTime);
    shift.hourlyRate = hourlyRate;
    shifts.push(shift);
    
    shifts.sort((a, b) => new Date(a.date) - new Date(b.date));
    updateShiftsTable();
    calculatePay();

    document.getElementById('workDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

// 计算工作时间
function calculateShiftHours(date, startTime, endTime) {
    const start = new Date(`${date}T${startTime}`);
    let end = new Date(`${date}T${endTime}`);
    
    if (end < start) {
        end = new Date(`${date}T${endTime}`);
        end.setDate(end.getDate() + 1);
    }

    const totalHours = (end - start) / (1000 * 60 * 60);
    let nightHours = 0;
    let currentTime = new Date(start);
    
    while (currentTime < end) {
        const hour = currentTime.getHours();
        if (hour >= 23 || hour < 7) {
            nightHours += 1;
        }
        currentTime.setHours(currentTime.getHours() + 1);
    }

    let regularHours = Math.min(8, totalHours);
    let overtime15 = Math.max(0, Math.min(totalHours - 8, 4));
    let overtime2 = Math.max(0, totalHours - 12);

    return {
        date,
        startTime,
        endTime,
        regularHours,
        overtime15,
        overtime2,
        nightHours
    };
}

// 更新班次表格
function updateShiftsTable() {
    const tbody = document.getElementById('shiftsTableBody');
    tbody.innerHTML = '';
    
    shifts.forEach((shift, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${shift.date}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td>${shift.regularHours.toFixed(2)}</td>
            <td>${shift.overtime15.toFixed(2)}</td>
            <td>${shift.overtime2.toFixed(2)}</td>
            <td>${shift.nightHours.toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeShift(${index})">Delete</button></td>
        `;
    });
}

// 删除班次
function removeShift(index) {
    shifts.splice(index, 1);
    updateShiftsTable();
    calculatePay();
}

// 清空所有班次
function clearAllShifts() {
    if (confirm('Are you sure you want to clear all shifts?')) {
        shifts = [];
        updateShiftsTable();
        calculatePay();
    }
}

// 计算工资
function calculatePay() {
    let totalRegular = 0;
    let totalOvertime15 = 0;
    let totalOvertime2 = 0;
    let totalNight = 0;

    const nightPremiumRate = parseFloat(document.getElementById('nightPremiumRate').value) || 0;

    shifts.forEach(shift => {
        const rate = shift.hourlyRate;
        totalRegular += shift.regularHours * rate;
        totalOvertime15 += shift.overtime15 * rate * 1.5;
        totalOvertime2 += shift.overtime2 * rate * 2;
        totalNight += shift.nightHours * nightPremiumRate;
    });

    const grossPay = Math.round((totalRegular + totalOvertime15 + totalOvertime2 + totalNight) * 100) / 100;

    // 使用实际数据的百分比
    const cpp = Math.round(grossPay * 0.0570 * 100) / 100;  // 5.70%
    const ei = Math.round(grossPay * 0.0164 * 100) / 100;   // 1.64%
    const federalTax = Math.round(grossPay * 0.1256 * 100) / 100;  // 12.56%
    const provincialTax = Math.round(grossPay * 0.0501 * 100) / 100;  // 5.01%

    // 更新显示
    document.getElementById('regularPay').textContent = `$${totalRegular.toFixed(2)}`;
    document.getElementById('overtimePay15').textContent = `$${totalOvertime15.toFixed(2)}`;
    document.getElementById('overtimePay2').textContent = `$${totalOvertime2.toFixed(2)}`;
    document.getElementById('nightDiffPay').textContent = `$${totalNight.toFixed(2)}`;
    document.getElementById('totalGross').textContent = `$${grossPay.toFixed(2)}`;
    
    document.getElementById('cpp').textContent = `$${cpp.toFixed(2)}`;
    document.getElementById('ei').textContent = `$${ei.toFixed(2)}`;
    document.getElementById('federalTax').textContent = `$${federalTax.toFixed(2)}`;
    document.getElementById('provincialTax').textContent = `$${provincialTax.toFixed(2)}`;
    
    const totalDeductions = Math.round((cpp + ei + federalTax + provincialTax) * 100) / 100;
    const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
    
    document.getElementById('totalDeductions').textContent = `$${totalDeductions.toFixed(2)}`;
    document.getElementById('netPay').textContent = `$${netPay.toFixed(2)}`;
}

// 设置默认时间
function setDefaultTimes() {
    const defaultStart = document.getElementById('defaultStartTime').value;
    const defaultEnd = document.getElementById('defaultEndTime').value;
    
    if (defaultStart) {
        document.getElementById('startTime').value = defaultStart;
    }
    if (defaultEnd) {
        document.getElementById('endTime').value = defaultEnd;
    }
}

// 获取下一个工作日日期
function getNextDate(dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const targetDay = days.indexOf(dayName.toLowerCase());
    const todayDay = today.getDay();
    
    let daysUntilTarget = targetDay - todayDay;
    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toISOString().split('T')[0];
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const setDefaultTimesBtn = document.getElementById('setDefaultTimesBtn');
    const addShiftBtn = document.getElementById('addShiftBtn');
    
    if (setDefaultTimesBtn) setDefaultTimesBtn.addEventListener('click', setDefaultTimes);
    if (addShiftBtn) addShiftBtn.addEventListener('click', addShift);

    document.querySelectorAll('.workday-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const day = this.getAttribute('data-day');
            const startTimeInput = document.getElementById('defaultStartTime');
            const endTimeInput = document.getElementById('defaultEndTime');
            
            if (this.checked && startTimeInput?.value && endTimeInput?.value) {
                const date = getNextDate(day);
                document.getElementById('shiftDate').value = date;
                document.getElementById('startTime').value = startTimeInput.value;
                document.getElementById('endTime').value = endTimeInput.value;
            }
        });
    });
});