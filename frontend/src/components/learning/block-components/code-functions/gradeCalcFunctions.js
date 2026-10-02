function toNumber(value) {
   const number = Number(value);

   return Number.isFinite(number)
      ? number
      : 0;
}

export function calculateGradeResult(
   functionName,
   values = []
) {
   const score = toNumber(values[0]);

   if (score >= 90) {
      return "A 🏆 Excellent!";
   }

   if (score >= 80) {
      return "B 👍 Great job!";
   }

   if (score >= 70) {
      return "C 🙂 Good effort!";
   }

   if (score >= 60) {
      return "D 📚 Keep practising!";
   }

   return "F ❌ Keep learning!";
}