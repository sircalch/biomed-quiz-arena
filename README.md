## BioMed Quiz Arena

MVP de quiz rapido para estudiantes de ingenieria biomedica.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- JSON local para preguntas
- API interna para sesiones, ranking y carga remota de preguntas

### Funciones del MVP

- Categorias de quiz
- 10 preguntas por categoria
- Puntaje sobre 100
- Racha actual y mejor racha
- Resultado final compartible

### Estructura principal

```txt
app/
  page.tsx
  categories/page.tsx
  quiz/[category]/page.tsx
  result/page.tsx
components/
  CategoryCard.tsx
  QuestionCard.tsx
  AnswerButton.tsx
  ProgressBar.tsx
  QuizRunner.tsx
  ScoreScreen.tsx
  ShareResultCard.tsx
data/
  questions.json
lib/
  quiz-engine.ts
  scoring.ts
types/
  quiz.ts
```

### Correr local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` o el puerto disponible.

### Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`

### API interna (App Router)

- `GET /api/quiz/questions` (`category`, `limit`, `shuffle`)
- `GET /api/quiz/sessions` (`category`, `limit`)
- `POST /api/quiz/sessions` registra una sesion de quiz
- `GET /api/quiz/stats` metrica global de sesiones
- `GET /api/quiz/leaderboard` ranking de sesiones

### Persistencia opcional (Supabase)

Si defines estas variables, sesiones y ranking usan Supabase.  
Sin variables, se usa memoria del proceso (ephemeral).

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_QUIZ_SESSIONS_TABLE` (opcional, default: `quiz_sessions`)

Schema sugerido: `supabase/schema.sql`

### Deploy

Recomendado en Vercel.
