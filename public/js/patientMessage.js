// Plantilla del mensaje que la profesional le envía al paciente junto
// con su link (por WhatsApp, mail, etc.). Se arma según el tipo de
// seguimiento del paciente, para no mencionar secciones que no tiene.

export function buildPatientMessage(patientName, trackingType, link) {
  const hasHabitos = trackingType === 'alimentos_habitos';
  const sectionCount = hasHabitos ? 'tres' : 'dos';

  const habitosBlock = hasHabitos
    ? '🌱 Hábitos: un recorrido de 21 días con preguntas conscientes para reflexionar sobre tu historia personal, tu vínculo con la comida y tus hábitos. La propuesta es que puedas conocerte un poco más y observar tu relación con la alimentación sin juicios.\n\n'
    : '';

  return `¡Hola, ${patientName}! 💛 Te comparto este link con diferentes herramientas que pueden acompañarte durante este proceso.

Dentro vas a encontrar ${sectionCount} secciones para explorar y utilizar a tu ritmo:

${habitosBlock}📋 Menú semanal: una herramienta para ayudarte a organizar y planificar tus comidas de manera práctica y flexible.

🛒 Selección de alimentos: una guía para acompañarte a la hora de elegir alimentos y armar tus comidas de forma más consciente.

Podés volver a este material cada vez que lo necesites y recorrerlo a tu propio ritmo.

${link}`;
}
