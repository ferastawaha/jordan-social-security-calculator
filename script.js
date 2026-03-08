function getOldLawMandatoryRetirementAgeMonths(gender) {
  return gender === 'male' ? 720 : 660;
}

function formatAgeFromMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years} سنة`;
  }

  return `${years} سنة و ${months} أشهر`;
}

function getProjectedSubscriptions(currentSubscriptions, eligibilityDate) {
  const today = getToday();

  let months =
    (eligibilityDate.getFullYear() - today.getFullYear()) * 12 +
    (eligibilityDate.getMonth() - today.getMonth());

  if (eligibilityDate.getDate() < today.getDate()) {
    months -= 1;
  }

  return currentSubscriptions + Math.max(0, months);
}

function getExactDateAtAge(birthDate, targetAgeInMonths) {
  const years = Math.floor(targetAgeInMonths / 12);
  const months = targetAgeInMonths % 12;

  return new Date(
    birthDate.getFullYear() + years,
    birthDate.getMonth() + months,
    birthDate.getDate()
  );
}

function getEligibilityDateFromRequirements(birthDate, currentSubscriptions, requiredAgeMonths, requiredSubscriptions) {
  const ageDate = getExactDateAtAge(birthDate, requiredAgeMonths);

  const monthsUntilSubscriptions = getMonthsUntilSubscriptions(currentSubscriptions, requiredSubscriptions);
  const subscriptionsDate = addMonths(getToday(), monthsUntilSubscriptions);

  return ageDate > subscriptionsDate ? ageDate : subscriptionsDate;
}

// =========================
// 1) Elements
// =========================
const retirementForm = document.getElementById('retirementForm');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');

const birthDateInput = document.getElementById('birthDate');
const genderInput = document.getElementById('gender');
const subscriptionsInput = document.getElementById('subscriptions');
const dependentsInput = document.getElementById('dependents');
const avgSalary5YearsInput = document.getElementById('avgSalary5Years');
const avgSalary3YearsInput = document.getElementById('avgSalary3Years');

const appliedLawEl = document.getElementById('appliedLaw');
const eligibilityDateEl = document.getElementById('eligibilityDate');
const retirementTypeEl = document.getElementById('retirementType');
const resultReasonEl = document.getElementById('resultReason');

const oldBasicPensionEl = document.getElementById('oldBasicPension');
const oldDiscountPercentEl = document.getElementById('oldDiscountPercent');
const oldDiscountAmountEl = document.getElementById('oldDiscountAmount');
const oldDependentsAdditionEl = document.getElementById('oldDependentsAddition');
const oldGeneralIncreaseEl = document.getElementById('oldGeneralIncrease');
const oldFinalPensionEl = document.getElementById('oldFinalPension');

const newBasicPensionEl = document.getElementById('newBasicPension');
const newDiscountPercentEl = document.getElementById('newDiscountPercent');
const newDiscountAmountEl = document.getElementById('newDiscountAmount');
const newDependentsAdditionEl = document.getElementById('newDependentsAddition');
const newGeneralIncreaseEl = document.getElementById('newGeneralIncrease');
const newFinalPensionEl = document.getElementById('newFinalPension');

const monthlyDifferenceEl = document.getElementById('monthlyDifference');
const yearlyDifferenceEl = document.getElementById('yearlyDifference');
const subscriptionsAtEligibilityEl = document.getElementById('subscriptionsAtEligibility');
const oldUsedSubscriptionsEl = document.getElementById('oldUsedSubscriptions');
const newUsedSubscriptionsEl = document.getElementById('newUsedSubscriptions');
const oldMandatoryAgeEl = document.getElementById('oldMandatoryAge');
const oldDiscountReasonEl = document.getElementById('oldDiscountReason');

const newMandatoryAgeEl = document.getElementById('newMandatoryAge');
const newDiscountReasonEl = document.getElementById('newDiscountReason');

const printResultBtn = document.getElementById('printResultBtn');

printResultBtn.addEventListener('click', function () {
  window.print();
});

const shareResultBtn = document.getElementById('shareResultBtn');

shareResultBtn.addEventListener('click', function () {

  const resultText = document.getElementById('resultSection').innerText;

  if (navigator.share) {

    navigator.share({
      title: 'نتيجة حاسبة الضمان الاجتماعي',
      text: resultText,
      url: window.location.href
    });

  } else {

    const whatsappUrl =
      "https://wa.me/?text=" + encodeURIComponent(resultText + "\n\n" + window.location.href);

    window.open(whatsappUrl, '_blank');

  }

});

// =========================
// 2) Constants
// =========================
const LAW_START_DATE = new Date('2030-01-01T00:00:00');

// =========================
// 3) Helpers
// =========================
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getToday() {
  return startOfDay(new Date());
}

function parseBirthDate(value) {
  return new Date(value + 'T00:00:00');
}

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function addMonths(date, months) {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setMonth(result.getMonth() + months);

  if (result.getDate() < originalDay) {
    result.setDate(0);
  }

  return result;
}

function dateToArabic(date) {
  return new Intl.DateTimeFormat('ar-JO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function formatMoney(value) {
  return `${Number(value).toFixed(3)} د.أ`;
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

/**
function getSelectedCalculationType() {
  const selected = document.querySelector('input[name="calculationType"]:checked');
  return selected ? selected.value : 'earliest';
}**/

function getFormValues() {
  return {
    birthDateValue: birthDateInput.value,
    gender: genderInput.value,
    subscriptionsCount: Number(subscriptionsInput.value),
    dependentsCount: Number(dependentsInput.value),
    avgSalary5Years: Number(avgSalary5YearsInput.value),
    avgSalary3Years: Number(avgSalary3YearsInput.value)
  };
}

// =========================
// 4) Result UI helpers
// =========================
function showResultSection() {
  resultSection.classList.add('show');
}

function hideResultSection() {
  resultSection.classList.remove('show');
}

function setText(el, value) {
  el.textContent = value;
}

function resetResultFields() {
  setText(appliedLawEl, '—');
  setText(eligibilityDateEl, '—');
  setText(retirementTypeEl, '—');
  setText(resultReasonEl, '—');

  setText(oldBasicPensionEl, '—');
  setText(oldDiscountPercentEl, '—');
  setText(oldDiscountAmountEl, '—');
  setText(oldDependentsAdditionEl, '—');
  setText(oldGeneralIncreaseEl, '—');
  setText(oldFinalPensionEl, '—');

  setText(newBasicPensionEl, '—');
  setText(newDiscountPercentEl, '—');
  setText(newDiscountAmountEl, '—');
  setText(newDependentsAdditionEl, '—');
  setText(newGeneralIncreaseEl, '—');
  setText(newFinalPensionEl, '—');

  setText(monthlyDifferenceEl, '—');
  setText(yearlyDifferenceEl, '—');
  setText(subscriptionsAtEligibilityEl, '—');
  setText(oldUsedSubscriptionsEl, '—');
  setText(newUsedSubscriptionsEl, '—');
  setText(oldMandatoryAgeEl, '—');
setText(oldDiscountReasonEl, '—');

setText(newMandatoryAgeEl, '—');
setText(newDiscountReasonEl, '—');
}

function showBasicResult({
  appliedLaw,
  eligibilityDate,
  retirementType,
  reason,
  subscriptionsAtEligibility
}) {
  setText(appliedLawEl, appliedLaw);
  setText(eligibilityDateEl, dateToArabic(eligibilityDate));
  setText(retirementTypeEl, retirementType);
  setText(resultReasonEl, reason);
  setText(subscriptionsAtEligibilityEl, `${subscriptionsAtEligibility} اشتراك`);

  showResultSection();
}

// =========================
// 5) Validation
// =========================
function validateInputs(values) {
  const {
    birthDateValue,
    gender,
    subscriptionsCount,
    dependentsCount,
    avgSalary5Years,
    avgSalary3Years
  } = values;

  if (!birthDateValue) {
    alert('الرجاء إدخال تاريخ الميلاد.');
    return false;
  }

  const birthDate = parseBirthDate(birthDateValue);

  if (!isValidDate(birthDate)) {
    alert('تاريخ الميلاد غير صحيح.');
    return false;
  }

  if (birthDate > getToday()) {
    alert('تاريخ الميلاد لا يمكن أن يكون في المستقبل.');
    return false;
  }

  if (gender !== 'male' && gender !== 'female') {
    alert('الرجاء اختيار الجنس.');
    return false;
  }

  if (!Number.isFinite(subscriptionsCount) || subscriptionsCount < 0) {
    alert('الرجاء إدخال عدد اشتراكات صحيح.');
    return false;
  }

  if (!Number.isInteger(dependentsCount) || dependentsCount < 0 || dependentsCount > 3) {
    alert('عدد المعالين يجب أن يكون من 0 إلى 3.');
    return false;
  }

  if (!Number.isFinite(avgSalary5Years) || avgSalary5Years <= 0) {
    alert('الرجاء إدخال متوسط الراتب المتوقع آخر خمس سنوات بشكل صحيح.');
    return false;
  }

  if (!Number.isFinite(avgSalary3Years) || avgSalary3Years <= 0) {
    alert('الرجاء إدخال متوسط الراتب المتوقع آخر ثلاث سنوات بشكل صحيح.');
    return false;
  }

  return true;
}

// =========================
// 6) Reset
// =========================
resetBtn.addEventListener('click', function () {
  retirementForm.reset();
  resetResultFields();
  hideResultSection();
});

// =========================
// 7) Initial state
// =========================
resetResultFields();
hideResultSection();

// =========================
// 8) New law schedule
// =========================
const RETIREMENT_SCHEDULE = [
  { year: 2030, mandatoryRetirementAgeMenMonths: 726, mandatoryRetirementAgeWomenMonths: 666, earlyRetirementServiceMenMonths: 258, earlyRetirementServiceWomenMonths: 234 },
  { year: 2031, mandatoryRetirementAgeMenMonths: 732, mandatoryRetirementAgeWomenMonths: 672, earlyRetirementServiceMenMonths: 264, earlyRetirementServiceWomenMonths: 240 },
  { year: 2032, mandatoryRetirementAgeMenMonths: 738, mandatoryRetirementAgeWomenMonths: 678, earlyRetirementServiceMenMonths: 270, earlyRetirementServiceWomenMonths: 246 },
  { year: 2033, mandatoryRetirementAgeMenMonths: 744, mandatoryRetirementAgeWomenMonths: 684, earlyRetirementServiceMenMonths: 276, earlyRetirementServiceWomenMonths: 252 },
  { year: 2034, mandatoryRetirementAgeMenMonths: 750, mandatoryRetirementAgeWomenMonths: 690, earlyRetirementServiceMenMonths: 282, earlyRetirementServiceWomenMonths: 258 },
  { year: 2035, mandatoryRetirementAgeMenMonths: 756, mandatoryRetirementAgeWomenMonths: 696, earlyRetirementServiceMenMonths: 288, earlyRetirementServiceWomenMonths: 264 },
  { year: 2036, mandatoryRetirementAgeMenMonths: 762, mandatoryRetirementAgeWomenMonths: 702, earlyRetirementServiceMenMonths: 294, earlyRetirementServiceWomenMonths: 270 },
  { year: 2037, mandatoryRetirementAgeMenMonths: 768, mandatoryRetirementAgeWomenMonths: 708, earlyRetirementServiceMenMonths: 300, earlyRetirementServiceWomenMonths: 276 },
  { year: 2038, mandatoryRetirementAgeMenMonths: 774, mandatoryRetirementAgeWomenMonths: 714, earlyRetirementServiceMenMonths: 306, earlyRetirementServiceWomenMonths: 282 },
  { year: 2039, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 312, earlyRetirementServiceWomenMonths: 288 },
  { year: 2040, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 318, earlyRetirementServiceWomenMonths: 294 },
  { year: 2041, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 324, earlyRetirementServiceWomenMonths: 300 },
  { year: 2042, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 330, earlyRetirementServiceWomenMonths: 300 },
  { year: 2043, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 336, earlyRetirementServiceWomenMonths: 300 },
  { year: 2044, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 342, earlyRetirementServiceWomenMonths: 300 },
  { year: 2045, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 348, earlyRetirementServiceWomenMonths: 300 },
  { year: 2046, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 354, earlyRetirementServiceWomenMonths: 300 },
  { year: 2047, mandatoryRetirementAgeMenMonths: 780, mandatoryRetirementAgeWomenMonths: 720, earlyRetirementServiceMenMonths: 360, earlyRetirementServiceWomenMonths: 300 }
];

function getScheduleByYear(year) {
  if (year < 2030) {
    return null;
  }

  const schedule = RETIREMENT_SCHEDULE.find(item => item.year === year);
  if (schedule) {
    return schedule;
  }

  return RETIREMENT_SCHEDULE[RETIREMENT_SCHEDULE.length - 1];
}

// =========================
// 9) Age / months helpers
// =========================
function getAgeInMonthsOnDate(birthDate, targetDate) {
  let months =
    (targetDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (targetDate.getMonth() - birthDate.getMonth());

  if (targetDate.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

function getMonthsUntilAgeInMonths(birthDate, targetAgeInMonths, fromDate = getToday()) {
  const currentAgeInMonths = getAgeInMonthsOnDate(birthDate, fromDate);
  return Math.max(0, targetAgeInMonths - currentAgeInMonths);
}

function getMonthsUntilSubscriptions(currentSubscriptions, requiredSubscriptions) {
  return Math.max(0, requiredSubscriptions - currentSubscriptions);
}

// =========================
// 10) Old law eligibility
// =========================
function getOldLawOldAgeEligibility(gender, birthDate, currentSubscriptions) {
  const requiredAgeMonths = gender === 'male' ? 720 : 660; // 60 / 55
  const requiredSubscriptions = 180;

  const monthsUntilAge = getMonthsUntilAgeInMonths(birthDate, requiredAgeMonths);
  const monthsUntilSubscriptions = getMonthsUntilSubscriptions(currentSubscriptions, requiredSubscriptions);
  const monthsNeeded = Math.max(monthsUntilAge, monthsUntilSubscriptions);
  const eligibilityDate = addMonths(getToday(), monthsNeeded);

  return {
    law: 'old',
    retirementType: 'شيخوخة',
    label: 'الشيخوخة - القانون القديم',
    eligibilityDate,
    monthsNeeded,
    requiredAgeMonths,
    requiredSubscriptions
  };
}

function getOldLawEarlyEligibility(gender, birthDate, currentSubscriptions) {
  const condition1RequiredAgeMonths = 600; // 50 سنة
  const condition1RequiredSubscriptions = gender === 'male' ? 252 : 228;

  const condition1MonthsUntilAge = getMonthsUntilAgeInMonths(birthDate, condition1RequiredAgeMonths);
  const condition1MonthsUntilSubscriptions = getMonthsUntilSubscriptions(currentSubscriptions, condition1RequiredSubscriptions);
  const condition1MonthsNeeded = Math.max(condition1MonthsUntilAge, condition1MonthsUntilSubscriptions);
  const condition1EligibilityDate = addMonths(getToday(), condition1MonthsNeeded);

  const condition2RequiredAgeMonths = 540; // 45 سنة
  const condition2RequiredSubscriptions = 300;

  const condition2MonthsUntilAge = getMonthsUntilAgeInMonths(birthDate, condition2RequiredAgeMonths);
  const condition2MonthsUntilSubscriptions = getMonthsUntilSubscriptions(currentSubscriptions, condition2RequiredSubscriptions);
  const condition2MonthsNeeded = Math.max(condition2MonthsUntilAge, condition2MonthsUntilSubscriptions);
  const condition2EligibilityDate = addMonths(getToday(), condition2MonthsNeeded);

  const option1 = {
    law: 'old',
    retirementType: 'مبكر',
    label: gender === 'male'
      ? 'المبكر - القانون القديم (ذكر: 50 سنة + 252 اشتراك)'
      : 'المبكر - القانون القديم (أنثى: 50 سنة + 228 اشتراك)',
    eligibilityDate: condition1EligibilityDate,
    monthsNeeded: condition1MonthsNeeded,
    requiredAgeMonths: condition1RequiredAgeMonths,
    requiredSubscriptions: condition1RequiredSubscriptions
  };

  const option2 = {
    law: 'old',
    retirementType: 'مبكر',
    label: 'المبكر - القانون القديم (45 سنة + 300 اشتراك)',
    eligibilityDate: condition2EligibilityDate,
    monthsNeeded: condition2MonthsNeeded,
    requiredAgeMonths: condition2RequiredAgeMonths,
    requiredSubscriptions: condition2RequiredSubscriptions
  };

  return option1.eligibilityDate <= option2.eligibilityDate ? option1 : option2;
}

// =========================
// 11) New law eligibility
// =========================
function getNewLawOldAgeEligibility(gender, birthDate, currentSubscriptions) {
  const startYear = Math.max(2030, getToday().getFullYear());

  for (let year = startYear; year <= 2100; year += 1) {
    const schedule = getScheduleByYear(year);

    const requiredAgeMonths = gender === 'male'
      ? schedule.mandatoryRetirementAgeMenMonths
      : schedule.mandatoryRetirementAgeWomenMonths;

    const requiredSubscriptions = 180;

    const endOfYear = new Date(year, 11, 31);
    const ageInMonthsAtEndOfYear = getAgeInMonthsOnDate(birthDate, endOfYear);
    const currentSubscriptionsAtEndOfYear =
      currentSubscriptions +
      Math.max(0, (year - getToday().getFullYear()) * 12);

    const ageReady = ageInMonthsAtEndOfYear >= requiredAgeMonths;
    const subscriptionsReady = currentSubscriptionsAtEndOfYear >= requiredSubscriptions;

    if (ageReady && subscriptionsReady) {
      const monthsUntilAge = getMonthsUntilAgeInMonths(birthDate, requiredAgeMonths);
      const monthsUntilSubscriptions = getMonthsUntilSubscriptions(currentSubscriptions, requiredSubscriptions);
      const monthsNeeded = Math.max(monthsUntilAge, monthsUntilSubscriptions);
      const eligibilityDate = addMonths(getToday(), monthsNeeded);

      if (eligibilityDate.getFullYear() === year || eligibilityDate.getFullYear() < year) {
        return {
          law: 'new',
          retirementType: 'شيخوخة',
          label: 'الشيخوخة - القانون الجديد',
          eligibilityDate,
          monthsNeeded,
          requiredAgeMonths,
          requiredSubscriptions,
          scheduleYear: year
        };
      }
    }
  }

  return null;
}

function getNewLawEarlyEligibility(gender, birthDate, currentSubscriptions) {
  const today = getToday();
  const options = [];

  for (let year = 2030; year <= 2100; year += 1) {
    const schedule = getScheduleByYear(year);

    const requiredServiceMonths = gender === 'male'
      ? schedule.earlyRetirementServiceMenMonths
      : schedule.earlyRetirementServiceWomenMonths;

    const mandatoryRetirementAgeMonths = gender === 'male'
      ? schedule.mandatoryRetirementAgeMenMonths
      : schedule.mandatoryRetirementAgeWomenMonths;

    // المسار 1:
    // عمر 50 أو أكثر + خدمة الجدول
    const age50Months = 600;
    const option1EligibilityDate = getEligibilityDateFromRequirements(
      birthDate,
      currentSubscriptions,
      age50Months,
      requiredServiceMonths
    );

    if (option1EligibilityDate <= new Date(year, 11, 31)) {
      options.push({
        law: 'new',
        retirementType: 'مبكر',
        label: 'المبكر - القانون الجديد (50 سنة + خدمة الجدول)',
        eligibilityDate: option1EligibilityDate < LAW_START_DATE ? LAW_START_DATE : option1EligibilityDate,
        requiredAgeMonths: age50Months,
        requiredSubscriptions: requiredServiceMonths,
        mandatoryRetirementAgeMonths,
        scheduleYear: year
      });
      break;
    }

    // المسار 2:
    // أقل من 50: عمر 45 أو أكثر + 300 اشتراك
    const age45Months = 540;
    const option2EligibilityDate = getEligibilityDateFromRequirements(
      birthDate,
      currentSubscriptions,
      age45Months,
      300
    );

    const ageAtOption2InMonths = getAgeInMonthsOnDate(birthDate, option2EligibilityDate);

    if (
      option2EligibilityDate <= new Date(year, 11, 31) &&
      ageAtOption2InMonths < 600
    ) {
      options.push({
        law: 'new',
        retirementType: 'مبكر',
        label: 'المبكر - القانون الجديد (أقل من 50: 45 سنة + 300 اشتراك)',
        eligibilityDate: option2EligibilityDate < LAW_START_DATE ? LAW_START_DATE : option2EligibilityDate,
        requiredAgeMonths: age45Months,
        requiredSubscriptions: 300,
        mandatoryRetirementAgeMonths,
        scheduleYear: year
      });
      break;
    }
  }

  if (options.length === 0) {
    return null;
  }

  options.sort((a, b) => a.eligibilityDate - b.eligibilityDate);
  return options[0];
}
// =========================
// 12) Main eligibility selectors
// =========================
function getEarliestEligibility(gender, birthDate, currentSubscriptions) {
  const oldEarly = getOldLawEarlyEligibility(gender, birthDate, currentSubscriptions);
  const oldAge = getOldLawOldAgeEligibility(gender, birthDate, currentSubscriptions);

  return oldEarly.eligibilityDate <= oldAge.eligibilityDate ? oldEarly : oldAge;
}

function getSelectedEligibility(calculationType, gender, birthDate, currentSubscriptions, appliedLaw) {
  if (appliedLaw === 'old') {
    if (calculationType === 'early') {
      return getOldLawEarlyEligibility(gender, birthDate, currentSubscriptions);
    }

    if (calculationType === 'oldAge') {
      return getOldLawOldAgeEligibility(gender, birthDate, currentSubscriptions);
    }

    return getEarliestEligibility(gender, birthDate, currentSubscriptions);
  }

  if (calculationType === 'early') {
    return getNewLawEarlyEligibility(gender, birthDate, currentSubscriptions);
  }

  if (calculationType === 'oldAge') {
    return getNewLawOldAgeEligibility(gender, birthDate, currentSubscriptions);
  }

  const newEarly = getNewLawEarlyEligibility(gender, birthDate, currentSubscriptions);
  const newOldAge = getNewLawOldAgeEligibility(gender, birthDate, currentSubscriptions);

  return newEarly.eligibilityDate <= newOldAge.eligibilityDate ? newEarly : newOldAge;
}

function determineAppliedLaw(gender, birthDate, currentSubscriptions) {
  const earliestOldLawEligibility = getEarliestEligibility(gender, birthDate, currentSubscriptions);

  if (earliestOldLawEligibility.eligibilityDate < LAW_START_DATE) {
    return {
      appliedLaw: 'old',
      firstEligibility: earliestOldLawEligibility
    };
  }

  const newLawEligibility = getSelectedEligibility('earliest', gender, birthDate, currentSubscriptions, 'new');

  return {
    appliedLaw: 'new',
    firstEligibility: newLawEligibility
  };
}

// =========================
// 13) Pension calculation helpers
// =========================
function calculateBasePension(avgSalary, subscriptionsCount) {
  let basePension = 0;

  if (avgSalary <= 1500) {
    basePension = (avgSalary * subscriptionsCount) / 480;
  } else {
    const pensionUnder1500 = (1500 * subscriptionsCount) / 480;
    const pensionAbove1500 = ((avgSalary - 1500) * subscriptionsCount) / 600;
    basePension = pensionUnder1500 + pensionAbove1500;
  }

  return Number(basePension.toFixed(3));
}

function getOldLawEarlyDiscountPercentage(ageYears, gender) {
  let discount = 0;

  if (gender === 'male') {
    if (ageYears >= 45 && ageYears < 46) discount = 0.20;
    else if (ageYears >= 46 && ageYears < 47) discount = 0.18;
    else if (ageYears >= 47 && ageYears < 48) discount = 0.16;
    else if (ageYears >= 48 && ageYears < 49) discount = 0.14;
    else if (ageYears >= 49 && ageYears < 50) discount = 0.12;
    else if (ageYears >= 50 && ageYears < 51) discount = 0.11;
    else if (ageYears >= 51 && ageYears < 52) discount = 0.10;
    else if (ageYears >= 52 && ageYears < 53) discount = 0.09;
    else if (ageYears >= 53 && ageYears < 54) discount = 0.08;
    else if (ageYears >= 54 && ageYears < 55) discount = 0.07;
    else if (ageYears >= 55 && ageYears < 56) discount = 0.06;
    else if (ageYears >= 56 && ageYears < 57) discount = 0.05;
    else if (ageYears >= 57 && ageYears < 58) discount = 0.04;
    else if (ageYears >= 58 && ageYears < 59) discount = 0.03;
    else if (ageYears >= 59 && ageYears < 60) discount = 0.02;
  } else if (gender === 'female') {
    if (ageYears >= 45 && ageYears < 46) discount = 0.14;
    else if (ageYears >= 46 && ageYears < 47) discount = 0.12;
    else if (ageYears >= 47 && ageYears < 48) discount = 0.10;
    else if (ageYears >= 48 && ageYears < 49) discount = 0.08;
    else if (ageYears >= 49 && ageYears < 50) discount = 0.06;
    else if (ageYears >= 50 && ageYears < 51) discount = 0.04;
    else if (ageYears >= 51 && ageYears < 52) discount = 0.02;
  }

  return discount;
}

function getNewLawEarlyDiscountPercentage(eligibilityInfo, birthDate) {
  if (eligibilityInfo.retirementType !== 'مبكر') {
    return 0;
  }

  const retirementAgeInMonths = getAgeInMonthsOnDate(birthDate, eligibilityInfo.eligibilityDate);
  const mandatoryRetirementAgeMonths = eligibilityInfo.mandatoryRetirementAgeMonths;

  if (!mandatoryRetirementAgeMonths || retirementAgeInMonths >= mandatoryRetirementAgeMonths) {
    return 0;
  }

  const differenceInMonths = mandatoryRetirementAgeMonths - retirementAgeInMonths;
  const differenceInYears = differenceInMonths / 12;
  const discount = differenceInYears * 0.04;

  return Number(discount.toFixed(4));
}

function calculateDependentsAddition(pensionAfterDiscount, dependentsCount) {
  let dependentsAddition = 0;

  if (dependentsCount >= 1) {
    dependentsAddition += Math.min(pensionAfterDiscount * 0.12, 100);
  }

  if (dependentsCount >= 2) {
    dependentsAddition += Math.min(pensionAfterDiscount * 0.06, 25);
  }

  if (dependentsCount >= 3) {
    dependentsAddition += Math.min(pensionAfterDiscount * 0.06, 25);
  }

  return Number(dependentsAddition.toFixed(3));
}

function getGeneralIncrease(retirementType) {
  return retirementType === 'مبكر' ? 20 : 40;
}

function getAgeYearsAtEligibility(birthDate, eligibilityDate) {
  return getAgeInMonthsOnDate(birthDate, eligibilityDate) / 12;
}

// =========================
// 14) Old / New pension calculators
// =========================

function calculateOldLawPension({
  gender,
  birthDate,
  dependentsCount,
  avgSalary5Years,
  avgSalary3Years,
  eligibilityInfo,
  usedSubscriptions
}) {
  const avgSalary = eligibilityInfo.retirementType === 'مبكر'
    ? avgSalary5Years
    : avgSalary3Years;

  const basePension = calculateBasePension(avgSalary, usedSubscriptions);

  const mandatoryRetirementAgeMonths = getOldLawMandatoryRetirementAgeMonths(gender);

  let discountPercentage = 0;
  let discountReason = 'لا يوجد خصم لأنه تقاعد شيخوخة.';

  if (eligibilityInfo.retirementType === 'مبكر') {
    const ageYears = getAgeYearsAtEligibility(birthDate, eligibilityInfo.eligibilityDate);
    discountPercentage = getOldLawEarlyDiscountPercentage(ageYears, gender);

    discountReason = `تم تطبيق خصم التقاعد المبكر حسب جدول القانون القديم، لأن التقاعد قبل سن الشيخوخة الوجوبي (${formatAgeFromMonths(mandatoryRetirementAgeMonths)}).`;
  }

  const discountAmount = Number((basePension * discountPercentage).toFixed(3));
  const pensionAfterDiscount = Number((basePension - discountAmount).toFixed(3));
  const dependentsAddition = calculateDependentsAddition(pensionAfterDiscount, dependentsCount);
  const generalIncrease = getGeneralIncrease(eligibilityInfo.retirementType);

  const finalPension = Number(
    (pensionAfterDiscount + dependentsAddition + generalIncrease).toFixed(3)
  );

  return {
    avgSalary,
    usedSubscriptions,
    mandatoryRetirementAgeMonths,
    basePension,
    discountPercentage,
    discountReason,
    discountAmount,
    pensionAfterDiscount,
    dependentsAddition,
    generalIncrease,
    finalPension
  };
}

function calculateNewLawPension({
  birthDate,
  dependentsCount,
  avgSalary5Years,
  eligibilityInfo,
  usedSubscriptions
}) {
  const avgSalary = avgSalary5Years;
  const basePension = calculateBasePension(avgSalary, usedSubscriptions);

  let discountPercentage = 0;
  let discountReason = 'لا يوجد خصم لأنه تقاعد شيخوخة.';
  let mandatoryRetirementAgeMonths = eligibilityInfo.mandatoryRetirementAgeMonths || null;

  if (eligibilityInfo.retirementType === 'مبكر') {
    discountPercentage = getNewLawEarlyDiscountPercentage(eligibilityInfo, birthDate);

    const retirementAgeInMonths = getAgeInMonthsOnDate(birthDate, eligibilityInfo.eligibilityDate);
    const differenceInMonths = mandatoryRetirementAgeMonths - retirementAgeInMonths;
    const differenceInYears = differenceInMonths / 12;

    discountReason = `تم تطبيق خصم ${Number(discountPercentage * 100).toFixed(1)}% لأن التقاعد يسبق سن الشيخوخة الوجوبي (${formatAgeFromMonths(mandatoryRetirementAgeMonths)}) بمقدار ${differenceInYears.toFixed(1)} سنة، وبواقع 4% عن كل سنة.`;
  } else if (mandatoryRetirementAgeMonths) {
    discountReason = `لا يوجد خصم لأنه تقاعد شيخوخة، وسن الشيخوخة الوجوبي المعتمد هو ${formatAgeFromMonths(mandatoryRetirementAgeMonths)} حسب سنة الاستحقاق.`;
  }

  const discountAmount = Number((basePension * discountPercentage).toFixed(3));
  const pensionAfterDiscount = Number((basePension - discountAmount).toFixed(3));
  const dependentsAddition = calculateDependentsAddition(pensionAfterDiscount, dependentsCount);
  const generalIncrease = getGeneralIncrease(eligibilityInfo.retirementType);

  const finalPension = Number(
    (pensionAfterDiscount + dependentsAddition + generalIncrease).toFixed(3)
  );

  return {
    avgSalary,
    usedSubscriptions,
    mandatoryRetirementAgeMonths,
    basePension,
    discountPercentage,
    discountReason,
    discountAmount,
    pensionAfterDiscount,
    dependentsAddition,
    generalIncrease,
    finalPension
  };
}

// =========================
// 15) Comparison builder
// =========================
function buildPensionComparison(values, appliedLawResult) {
  const {
  birthDateValue,
  gender,
  subscriptionsCount,
  dependentsCount,
  avgSalary5Years,
  avgSalary3Years
} = values;

  const birthDate = parseBirthDate(birthDateValue);

  const oldEligibility = getSelectedEligibility(
  'earliest',
  gender,
  birthDate,
  subscriptionsCount,
  'old'
);

  const newEligibility = getSelectedEligibility(
  'earliest',
  gender,
  birthDate,
  subscriptionsCount,
  'new'
);

  if (!oldEligibility || !newEligibility) {
    throw new Error('تعذر تحديد تاريخ الاستحقاق لأحد القانونين.');
  }

  // هذا هو الأساس الذي طلبته:
  // نفس عدد الاشتراكات يُستخدم في القديم والجديد
  // ويؤخذ من تاريخ الاستحقاق الفعلي للنظام المطبق
  const usedSubscriptions = getProjectedSubscriptions(
    subscriptionsCount,
    appliedLawResult.firstEligibility.eligibilityDate
  );

  const oldLawPension = calculateOldLawPension({
    gender,
    birthDate,
    dependentsCount,
    avgSalary5Years,
    avgSalary3Years,
    eligibilityInfo: oldEligibility,
    usedSubscriptions
  });

  const newLawPension = calculateNewLawPension({
    birthDate,
    dependentsCount,
    avgSalary5Years,
    eligibilityInfo: newEligibility,
    usedSubscriptions
  });

  const monthlyDifference = Number(
    (oldLawPension.finalPension - newLawPension.finalPension).toFixed(3)
  );

  const yearlyDifference = Number((monthlyDifference * 12).toFixed(3));

  return {
    appliedLawResult,
    oldEligibility,
    newEligibility,
    oldLawPension,
    newLawPension,
    monthlyDifference,
    yearlyDifference,
    subscriptionsAtAppliedEligibility: usedSubscriptions
  };
}
// =========================
// 16) Fill result UI
// =========================
function fillPensionCard(cardType, pensionData) {
  if (cardType === 'old') {
    setText(oldUsedSubscriptionsEl, `${pensionData.usedSubscriptions} اشتراك`);
    setText(oldMandatoryAgeEl, formatAgeFromMonths(pensionData.mandatoryRetirementAgeMonths));
    setText(oldDiscountReasonEl, pensionData.discountReason);
    setText(oldBasicPensionEl, formatMoney(pensionData.basePension));
    setText(oldDiscountPercentEl, formatPercent(pensionData.discountPercentage * 100));
    setText(oldDiscountAmountEl, formatMoney(pensionData.discountAmount));
    setText(oldDependentsAdditionEl, formatMoney(pensionData.dependentsAddition));
    setText(oldGeneralIncreaseEl, formatMoney(pensionData.generalIncrease));
    setText(oldFinalPensionEl, formatMoney(pensionData.finalPension));
    return;
  }

  setText(newUsedSubscriptionsEl, `${pensionData.usedSubscriptions} اشتراك`);
  setText(
    newMandatoryAgeEl,
    pensionData.mandatoryRetirementAgeMonths
      ? formatAgeFromMonths(pensionData.mandatoryRetirementAgeMonths)
      : '—'
  );
  setText(newDiscountReasonEl, pensionData.discountReason);
  setText(newBasicPensionEl, formatMoney(pensionData.basePension));
  setText(newDiscountPercentEl, formatPercent(pensionData.discountPercentage * 100));
  setText(newDiscountAmountEl, formatMoney(pensionData.discountAmount));
  setText(newDependentsAdditionEl, formatMoney(pensionData.dependentsAddition));
  setText(newGeneralIncreaseEl, formatMoney(pensionData.generalIncrease));
  setText(newFinalPensionEl, formatMoney(pensionData.finalPension));
}
function getAppliedLawLabel(appliedLaw) {
  return appliedLaw === 'old' ? 'القانون القديم' : 'القانون الجديد';
}

function buildReasonText(appliedLawResult) {
  const appliedLawLabel = getAppliedLawLabel(appliedLawResult.appliedLaw);
  const dateText = dateToArabic(appliedLawResult.firstEligibility.eligibilityDate);

  if (appliedLawResult.appliedLaw === 'old') {
    return `أول استحقاق متوقع لك هو بتاريخ ${dateText}، وهو قبل 01/01/2030، لذلك يشملك ${appliedLawLabel}.`;
  }

  return `أول استحقاق متوقع لك هو بتاريخ ${dateText}، وهو في 01/01/2030 أو بعده، لذلك يشملك ${appliedLawLabel}.`;
}

function fillComparisonResult(comparisonData) {
  const {
    appliedLawResult,
    oldEligibility,
    newEligibility,
    oldLawPension,
    newLawPension,
    monthlyDifference,
    yearlyDifference,
    subscriptionsAtAppliedEligibility
  } = comparisonData;

  showBasicResult({
    appliedLaw: getAppliedLawLabel(appliedLawResult.appliedLaw),
    eligibilityDate: appliedLawResult.firstEligibility.eligibilityDate,
    retirementType: appliedLawResult.firstEligibility.retirementType,
    reason: buildReasonText(appliedLawResult),
    subscriptionsAtEligibility: subscriptionsAtAppliedEligibility
  });

  fillPensionCard('old', oldLawPension);
  fillPensionCard('new', newLawPension);

  setText(monthlyDifferenceEl, formatMoney(monthlyDifference));
  setText(yearlyDifferenceEl, formatMoney(yearlyDifference));
}

// =========================
// 17) Submit handler
// =========================
retirementForm.addEventListener('submit', function (event) {
  event.preventDefault();

  resetResultFields();
  hideResultSection();

  const values = getFormValues();

  if (!validateInputs(values)) {
    return;
  }

  const birthDate = parseBirthDate(values.birthDateValue);

  const appliedLawResult = determineAppliedLaw(
    values.gender,
    birthDate,
    values.subscriptionsCount
  );

  const comparisonData = buildPensionComparison(values, appliedLawResult);

  fillComparisonResult(comparisonData);
});

// =========================
// 18) Optional debug test
// =========================
// console.log('script loaded successfully');