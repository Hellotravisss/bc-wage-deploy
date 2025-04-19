if (typeof shifts !== 'undefined') { console.log('shifts exists'); } else {
  
// 存储所有班次信息
let shifts = [];

// CPP和EI费率（基于实际数据分析）
const CPP_RATE = 0.0570;  // 5.70%，基于实际数据
const EI_RATE = 0.0164;   // 1.64%，基于实际数据

// 联邦税率表（简化版，基于实际数据）
const FEDERAL_TAX_RATES = [
    { threshold: 0, rate: 0.1151 },      // 最低11.51%
    { threshold: 2900, rate: 0.1234 },   // $2900以上12.34%
    { threshold: 3300, rate: 0.1296 },   // $3300以上12.96%
    { threshold: 3400, rate: 0.1316 },   // $3400以上13.16%
    { threshold: 3600, rate: 0.1353 }    // $3600以上13.53%
];

// BC省税率表（简化版，基于实际数据）
const BC_TAX_RATES = [
    { threshold: 0, rate: 0.0466 },      // 最低4.66%
    { threshold: 2900, rate: 0.0494 },   // $2900以上4.94%
    { threshold: 3200, rate: 0.0501 },   // $3200以上5.01%
    { threshold: 3300, rate: 0.0515 },   // $3300以上5.15%
    { threshold: 3400, rate: 0.0522 },   // $3400以上5.22%
    { threshold: 3600, rate: 0.0534 }    // $3600以上5.34%
];

[... 保持其他函数不变，直到 calculatePay 函数 ...]

// 计算工资和扣除项
function calculatePay() {
    let totalHours = 0;
    let totalPay = 0;
    
    // 计算总工时和总收入
    shifts.forEach(shift => {
        totalHours += shift.hours;
        totalPay += shift.hours * shift.hourlyRate;
    });
    
    // 计算CPP缴纳（直接使用实际比例）
    const cppContribution = totalPay * CPP_RATE;
    
    // 计算EI缴纳（直接使用实际比例）
    const eiContribution = totalPay * EI_RATE;
    
    // 计算联邦税（使用简化的阶梯税率）
    let federalTax = 0;
    for (let i = FEDERAL_TAX_RATES.length - 1; i >= 0; i--) {
        if (totalPay >= FEDERAL_TAX_RATES[i].threshold) {
            federalTax = totalPay * FEDERAL_TAX_RATES[i].rate;
            break;
        }
    }
    
    // 计算BC省税（使用简化的阶梯税率）
    let provincialTax = 0;
    for (let i = BC_TAX_RATES.length - 1; i >= 0; i--) {
        if (totalPay >= BC_TAX_RATES[i].threshold) {
            provincialTax = totalPay * BC_TAX_RATES[i].rate;
            break;
        }
    }
    
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

[... 保持其他函数不变 ...]

}