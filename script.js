
function calculateFederalTax(income) {
  let tax = 0;
  const brackets = [
    { limit: 55867, rate: 0.15 },
    { limit: 111733, rate: 0.205 },
    { limit: 173205, rate: 0.26 },
    { limit: 246752, rate: 0.29 },
    { limit: Infinity, rate: 0.33 }
  ];
  let prevLimit = 0;
  for (const bracket of brackets) {
    if (income > bracket.limit) {
      tax += (bracket.limit - prevLimit) * bracket.rate;
      prevLimit = bracket.limit;
    } else {
      tax += (income - prevLimit) * bracket.rate;
      break;
    }
  }
  return tax;
}

function calculateBCTax(income) {
  let tax = 0;
  const brackets = [
    { limit: 45654, rate: 0.0506 },
    { limit: 91310, rate: 0.077 },
    { limit: 104835, rate: 0.105 },
    { limit: 127299, rate: 0.1229 },
    { limit: 172602, rate: 0.147 },
    { limit: Infinity, rate: 0.168 }
  ];
  let prevLimit = 0;
  for (const bracket of brackets) {
    if (income > bracket.limit) {
      tax += (bracket.limit - prevLimit) * bracket.rate;
      prevLimit = bracket.limit;
    } else {
      tax += (income - prevLimit) * bracket.rate;
      break;
    }
  }
  return tax;
}

function calculateCPP(income) {
  const exemption = 3500;
  const maxContributable = 68500;
  const rate = 0.0595;
  const maxCPP = 3754.45;
  const contributable = Math.min(Math.max(income - exemption, 0), maxContributable - exemption);
  return Math.min(contributable * rate, maxCPP);
}

function calculateEI(income) {
  const rate = 0.0166;
  const maxInsurable = 63500;
  const maxEI = 1074.04;
  return Math.min(income * rate, maxEI);
}

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

  const cpp = calculateCPP(grossPay);
  const ei = calculateEI(grossPay);
  const federalTax = calculateFederalTax(grossPay / 26); // bi-weekly
  const provincialTax = calculateBCTax(grossPay / 26);

  const totalDeductions = cpp + ei + federalTax + provincialTax;
  const netPay = grossPay - totalDeductions;

  document.getElementById('regularPay').textContent = `$${totalRegular.toFixed(2)}`;
  document.getElementById('overtimePay15').textContent = `$${totalOvertime15.toFixed(2)}`;
  document.getElementById('overtimePay2').textContent = `$${totalOvertime2.toFixed(2)}`;
  document.getElementById('nightDiffPay').textContent = `$${totalNight.toFixed(2)}`;
  document.getElementById('totalGross').textContent = `$${grossPay.toFixed(2)}`;
  document.getElementById('cpp').textContent = `$${cpp.toFixed(2)}`;
  document.getElementById('ei').textContent = `$${ei.toFixed(2)}`;
  document.getElementById('federalTax').textContent = `$${federalTax.toFixed(2)}`;
  document.getElementById('provincialTax').textContent = `$${provincialTax.toFixed(2)}`;
  document.getElementById('totalDeductions').textContent = `$${totalDeductions.toFixed(2)}`;
  document.getElementById('netPay').textContent = `$${netPay.toFixed(2)}`;

  console.log("✅ 使用真实分段税率完成计算，税后工资 =", netPay.toFixed(2));
}
