---
name: deploy-terraform
description: Провижининг облачной инфраструктуры через Terraform/OpenTofu — модули, remote state, переменные, план перед применением. Использовать на «напиши terraform для VPC/RDS/EKS», «настрой remote state», «как разбить на модули», «terraform plan в CI». Не про манифесты внутри уже готового кластера — то deploy-kubernetes.
---

# deploy-terraform

## Структура модулей

Корневой `main.tf` не описывает ресурсы напрямую, а собирает модули: `vpc`,
`security-group`, `rds`, `alb`, `iam`, `autoscaling` — каждый в своей папке
`modules/<имя>` с собственными `variables.tf`/`outputs.tf`. Один модуль — один
слой инфраструктуры, не весь стек в одном файле.

Зависимость между модулями — через ссылку на output, не через голый
`depends_on`:

```hcl
module "rds" {
  source     = "./modules/aws-rds"
  subnet_ids = module.vpc.private_subnet_ids  # ссылка = зависимость сама собой
}
```

`depends_on` между модулями нужен, только когда прямой ссылки на атрибут нет
(например ресурс модуля создаётся, но его output модулю-потребителю не
передаётся) — Terraform строит граф зависимостей по ссылкам, лишний
`depends_on` только мешает параллельному планированию.

## Remote state

Локальный `terraform.tfstate` — не для команды и не для CI, конфликт
записи гарантирован. Backend с блокировкой обязателен:

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "project/${var.environment}.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

`key` — с окружением внутри пути (`state/dev.tfstate`, `state/prod.tfstate`),
не общий файл на все окружения. `dynamodb_table` — блокировка на время
apply, без неё два одновременных запуска (разработчик + CI) портят state.

## Переменные

Типизировать и помечать секреты:

```hcl
variable "db_password" {
  type      = string
  sensitive = true          # не попадёт в plan-вывод и логи CI
}

variable "instance_count" {
  type    = number
  default = 2
}
```

Нетипизированная `variable "X" {}` без `sensitive` на пароле — конкретный
антипаттерн, не образец для копирования: значение утечёт в `terraform plan`
вывод и в лог CI открытым текстом. Значения по окружениям — через
`dev.tfvars`/`prod.tfvars`, не через захардкоженные `default` на проде.

## Гейт CI: план, потом применение

Не гонять `apply` на каждый пуш вслепую. Паттерн: `plan` с кодом возврата,
`apply` только если план показал реальные изменения:

```bash
terraform plan -detailed-exitcode -out tfplan
# 0 = без изменений, 1 = ошибка, 2 = есть дрейф/изменения
```

Код `2` → изменения есть, тогда `terraform apply tfplan` (применяется именно
сохранённый план, не пересчитанный заново — план и то, что применяется,
не должны разойтись). Код `1` → пайплайн падает, `apply` не идёт. На прод —
план как артефакт для ревью перед `apply`, не автоматическое применение без
подтверждения (GitHub Environments с обязательным approve или аналог).

Секреты (`AWS_ACCESS_KEY_ID`, пароли) — через переменные окружения CI
(`TF_VAR_имя` или backend-config), не в `.tf`-файле. Тот же принцип, что в
`dev-ops`.

## OpenTofu

Открытый форк Terraform (после смены лицензии HashiCorp на BUSL) — тот же
HCL, совместимый CLI (`tofu` вместо `terraform`), тот же провайдерный
экосистема. Брать, если лицензия Terraform (BUSL — не открытый код с
какого-то порога использования) стоп-фактор для проекта, иначе разницы нет.

## Чек-лист перед apply

- [ ] backend с `dynamodb_table` (или аналог блокировки для не-AWS)
- [ ] все секретные переменные — `sensitive = true`
- [ ] переменные типизированы, не голое `variable "X" {}`
- [ ] значения окружения — в `.tfvars`, не в `default`
- [ ] `plan` сохранён в файл и применяется тем же файлом, не пересчитан заново
- [ ] на прод — ручное подтверждение перед `apply`, не auto-approve

## Соседи

Провижининг кластера — этот блок. Манифесты внутри уже поднятого
Kubernetes-кластера — `deploy-kubernetes`. Общий чек-лист прод-готовности
(не Terraform-специфичный) — `deployment-readiness`. Postgres-специфика
после того, как RDS/managed instance поднят — `db-postgres-best-practices`.

