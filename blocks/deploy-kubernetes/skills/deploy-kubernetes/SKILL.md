---
name: deploy-kubernetes
description: Задеплоить приложение в Kubernetes — манифесты Pod/Deployment/Service/Ingress, health-пробы, ресурсы, безопасность. Использовать на «напиши деплоймент для k8s», «настрой ingress», «liveness/readiness», «HPA», «CrashLoopBackOff». Не для другого хостинга — deploy-vercel/deploy-render/deploy-azure-appservice/deploy-openship.
---

# deploy-kubernetes

Порт `kubernetes-deployment-best-practices.instructions.md` из
github/awesome-copilot (MIT), близко к тексту, адаптировано под формат SKILL.

## Базовые объекты

**Pod** - один инстанс процесса. Не деплоить Pod напрямую - через Deployment
или StatefulSet. Всегда задавать `resources` (requests/limits) и
`livenessProbe`/`readinessProbe`.

**Deployment** - управляет набором одинаковых Pod, отвечает за rolling update
и rollback. `replicas`, `selector`+`template`, `strategy.rollingUpdate` с
`maxSurge`/`maxUnavailable`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
spec:
  replicas: 3
  selector:
    matchLabels: { app: my-app }
  template:
    metadata:
      labels: { app: my-app }
    spec:
      containers:
        - name: my-app-container
          image: my-repo/my-app:1.0.0
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          livenessProbe:
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet: { path: /readyz, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 10
```

**Service** - стабильный сетевой адрес для набора Pod. `ClusterIP` для
внутренних сервисов, `LoadBalancer` для интернет-фейсинга в облаке.

**Ingress** - маршрутизация HTTP/HTTPS снаружи, TLS termination в одном месте.

## Конфигурация и секреты

ConfigMap - для несекретных данных, **не шифруется в etcd**, никогда не класть
туда чувствительное. Secret - для ключей/паролей/сертификатов, монтировать
файлом или через переменные окружения (осторожно с env-переменными). В проде -
интеграция с внешним секрет-менеджером (Vault, AWS/Azure Secrets Manager) через
External Secrets Operator.

## Health-пробы

Liveness - если падает, Kubernetes перезапускает контейнер. Readiness - если
падает, Pod убирается из балансировки, но не перезапускается. Настраивать
`initialDelaySeconds`/`periodSeconds`/`timeoutSeconds`/`failureThreshold`.

## Ресурсы и масштабирование

Requests - гарантированный минимум для планировщика. Limits - жёсткий максимум
против "шумных соседей". HPA масштабирует число реплик по CPU/кастомным
метрикам (`minReplicas`/`maxReplicas`/`targetCPUUtilizationPercentage`). VPA -
подбирает requests/limits по истории использования.

## Безопасность

- NetworkPolicy - deny by default, разрешать точечно.
- RBAC - минимальные права роли, привязанной к ServiceAccount.
- Pod Security Context: `runAsNonRoot: true`, `allowPrivilegeEscalation:
  false`, `readOnlyRootFilesystem: true`, `capabilities.drop: [ALL]`.
- Образы - минимальные доверенные базы (distroless/alpine), сканирование на
  уязвимости в CI (Trivy/Clair/Snyk), не использовать тег `:latest`.

## Стратегии деплоя

Rolling update - дефолт Deployment, `maxSurge`/`maxUnavailable` под контроль.
Blue-Green - две идентичные среды, переключение трафика атомарно, нужен
внешний балансировщик. Canary - постепенный перевод трафика через
service mesh или ingress с traffic-splitting. Откат - `kubectl rollout undo
deployment/<name>`.

## Чек-лист манифеста перед мерджем

- [ ] `resources` заданы для всех контейнеров
- [ ] `livenessProbe`/`readinessProbe` настроены
- [ ] секреты - через Secret, не ConfigMap
- [ ] `runAsNonRoot: true`, лишние `capabilities` сброшены
- [ ] образ не на теге `:latest`
- [ ] логи идут в STDOUT/STDERR

## Диагностика

Pod не стартует → `kubectl describe pod`, затем `kubectl logs`. Pod не готов →
проверить readinessProbe и порт, `kubectl describe service`. OOMKilled →
поднять `memory.limits` или профилировать приложение.

## Соседи

Другая платформа - `deploy-vercel`/`deploy-render`/`deploy-azure-appservice`/
`deploy-openship`. Общий чек-лист прод-готовности (не k8s-специфичный) -
`deployment-readiness`.

