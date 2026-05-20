# Graphify queries — sync, auth, and enrollment errors

Run from `artifacts/lista` (or path where `graphify-out/graph.json` exists):

```powershell
cd artifacts/lista
```

If you see `No matching nodes found`, index the app first (command depends on graphify version):

```powershell
# graphify ≥0.8 (if installed)
graphify update .

# or project-specific index script, if documented in repo
```

## Core sync flows

```
graphify query "syncTraineeSideEffects auth-trainee-sync ensurePublicTraineeUser"
graphify query "registerTraineeFromForm registerTraineeViaApiFallback prepareEnrollmentForInsforge"
graphify query "fetchTraineeProfileBundle fetchTraineeEnrollmentByEmail mergeTraineeProfileSources"
graphify query "resolveTraineeRegistrationFromCloud isRegistered reg_ localStorage"
```

## Auth & OAuth

```
graphify query "completeOAuthCallback signInWithOAuth auth-callback lista_session"
graphify query "applySessionPayload ensureAccessToken authHeadersAsync"
graphify query "requireAuth assertEmailAccess trainees register"
```

## API server

```
graphify query "registerSchema Zod enrollmentValuesFromRegister trainees register"
graphify query "GET profile email trainees 404"
graphify path "registration.tsx" "registerTraineeFromForm"
graphify path "auth-context" "trainee/register"
```

## UI surfaces (errors / toasts)

```
graphify query "registration cloud sync toast error"
graphify query "profile cloudError profileSource merged local"
graphify query "trainee-layout isRegistered redirect register"
```

## Staff / admin

```
graphify query "staff enrollments fetchEnrollments admin users"
graphify explain "isRegistered"
graphify explain "prepareEnrollmentForInsforge"
```

## After code changes

Re-index, then:

```
graphify query "<file you changed> <behavior you fixed>"
```

Paste subgraph file list into PR description.
