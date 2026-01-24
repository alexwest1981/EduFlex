# EduFlex Helm Deployment

This directory contains the Helm chart for deploying the EduFlex application stack on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure

## Installation

1. **Verify `values.yaml`**:
   Adjust `helm/eduflex/values.yaml` for your environment. Check:
   - `global.domain`
   - Resources (CPU/Memory)
   - Persistence settings (Postgres, MinIO, Prometheus, Grafana)

2. **Install the Chart**:
   ```bash
   cd helm/eduflex
   helm install eduflex . -n eduflex --create-namespace
   ```

3. **Upgrade**:
   ```bash
   helm upgrade eduflex . -n eduflex
   ```

## Configuration

### Secrets
Secrets are currently managed in `templates/secrets.yaml`. For production, consider using external secret management or overriding via `--set`.

Inside `values.yaml`, you can configure:

### Monitoring
Prometheus and Grafana are enabled by default.
- **Prometheus** scrapes pods with proper annotations.
- **Grafana** is pre-configured with a datasource (needs verification) and admin password (default: `admin` in `secrets.yaml`).

### Persistence
The following components use Persistent Volumes:
- PostgreSQL
- MinIO
- Prometheus (if enabled)
- Grafana (if enabled)

## Accessing Services

- **Frontend**: https://eduflex.se (via Ingress)
- **Backend API**: https://api.eduflex.se (via Ingress)
- **Grafana**: Port-forward or configure Ingress.
  ```bash
  kubectl port-forward svc/eduflex-grafana 3000:3000 -n eduflex
  ```
  Login with `admin` / `admin` (or updated secret).

