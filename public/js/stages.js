// Estructura del "Diario de 21 días" — 3 etapas de 7 días cada una.
// Cada día tiene UNA consigna/reflexión para responder.
// No cambies los números de "stage"/"day" una vez que haya pacientes
// con respuestas guardadas, o vas a perder la referencia.

export const STAGES = [
  {
    stage: 1,
    stageRoman: 'I',
    title: 'Reconocer el hambre',
    titleRegular: 'Reconocer el ',
    titleItalic: 'hambre',
    headline: 'Herramientas para conocer tu conducta con el alimento',
    completionMessage: '¡Completaste la Etapa 1! Diste el primer paso para reconocer tu hambre real. Cuando estés lista, avanzá a la Etapa 2.',
    days: [
      { day: 1, intro: 'Existen distintas formas de sentir hambre:<br><br><strong>Hambre físico:</strong> aparece de a poco, se siente como un vacío o una baja de energía; es una necesidad real de comer. No es selectivo, y se calma después de comer.<br><br><strong>Hambre emocional:</strong> aparece junto con una emoción (tristeza, ansiedad, enojo, aburrimiento). Buscamos aliviar esa emoción, no es una necesidad física.<br><br><strong>Hambre por antojo:</strong> es el deseo intenso de un alimento específico (chocolate, pan, etc.), aunque no haya hambre físico.<br><br><strong>Hambre visual o por aromas:</strong> aparece al ver imágenes de comida o sentir olores conocidos. Es un deseo, no una necesidad física.<br><br><strong>Hambre social:</strong> aparece al compartir una comida con otras personas, incluso sin registrar si hay hambre real.<br><br><strong>Hambre por hábito:</strong> aparece porque "es la hora en que siempre como", aunque acabemos de comer.<br><br>Podemos seguir nombrando distintas formas de acercarnos a la comida.<br><br><em>No estamos juzgando de ninguna manera: estamos tratando de reconocer con cuál de estas conductas, u otras que vayan apareciendo, me identifico.</em>', prompt: 'Antes de comer, registrá qué tipo de hambre sentiste: físico, emocional, por costumbre, aburrimiento o ansiedad. Contame qué identificaste.' },
      { day: 2, intro: 'Si ayer pudiste empezar a tomar conciencia de tu conducta con la comida, hoy te invito a seguir haciéndolo durante todas las comidas del día.<br><br>Si aparece una emoción (por ejemplo, enojo) y no podés evitar volver al hábito de ir a comer, no importa: simplemente anotalo.<br><br>Si en algún momento podés detener ese impulso, ¡genial! Contame también cómo fue.<br><br>La idea no es lograrlo a la perfección, sino empezar a comer con otro nivel de conciencia, sin juzgarte — solo observando qué pasa.', prompt: 'Contame qué pasó hoy al comer: ¿apareció alguna emoción antes de ir a comer? ¿Pudiste detener el impulso, o simplemente lo registraste?' },
      { day: 3, intro: 'Para hoy te propongo que organices tus comidas con anterioridad. ¿Qué vas a comer en cada comida del día? Esto te dará mayor seguridad para elegir, si aparece un tipo de hambre o conducta que quieras modificar.', prompt: 'Contame si organizar tus comidas con anterioridad te ayudó, o no.' },
      { day: 4, prompt: 'Comé lentamente y sentada/o. ¿Qué notaste al hacerlo distinto?' },
      { day: 5, intro: 'Te invito a planificar tus comidas del fin de semana.<br><br>El objetivo no es prohibir, controlar, ni estar todo el tiempo pensando en comidas.<br><br>Al principio, la planificación es una herramienta que previene respuestas automáticas.<br><br>Solamente saber si tenés una cena o un festejo; disfrutalo sin culpa, la propuesta es que organices el resto de las comidas.', prompt: 'Contame cómo te fue planificando tus comidas del fin de semana: ¿te dio más seguridad, o sentís que no te sirvió?' },
      { day: 6, prompt: 'En una sola palabra, ¿cómo definirías tu relación con la comida en estos últimos días?', hint: 'Rara, incómoda, fácil... lo que sientas.' },
      { day: 7, prompt: '¿Qué conductas identificás hoy que te dificultan avanzar hacia tus objetivos de cambiar hábitos saludables?' },
    ],
  },
  {
    stage: 2,
    stageRoman: 'II',
    title: 'Emociones y vínculos con la comida',
    titleRegular: 'Emociones y vínculos ',
    titleItalic: 'con la comida',
    headline: 'Empezar a cambiar actitudes con la comida',
    stageIntro: 'La primera etapa nos permitió identificar las conductas que nos gustaría modificar.<br><br>En esta segunda etapa vamos a observar y trabajar la relación entre las comidas cotidianas, reconociendo las emociones que aparecen. No para juzgarlas, sino para reconocerlas.<br><br>Si hacemos conscientes nuestros actos con las comidas, es más fácil elegir nuevas acciones.<br><br>Podemos empezar a cambiar actitudes con la comida.',
    subtitle: 'emociones y vínculos con la comida',
    completionMessage: '¡Terminaste la Etapa 2! Empezaste a mirar tus emociones y vínculos con la comida desde otro lugar. Seguí con la Etapa 3 para integrar todo lo que fuiste descubriendo.',
    days: [
      { day: 1, prompt: 'Cuando comés sola/o, ¿qué suele pasar? ¿Comés más, o menos? ¿Registrás tu estado emocional en esos momentos?' },
      { day: 2, intro: 'Una vez que podamos identificar ese alimento o comida que nos transporta a un momento feliz, podemos entender que muchas de nuestras preferencias alimentarias nacen en la infancia. Si un alimento estuvo asociado a momentos de cariño, celebración, contención o felicidad, es normal que siga ocupando un lugar fundamental en nuestra cultura culinaria.<br><br>Es por eso que, ante situaciones tristes, de estrés, etc., volvemos a ese sabor que emocionalmente nos hizo sentir tan bien en otro momento.<br><br>Cuando entendemos por qué lo elegimos, podemos decidir conscientemente cuándo disfrutarlos, o cuándo buscar otras formas de responder a nuestras emociones.', prompt: 'Elegí un alimento o comida que te transporte a un momento feliz de tu infancia. ¿Cuál es, y qué recuerdo trae?' },
      { day: 3, prompt: 'Registrá tu estado emocional cuando comés con amigos, y tu conducta con la comida.' },
      { day: 4, prompt: 'Registrá tu estado emocional y tu conducta con la comida cuando comés en familia.' },
      { day: 5, prompt: 'Registrá dos alimentos que en tu historia alimentaria hayas considerado prohibidos, y por qué (qué creencias hay detrás).' },
      { day: 6, intro: 'No hay alimentos prohibidos, sino que según el momento, la salud y los objetivos de cada persona pueden requerir un consumo diferente. El desafío es conocernos para elegir con conciencia, sin culpa, respetando el momento evolutivo de nuestra vida y nuestra salud.<br><br>Si tu salud lo permite y no existe contraindicación médica, elegí uno de esos alimentos que consideres prohibido, consumilo de manera consciente, sin culpa, y prestando atención a lo que aparece…', prompt: 'Contame cómo fue esa experiencia: ¿qué apareció al hacerlo?' },
      { day: 7, intro: 'Hacé una lista de 5 acciones que te hagan sentir bien, que no incluyan comer.<br>Ej: caminar, escuchar música, leer, etc.<br><br>Si hoy aparece una emoción que ya reconocés y que habitualmente calmás con comida, te propongo hacer una pausa de 5 minutos y elegir una de las acciones que escribiste.', prompt: 'Escribí tu lista de 5 acciones, y registrá cómo te sentiste.' },
    ],
  },
  {
    stage: 3,
    stageRoman: 'III',
    title: 'Integración y cierre',
    titleRegular: 'Integración y ',
    titleItalic: 'cierre',
    headline: 'Integración y cierre',
    stageIntro: 'Llegaste a la tercera etapa. Ya reconociste cómo es tu relación con la comida, y cuáles son las emociones que influyen en tus elecciones.<br><br>Ahora es momento de transformar ese conocimiento en acciones concretas.<br><br>No buscamos la perfección, sino pequeños pasos que, repetidos cada día, se conviertan en nuevos hábitos.',
    completionMessage: 'Completaste las 3 etapas de este diario. Recorriste un camino de escucha y reconciliación con tu cuerpo — gracias por confiar en el proceso.',
    days: [
      { day: 1, intro: 'Te invito a realizar una pausa antes de cada comida: un minuto alcanza para interrumpir el piloto automático y elegir con mayor conciencia. En esa pausa, preguntate qué aparece: ¿hambre físico o emocional?<br><br>¿Cuántas veces comemos algo sin registrarlo, sin darnos cuenta?<br><br>Este ejercicio es para tomar conciencia del acto de comer.', prompt: 'Contame cómo fue hacer esa pausa antes de comer: ¿qué identificaste en cada comida?' },
      { day: 2, intro: 'Mientras tu nuevo hábito se fortalece, ayudate creando un entorno a tu favor.<br><br>Mantené la heladera y la alacena organizadas con alimentos que acompañen tus objetivos.<br><br>Recordá que la mayoría de las veces comemos lo que tenemos disponible y lo que elegimos comprar. Por eso la lista de compras, que se trabaja en consulta, es prioridad.', prompt: 'Si querés, hacé una lista con los alimentos que considerás que no pueden faltar en tu alacena.' },
      { day: 3, intro: 'Elegí una o todas las comidas del día y realizalas sin celular, sin TV, ni ninguna pantalla.', prompt: 'Registrá cómo te sentís.' },
      { day: 4, intro: 'El registro de comidas es una herramienta que no se adapta a todos los casos: puede hacer que la atención se centre demasiado en la comida.<br><br>Sin embargo, por un día nos permite observar nuestros hábitos, hacerlos conscientes y seguir en el camino de su transformación.<br><br>Es muy útil realizarlo a lo largo del tiempo, una vez por semana. Esto nos permite mirar con perspectiva el cambio en nuestros hábitos, los pequeños avances.', prompt: 'Registrá todo lo que comiste hoy.' },
      { day: 5, intro: 'Si tu respuesta es sí, el primer objetivo puede ser elegirlo con más conciencia, cambiar a opciones que te nutran mejor, y paso a paso ir prescindiendo de él.<br><br>No buscamos pasar de todo a nada. Buscamos pasar del automático a la elección consciente.', prompt: 'Registrá si en tu día, ya organizado, hay lugar para el picoteo.' },
      { day: 6, intro: 'No se trata solo de contar comidas, sino de cómo llegás a tu próxima comida. De esto depende si nos suma realizar 3, 4 o 5 comidas al día.<br><br>Cada persona tiene un ritmo, horarios y costumbres distintas para organizar sus comidas — todo esto hay que tenerlo en cuenta.', prompt: 'Registrá cuántas comidas realizás por día, y si coinciden con tu necesidad física y emocional. ¿Salteás comidas? ¿Hacés muchas comidas al día, casi un continuado?' },
      { day: 7, intro: 'Recordá que los grandes cambios se construyen con pequeñas acciones repetidas. El objetivo no es hacerlo perfecto, sino avanzar hacia una relación más consciente y saludable con la comida.', prompt: 'Escribí una acción que consideres que necesitás seguir practicando para que este cambio sea posible.' },
    ],
  },
];

export function findStage(stageNumber) {
  return STAGES.find((s) => s.stage === stageNumber) || null;
}

// Ícono distinto por etapa: I = tallo/brote, II = hoja, III = flecha circular (ciclo/renovación).
const STAGE_ICONS = {
  1: 'stage-icon-1-tallo.png',
  2: 'stage-icon-2-hojas.png',
  3: 'stage-icon-3-flecha.png',
};

export function stageIconPath(stageNumber) {
  return `assets/logo/${STAGE_ICONS[stageNumber] || STAGE_ICONS[1]}`;
}

// El ícono de la Etapa I (tallo) es más achatado que los otros dos,
// así que necesita más ancho para verse del mismo tamaño visual.
const STAGE_ICON_WIDTHS = { 1: 1.4, 2: 1, 3: 1 };

export function stageIconWidth(stageNumber, baseWidth) {
  return Math.round(baseWidth * (STAGE_ICON_WIDTHS[stageNumber] || 1));
}
