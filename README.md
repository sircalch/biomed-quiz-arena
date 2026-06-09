## BioMedTools MX Core - Quiz Arena

Modulo academico de repaso, pretest/postest, evaluacion rapida y competencia formativa para Ingenieria Biomedica, ciencias de la salud, docentes y tecnicos biomedicos en formacion.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Banco local tipado en `data/questions.ts`
- API interna para preguntas, sesiones, ranking y estadisticas
- localStorage para ultimos resultados y estadisticas locales

### Funciones

- 100 preguntas: 10 categorias con 10 preguntas cada una
- Dificultad: basica, intermedia y avanzada
- Modo estudio: feedback inmediato con explicacion tecnica
- Modo reto: temporizador, puntaje y racha
- Modo examen: no revela respuestas hasta el final
- Resultado final con puntaje, porcentaje, racha maxima, nivel, fortalezas, areas a reforzar y recomendaciones
- Enlace a Case Simulator por categoria
- Enlace a Report Builder para generar evidencia de actividad

### Categorias

1. Equipos medicos basicos
2. Monitoreo de signos vitales
3. Bombas de infusion y terapia
4. Desfibrilador y urgencias
5. Esterilizacion y autoclave
6. Seguridad electrica hospitalaria
7. Bioseguridad basica
8. Proteccion radiologica basica
9. Ingenieria clinica y mantenimiento
10. Reportes tecnicos biomedicos

### Agregar preguntas

Edita `data/questions.ts` y agrega entradas con este formato:

```ts
{
  id: "categoria-01",
  category: "equipos-medicos",
  difficulty: "basic",
  question: "Texto de la pregunta",
  options: ["A", "B", "C", "D"],
  correctOptionIndex: 0,
  explanation: "Explicacion tecnica",
  relatedCaseId: "monitor-sin-spo2",
  relatedEquipment: "Monitor multiparametrico",
  sourceNote: "Material educativo"
}
```

### Integracion con Case Simulator

El resultado y el runner generan enlaces como:

```txt
NEXT_PUBLIC_CASE_SIMULATOR_URL?category=<categoria>
```

Case Simulator redirige esa categoria al caso recomendado.

### Integracion con Report Builder

El boton de evidencia usa:

```txt
NEXT_PUBLIC_REPORT_BUILDER_URL?activity=quiz&category=<categoria>&score=<puntaje>
```

Report Builder prellena un reporte correctivo educativo con esos datos.

### Uso docente

- Pretest: usar modo examen antes de clase/laboratorio.
- Repaso: usar modo estudio con explicaciones.
- Dinamica grupal: usar modo reto.
- Postest: repetir modo examen y comparar resultados.
- Evidencia: enviar resultado a Report Builder.

### Variables

```env
NEXT_PUBLIC_CASE_SIMULATOR_URL=https://biomed-case-simulator.vercel.app
NEXT_PUBLIC_REPORT_BUILDER_URL=https://clinical-report-builder.vercel.app
```

### Persistencia opcional (Supabase)

Si defines estas variables, sesiones y ranking usan Supabase. Sin variables, se usa memoria del proceso (ephemeral).

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_QUIZ_SESSIONS_TABLE` (opcional, default: `quiz_sessions`)

Schema sugerido: `supabase/schema.sql`

### Scripts

```bash
npm install
npm run dev
npm run build
```

### Deploy

Compatible con Vercel. Build command: `npm run build`.
