// Base general de "Selección de alimentos".
// La profesional tilda, por cada paciente, qué opciones de cada alimento
// aplican para esa persona. El paciente solo ve las opciones tildadas.
// No cambies los "id" una vez que haya pacientes con selecciones guardadas,
// o vas a perder la referencia con lo ya tildado.

export const FOOD_GROUPS = [
  {
    id: 'g1',
    name: 'Grupo 1: Lácteos',
    items: [
      {
        id: 'g1-leche',
        name: 'Leche',
        options: ['Descremada', 'Parcialmente descremada', 'Entera', 'Sola', 'Con infusiones', 'Con cacao común o dietético'],
      },
      {
        id: 'g1-yogur',
        name: 'Leche cultivada o yogur',
        options: ['Entero', 'Descremado', 'Natural', 'Saborizado', 'Con agregado de frutas', 'Con copos de cereal'],
      },
      {
        id: 'g1-queso',
        name: 'Queso',
        options: [
          'Blanco', 'Ricota', 'Cottage', 'Mozzarella', 'San Regín', 'Port Salud',
          'Fresco o similares magros', 'De máquina', 'Edam o Tilsit', 'Regianito',
          'Solo', 'Fundido', 'Con pan', 'Con galletitas', 'En preparaciones',
        ],
      },
    ],
  },
  {
    id: 'g2',
    name: 'Grupo 2: Carnes y huevos',
    items: [
      {
        id: 'g2-carnes',
        name: 'Carnes',
        options: [
          'Vacuna magra (nalga, peceto, lomo, cuadril, paleta)', 'Ave sin piel',
          'Pescado fresco (merluza, brótola, pejerrey, salmón)', 'Envasado al natural',
          'Mariscos', 'Bivalvos', 'Calamares', 'Langostinos', 'Cerdo (cortes magros)', 'Cordero (cortes magros)',
        ],
      },
      {
        id: 'g2-carnes-prep',
        name: 'Formas de preparación de la carne',
        options: [
          'Asada a la parrilla', 'Al horno', 'A la plancha', 'Al spiedo',
          'Hervida', 'A la cacerola', 'Puchero', 'Cazuela dietética',
          'Con salsa de tomate', 'Con salsa portuguesa', 'Con salsa blanca',
          'Picada: rellenos', 'Albóndigas', 'Hamburguesas caseras', 'Salpicones',
          'Pasteles', 'Budines', 'Croquetas al horno', 'Milanesas al horno',
        ],
      },
      {
        id: 'g2-fiambres',
        name: 'Fiambres',
        options: [
          'Jamón crudo desgrasado', 'Jamón cocido desgrasado', 'Paleta', 'Pastrón',
          'Lomito ahumado', 'Salchichas de viena dietéticas', 'Sueltas', 'Salamín',
        ],
      },
      {
        id: 'g2-huevos',
        name: 'Huevos',
        options: ['Entero', 'Clara'],
      },
      {
        id: 'g2-huevos-prep',
        name: 'Formas de preparación del huevo',
        options: [
          'Pasado por agua', 'Poché', 'Duro', 'Revuelto con vegetales',
          'En ensaladas', 'En budines', 'Soufflé', 'Tortilla horneada',
          'Frito', 'Omelet (en teflón o con spray dietético)',
        ],
      },
    ],
  },
  {
    id: 'g3',
    name: 'Grupo 3: Vegetales, legumbres y frutas',
    items: [
      {
        id: 'g3-vegetales-a',
        name: 'Vegetales "A"',
        options: [
          'Acelga', 'Achicoria', 'Apio', 'Berenjena', 'Berro', 'Brócoli', 'Cardo',
          'Col o repollo blanco', 'Col o repollo colorado', 'Coliflor', 'Colinabo',
          'Endivia', 'Escarola', 'Espárrago', 'Espinaca', 'Hinojo', 'Hongos o champiñones',
          'Lechuga', 'Palmito', 'Pepino', 'Rábano', 'Rabanito', 'Tomate', 'Verdolaga',
          'Zapallito', 'Zuccini',
        ],
      },
      {
        id: 'g3-vegetales-b',
        name: 'Vegetales "B"',
        options: [
          'Ají', 'Alcaucil', 'Bledo', 'Brotes', 'Brócoli', 'Calabaza', 'Cebolla',
          'Cebolla de verdeo', 'Coliflor', 'Repollitos de Bruselas', 'Chauchas',
          'Echalotte', 'Nabo', 'Perejil', 'Puerro', 'Remolacha', 'Zanahoria', 'Zapallo',
        ],
      },
      {
        id: 'g3-vegetales-c',
        name: 'Vegetales "C"',
        options: ['Batata', 'Choclo', 'Ñame', 'Papa', 'Palta'],
      },
      {
        id: 'g3-legumbres',
        name: 'Legumbres',
        options: ['Arvejas', 'Haba', 'Garbanzo', 'Lenteja', 'Poroto de manteca', 'Poroto de soja'],
      },
      {
        id: 'g3-veg-leg-prep',
        name: 'Formas de preparación de vegetales y legumbres',
        options: [
          'Crudos', 'Al vapor', 'Hervidos', 'Asados al horno', 'En puré', 'Solos',
          'En ensaladas', 'En rellenos', 'Con salsas dietéticas', 'En tortillas y croquetas al horno',
          'En soufflé', 'En budín', 'Con cuerpos grasos permitidos',
        ],
      },
      {
        id: 'g3-frutas-1',
        name: 'Frutas "1"',
        options: ['Frutilla', 'Grosella', 'Guinda', 'Lima', 'Limón', 'Melón', 'Sandía'],
      },
      {
        id: 'g3-frutas-2',
        name: 'Frutas "2"',
        options: ['Ciruela', 'Frambuesa', 'Mandarina', 'Melón rocío de miel', 'Mora', 'Naranja', 'Níspero', 'Papaya', 'Pomelo', 'Quinoto', 'Kiwi'],
      },
      {
        id: 'g3-frutas-3',
        name: 'Frutas "3"',
        options: ['Ananá', 'Cereza', 'Damasco', 'Durazno', 'Granada', 'Guayaba', 'Higo', 'Mango', 'Manzana verde', 'Manzana deliciosa', 'Membrillo', 'Pera', 'Zarzamora'],
      },
      {
        id: 'g3-frutas-4',
        name: 'Frutas "4"',
        options: ['Banana', 'Chirimoya', 'Kaki', 'Mamón', 'Mango', 'Uva'],
      },
      {
        id: 'g3-frutas-secas',
        name: 'Frutos secos',
        options: ['Avellanas', 'Almendras', 'Castañas de cajú', 'Maní', 'Nueces'],
      },
      {
        id: 'g3-frutas-disecadas',
        name: 'Frutas disecadas',
        options: ['Orejones de durazno', 'Orejones de damasco', 'Dátiles', 'Pasas de uva', 'Ciruelas', 'Manzanas', 'Peras'],
      },
      {
        id: 'g3-frutas-prep',
        name: 'Formas de preparación (frutas)',
        options: [
          'Crudas con cáscara', 'Crudas sin cáscara', 'Cocidas al vapor', 'En compota', 'Al horno',
          'En puré', 'En ensaladas', 'Con gelatina común', 'Con gelatina dietética', 'Con crema',
          'Con queso blanco', 'Envasadas comunes', 'Envasadas dietéticas',
        ],
      },
    ],
  },
  {
    id: 'g4',
    name: 'Grupo 4: Cereales, pastas y panes',
    items: [
      {
        id: 'g4-cereales',
        name: 'Cereales',
        options: ['Copos de cereal (tipo corn flakes)', 'Arroz pulido', 'Arroz integral', 'Cebada perlada', 'Trigo', 'Maíz', 'Sémola', 'Mijo', 'Avena'],
      },
      {
        id: 'g4-pastas',
        name: 'Pastas',
        options: [
          'Fideos secos', 'Tallarines', 'Ñoquis de papa', 'Ñoquis de sémola', 'Canelones',
          'Ravioles', 'Agnolotis', 'Capeletis', 'Lasaña de verdura y ricota', 'Pizza', 'Empanadas',
        ],
      },
      {
        id: 'g4-pastas-prep',
        name: 'Forma de preparación de las pastas',
        options: [
          'Con aceite', 'Con margarina común', 'Con margarina dietética', 'Con manteca común',
          'Con manteca dietética', 'Con salsas comunes', 'Con salsas dietéticas',
          'Con quesos descremados', 'Con queso rallado',
        ],
      },
      {
        id: 'g4-panes',
        name: 'Panes',
        options: ['Blanco francés', 'Blanco árabe', 'Blanco alemán', 'Lactal', 'Negro de centeno', 'Con salvado', 'Integral'],
      },
      {
        id: 'g4-tostaditas',
        name: 'Tostaditas',
        options: ['Tostines blancos', 'Tostines integrales', 'Partytost', 'Cobitost', 'Minitost con sal', 'Minitost sin sal'],
      },
      {
        id: 'g4-galletitas',
        name: 'Galletitas',
        options: ['Sin sal', 'Integrales', 'De agua', 'De arroz', 'Marineras', 'Grisines'],
      },
    ],
  },
  {
    id: 'g5',
    name: 'Grupo 5: Cuerpos grasos',
    note: 'Para limitar el uso de aceite, colocarlo en un pulverizador.',
    items: [
      {
        id: 'g5-grasos',
        name: 'Cuerpos grasos',
        options: [
          'Aceite de girasol', 'Aceite de maíz', 'Aceite de oliva', 'Aceite mezcla',
          'Mayonesa común', 'Mayonesa dietética', 'Manteca común', 'Manteca dietética',
          'Margarina común', 'Margarina dietética', 'Crema de leche', 'Fritolin o similares', 'Dietrafrit o similares',
        ],
      },
    ],
  },
  {
    id: 'g6',
    name: 'Grupo 6: Azúcares y dulces',
    items: [
      {
        id: 'g6-azucar',
        name: 'Azúcar',
        options: ['Azúcar común'],
      },
      {
        id: 'g6-endulzantes',
        name: 'Endulzantes artificiales',
        options: ['Nutrasweet', 'Amidulce', 'Tibaldi Sweet', 'Hileret Sweet'],
      },
      {
        id: 'g6-dulces',
        name: 'Dulces',
        options: [
          'De leche', 'De frutas', 'De batata', 'De membrillo', 'Miel de abejas',
          'Jaleas caseras', 'Jaleas comerciales', 'Dulce dietético Beck', 'Dulce dietético Bonafide',
          'Dulce dietético Campagnola', 'Dulce dietético Canale', 'Dulce dietético CEFA',
          'Dulce dietético Dr. Miklos', 'Dulce dietético Hilo de Oro', 'Dulce dietético La Mexicana',
          'Dulce dietético Lheritier compactos',
        ],
      },
    ],
  },
  {
    id: 'g7',
    name: 'Grupo 7: Misceláneas',
    items: [
      {
        id: 'g7-sal',
        name: 'Sal de mesa',
        options: ['Sal de mesa'],
      },
      {
        id: 'g7-sustitutos-sal',
        name: 'Sustitutos de la sal',
        options: ['Sal de apio', 'Ajo en polvo', 'Cebolla en polvo', 'Perejil en polvo', 'Sales de potasio y magnesio'],
      },
      {
        id: 'g7-condimentos',
        name: 'Condimentos',
        options: [
          'Ajo', 'Albahaca', 'Azafrán', 'Clavo de olor', 'Curry', 'Hierbas aromáticas',
          'Jugo de limón', 'Laurel', 'Menta', 'Nuez moscada', 'Mostaza en polvo', 'Orégano',
          'Salvia', 'Estragón', 'Páprika', 'Perejil', 'Pimienta blanca', 'Pimienta negra',
          'Tomillo', 'Vinagre de manzana', 'Salsa mostaza', 'Salsa ketchup', 'Salsa golf', 'Queso de rallar',
        ],
      },
      {
        id: 'g7-caldos',
        name: 'Caldos',
        options: ['Comerciales comunes', 'Comerciales dietéticos', 'De verduras frescas', 'De verduras deshidratadas', 'Instantáneos comunes', 'Instantáneos dietéticos', 'Con sal', 'Sin sal'],
      },
      {
        id: 'g7-infusiones',
        name: 'Infusiones',
        options: [
          'Café', 'Café descafeinado', 'Malta', 'Mate en bombilla', 'Mate cocido', 'Té',
          'Tisana de boldo', 'Tisana de manzanilla', 'Tisana de menta', 'Tisana de rosa mosqueta',
          'Tisana de tilo', 'Tisana de peperina',
        ],
      },
      {
        id: 'g7-bebidas',
        name: 'Bebidas',
        options: [
          'Agua', 'Agua mineral', 'Soda', 'Gaseosas comunes', 'Gaseosas dietéticas',
          'Jugos naturales', 'Jugos comerciales comunes', 'Jugos comerciales dietéticos',
          'Amargo serrano', 'Terma común', 'Terma light', 'Vinos', 'Champagne', 'Licores',
          'Bebidas blancas', 'Whisky',
        ],
      },
      {
        id: 'g7-gelatina',
        name: 'Gelatina dietética',
        options: ['Cualquier sabor'],
      },
      {
        id: 'g7-salvado',
        name: 'Salvado de avena y trigo',
        options: ['Salvado de avena', 'Salvado de trigo'],
      },
    ],
  },
];

export function findItem(itemId) {
  for (const group of FOOD_GROUPS) {
    const item = group.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}
